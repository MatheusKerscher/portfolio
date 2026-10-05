/**
 * Snaps the pixel-art portrait to its grid and exports every asset derived from it, and the pixel
 * art drawn in scripts/assets/pixel-art.mjs.
 *
 *   node scripts/pixel-assets.mjs
 *   node scripts/pixel-assets.mjs --sheet=<out.png>
 *   node scripts/pixel-assets.mjs --icons=<out.png>
 *
 * The source is scripts/assets/portrait-art.jpeg, the art supplied by the owner of the site. The
 * sprite made from it is the single source of the avatar, the icons, the Open Graph render and,
 * along with the project screenshots, of the 8-bit thumbnails: running the script again
 * reproduces the same files, and replacing the art replaces all of them.
 *
 * --sheet writes a contact sheet for review (photo, art, sprite at 1×, 4× and 8× on both themes)
 * instead of the assets. --icons writes one of the icons of the 8-bit skin, its logos and its
 * cursors, on both themes.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import sharp from "sharp";
import { cursors, logos } from "./assets/pixel-art.mjs";

const ART = "scripts/assets/portrait-art.jpeg";
const SIZE = 92;
/** Transparency and the white of the outline included. */
const MAX_COLOURS = 32;
const WHITE = [255, 255, 255];

const THUMBNAIL = { width: 150, height: 90 };

/** The page tokens the sprite sits on. Icons have no theme, so the tile is the light `brand`. */
const TILE = "#137a3a";
const PAPER = { light: "#f8f7f3", dark: "#111111" };

// ---------------------------------------------------------------------------------------------
// Sprite

const median = (values) => values.sort((a, b) => a - b)[values.length >> 1];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * The art as 92×92 RGBA. A generated image only looks like pixel art: its "pixels" are uneven
 * blocks of a large JPEG. This takes one colour per cell of the real grid, cuts the flat
 * background out and reduces what is left to a palette.
 */
async function spriteFromArt() {
  const { data, info } = await sharp(ART)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cell = info.width / SIZE;
  const at = (x, y) => {
    const start = (y * info.width + x) * 3;
    return [data[start], data[start + 1], data[start + 2]];
  };

  // One colour per cell: the median of its middle half, which ignores the blurred edges.
  const colours = [];
  for (let cy = 0; cy < SIZE; cy += 1) {
    for (let cx = 0; cx < SIZE; cx += 1) {
      const samples = [[], [], []];
      for (let y = (cy + 0.25) * cell; y < (cy + 0.75) * cell; y += 1) {
        for (let x = (cx + 0.25) * cell; x < (cx + 0.75) * cell; x += 1) {
          at(Math.floor(x), Math.floor(y)).forEach((value, channel) =>
            samples[channel].push(value),
          );
        }
      }
      colours.push(samples.map(median));
    }
  }

  // The background is what is connected to the corners and made of their colour. A cell on the
  // edge of the white outline is a mix of the two, and goes with whichever it has more of.
  const background = colours[0];
  const towardsWhite = WHITE.map(
    (value, channel) => value - background[channel],
  );
  const isBackground = (colour) => {
    const offset = colour.map((value, channel) => value - background[channel]);
    const whiteness =
      dot(offset, towardsWhite) / dot(towardsWhite, towardsWhite);
    const mixed = towardsWhite.map((value) => value * whiteness);
    return whiteness < 0.75 && distance(offset, mixed) < 40;
  };
  const transparent = new Uint8Array(SIZE * SIZE);
  const queue = [0, SIZE - 1, SIZE * (SIZE - 1), SIZE * SIZE - 1];
  while (queue.length > 0) {
    const position = queue.pop();
    if (transparent[position] || !isBackground(colours[position])) continue;
    transparent[position] = 1;
    const x = position % SIZE;
    const y = (position - x) / SIZE;
    if (x > 0) queue.push(position - 1);
    if (x < SIZE - 1) queue.push(position + 1);
    if (y > 0) queue.push(position - SIZE);
    if (y < SIZE - 1) queue.push(position + SIZE);
  }

  // The sticker outline is pure white, whatever the JPEG made of it, and it is the only thing
  // that touches the background.
  const touchesBackground = (position) => {
    const x = position % SIZE;
    const y = (position - x) / SIZE;
    for (
      let ny = Math.max(y - 1, 0);
      ny <= Math.min(y + 1, SIZE - 1);
      ny += 1
    ) {
      for (
        let nx = Math.max(x - 1, 0);
        nx <= Math.min(x + 1, SIZE - 1);
        nx += 1
      ) {
        if (transparent[ny * SIZE + nx]) return true;
      }
    }
    return false;
  };
  const white = colours.map(
    (colour, position) =>
      !transparent[position] &&
      (Math.min(...colour) > 225 || touchesBackground(position)),
  );

  const palette = reduce(
    colours.filter((_, position) => !transparent[position] && !white[position]),
    MAX_COLOURS - 2,
  );
  const nearest = (colour) =>
    palette.reduce((best, candidate) =>
      distance(candidate, colour) < distance(best, colour) ? candidate : best,
    );

  const pixels = Buffer.alloc(SIZE * SIZE * 4);
  colours.forEach((colour, position) => {
    if (transparent[position]) return;
    pixels.set(
      [...(white[position] ? WHITE : nearest(colour)), 255],
      position * 4,
    );
  });
  return pixels;
}

/**
 * At most `count` colours that stand for all of `colours`. Pixel art has few real colours, each
 * with JPEG noise around it, so a colour joins the first one within reach, most frequent first.
 * sharp cannot do this: it caps a palette at a bit depth, 16 or 256 colours, and a split by
 * population (median cut) spends the palette on the noise of the large flat areas.
 */
function reduce(colours, count) {
  const frequency = new Map();
  for (const colour of colours) {
    const key = colour.join();
    frequency.set(key, (frequency.get(key) ?? 0) + 1);
  }
  const ordered = [...frequency]
    .sort(([a, timesA], [b, timesB]) => timesB - timesA || (a < b ? -1 : 1))
    .map(([key]) => key.split(",").map(Number));

  for (let reach = 8; ; reach += 1) {
    const palette = [];
    for (const colour of ordered) {
      if (!palette.some((kept) => distance(kept, colour) <= reach)) {
        palette.push(colour);
      }
    }
    if (palette.length <= count) return palette;
  }
}

// ---------------------------------------------------------------------------------------------
// Drawn art

const GRID = 16;

/** Refuses a drawing that is not 16×16 or uses a character its palette does not have. */
function checked(name, { grid, palette }) {
  const known = new Set([".", ...Object.keys(palette)]);
  const sound =
    grid.length === GRID &&
    grid.every(
      (line) =>
        line.length === GRID && [...line].every((cell) => known.has(cell)),
    );
  if (!sound) throw new Error(`${name} is not a ${GRID}×${GRID} drawing`);
  return { grid, palette };
}

const channels = (hex) =>
  [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));

/** A drawing as an image, one pixel per character. */
function drawn(name, art) {
  const { grid, palette } = checked(name, art);
  const pixels = Buffer.alloc(GRID * GRID * 4);
  grid.forEach((line, y) =>
    [...line].forEach((cell, x) => {
      if (cell === ".") return;
      pixels.set([...channels(palette[cell]), 255], (y * GRID + x) * 4);
    }),
  );
  return sharp(pixels, { raw: { width: GRID, height: GRID, channels: 4 } });
}

/** The icons of the interface, read from the component that draws them. */
async function interfaceIcons() {
  const source = await readFile("src/app/components/pixel-icons.ts", "utf8");
  return [
    ...source.matchAll(/export const (\w+): PixelGrid = \[([^\]]+)\]/g),
  ].map(([, name, rows]) => ({
    name,
    ...checked(name, {
      grid: [...rows.matchAll(/"([^"]+)"/g)].map(([, row]) => row),
      palette: { "#": "currentColor" },
    }),
  }));
}

// ---------------------------------------------------------------------------------------------
// Export

const rgba = await spriteFromArt();

/** Where the face sits on the grid, which the square crops of the icons depend on. */
const CROPS = {
  favicon: { left: 30, top: 24 },
  face: { left: 22, top: 11, size: 48 },
  apple: { left: 23, top: 12, size: 45 },
  bust: { left: 14, top: 6, size: 64 },
};

const sprite = () =>
  sharp(rgba, { raw: { width: SIZE, height: SIZE, channels: 4 } });
// No palette size: the sprite already has at most MAX_COLOURS.
const png = { palette: true, dither: 0, compressionLevel: 9 };

/** A square crop of the sprite on the tile, scaled by a whole factor. */
function tile({ left, top, size, scale }) {
  return sprite()
    .extract({ left, top, width: size, height: size })
    .flatten({ background: TILE })
    .resize(size * scale, size * scale, { kernel: "nearest" })
    .png(png);
}

/** A single PNG wrapped in the ICO container. */
function ico(image, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size === 256 ? 0 : size, 6);
  header.writeUInt8(size === 256 ? 0 : size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(image.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, image]);
}

async function write(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
  console.log(`  ${path} (${data.length} bytes)`);
}

async function exportAssets() {
  console.log("Sprite");
  await write("public/avatar/avatar.png", await sprite().png(png).toBuffer());
  // 5×: the Open Graph renderer cannot scale with nearest-neighbour.
  await write(
    "public/avatar/avatar-460.png",
    await sprite()
      .resize(SIZE * 5, SIZE * 5, { kernel: "nearest" })
      .png(png)
      .toBuffer(),
  );

  console.log("Icons");
  const { face } = CROPS;
  // Next decodes the ICO at build time and only accepts a 32-bit RGBA PNG inside it.
  await write(
    "src/app/favicon.ico",
    ico(
      await sprite()
        .extract({ ...CROPS.favicon, width: 32, height: 32 })
        .flatten({ background: TILE })
        .ensureAlpha()
        .png({ compressionLevel: 9 })
        .toBuffer(),
      32,
    ),
  );
  await write("src/app/icon.png", await tile({ ...face, scale: 2 }).toBuffer());
  await write(
    "src/app/apple-icon.png",
    await tile({ ...CROPS.apple, scale: 4 }).toBuffer(),
  );
  await write(
    "public/avatar/icon-192.png",
    await tile({ ...face, scale: 4 }).toBuffer(),
  );
  await write(
    "public/avatar/icon-512.png",
    await tile({ ...CROPS.bust, scale: 8 }).toBuffer(),
  );

  // The 8-bit version of every project thumbnail: 150×90 in 16 colours, shown enlarged with
  // `image-rendering: pixelated`.
  console.log("8-bit thumbnails");
  const projects = await readFile("src/app/data/projects.ts", "utf8");
  for (const [, path] of projects.matchAll(/"(\/thumbnails\/[^"]+\.png)"/g)) {
    await write(
      `public/thumbnails/8bit/${basename(path)}`,
      await sharp(`public${path}`)
        .resize(THUMBNAIL.width, THUMBNAIL.height, {
          fit: "cover",
          position: "top",
        })
        .png({ ...png, colours: 16 })
        .toBuffer(),
    );
  }

  console.log("8-bit logos");
  for (const [id, art] of Object.entries(logos)) {
    await write(
      `public/tech/8bit/${id}.png`,
      await drawn(id, art).png(png).toBuffer(),
    );
  }

  // 2×: a cursor is shown at the size of its image, and 16 px is too small to find.
  console.log("Cursors");
  for (const [name, art] of Object.entries(cursors)) {
    await write(
      `public/pixel/${name}.png`,
      await drawn(name, art)
        .resize(GRID * 2, GRID * 2, { kernel: "nearest" })
        .png(png)
        .toBuffer(),
    );
  }
}

async function exportSheet(output) {
  const photo = await sharp("public/images/matheus-kerscher.jpg")
    .resize(368, 368)
    .png()
    .toBuffer();
  const scaled = (scale) =>
    sprite()
      .resize(SIZE * scale, SIZE * scale, { kernel: "nearest" })
      .png()
      .toBuffer();
  const onTile = async (scale) =>
    sharp({
      create: {
        width: SIZE * scale,
        height: SIZE * scale,
        channels: 4,
        background: TILE,
      },
    })
      .composite([{ input: await scaled(scale) }])
      .png()
      .toBuffer();

  const gap = 24;
  const rowHeight = 736;
  const width = gap * 5 + 92 + 368 + 736 + 368;
  const height = gap * 4 + 368 + rowHeight * 2;
  const layers = [
    { input: photo, left: gap, top: gap },
    {
      input: await sharp(ART).resize(368, 368).png().toBuffer(),
      left: gap * 2 + 368,
      top: gap,
    },
    { input: await onTile(4), left: gap * 3 + 368 * 2, top: gap },
  ];
  for (const [index, theme] of ["light", "dark"].entries()) {
    const top = gap * 2 + 368 + index * (rowHeight + gap);
    layers.push({
      input: {
        create: {
          width,
          height: rowHeight,
          channels: 4,
          background: PAPER[theme],
        },
      },
      left: 0,
      top,
    });
    layers.push({ input: await onTile(1), left: gap, top });
    layers.push({ input: await onTile(4), left: gap * 2 + 92, top });
    layers.push({ input: await onTile(8), left: gap * 3 + 92 + 368, top });
    // Without the tile, as the avatar is stored.
    layers.push({
      input: await scaled(4),
      left: gap * 4 + 92 + 368 + 736,
      top,
    });
  }

  await sharp({
    create: { width, height, channels: 4, background: "#ffffff" },
  })
    .composite(layers)
    // 128 colours keep the sprite exact and the photo recognisable in a small file.
    .png({ palette: true, colours: 128 })
    .toFile(output);
  console.log(`Contact sheet: ${output}`);
}

/** Every drawing of the 8-bit skin on both themes, enlarged and at the size it is shown. */
async function exportIconSheet(output) {
  const INK = { light: "#111111", dark: "#fafafa" };
  const cell = 88;
  const pad = 24;
  const rows = [
    {
      title: "Icons — src/app/components/pixel-icons.ts (4× and 1×)",
      items: await interfaceIcons(),
      large: 4,
      small: 1,
    },
    {
      title: "Logos — public/tech/8bit/ (4× and 2×, the size on the page)",
      items: Object.entries(logos).map(([name, art]) => ({ name, ...art })),
      large: 4,
      small: 2,
    },
    {
      title: "Cursors — public/pixel/ (4× and 2×, the size on screen)",
      items: Object.entries(cursors).map(([name, art]) => ({ name, ...art })),
      large: 4,
      small: 2,
    },
  ];
  const columns = Math.max(...rows.map((row) => row.items.length));
  const width = pad * 2 + columns * cell;
  const rowHeight = 28 + GRID * 4 + 12 + GRID * 2 + 30;
  const themeHeight = pad + rows.length * rowHeight;

  const pixels = ({ grid, palette }, left, top, scale, ink) =>
    grid
      .flatMap((line, y) =>
        [...line].map((character, x) =>
          character === "."
            ? ""
            : `<rect x="${left + x * scale}" y="${top + y * scale}" width="${scale}" height="${scale}" fill="${palette[character] === "currentColor" ? ink : palette[character]}"/>`,
        ),
      )
      .join("");

  const parts = [];
  for (const [index, theme] of ["light", "dark"].entries()) {
    const ink = INK[theme];
    const offset = index * themeHeight;
    parts.push(
      `<rect x="0" y="${offset}" width="${width}" height="${themeHeight}" fill="${PAPER[theme]}"/>`,
    );
    rows.forEach((row, rowIndex) => {
      const top = offset + pad + rowIndex * rowHeight;
      parts.push(
        `<text x="${pad}" y="${top + 12}" font-size="13" font-weight="700" fill="${ink}">${row.title}</text>`,
      );
      row.items.forEach((item, column) => {
        const left = pad + column * cell;
        parts.push(pixels(item, left, top + 28, row.large, ink));
        parts.push(
          pixels(item, left, top + 28 + GRID * 4 + 12, row.small, ink),
        );
        parts.push(
          `<text x="${left}" y="${top + rowHeight - 10}" font-size="10" fill="${ink}">${item.name}</text>`,
        );
      });
    });
  }

  await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${themeHeight * 2}" shape-rendering="crispEdges" font-family="Menlo, monospace">${parts.join("")}</svg>`,
    ),
  )
    .png()
    .toFile(output);
  console.log(`Icon sheet: ${output}`);
}

const options = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, value = "true"] = argument.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

if (options.sheet) await exportSheet(options.sheet);
else if (options.icons) await exportIconSheet(options.icons);
else await exportAssets();
