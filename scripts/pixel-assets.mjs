/**
 * Draws the pixel-art portrait and exports every asset derived from it.
 *
 *   node scripts/pixel-assets.mjs
 *   node scripts/pixel-assets.mjs --sheet=<out.png> [--reference=<style-reference.png>]
 *
 * The sprite is drawn on a 92×92 grid, the grid of the style reference, from a fixed palette. It
 * is the single source: the avatar, the icons, the Open Graph render and the 8-bit thumbnails are
 * all generated here, so running it again reproduces the same files.
 *
 * --sheet writes a contact sheet for review (photo, reference, sprite at 1×, 4× and 8× on both
 * themes) instead of the assets.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import sharp from "sharp";

const SIZE = 92;

/** Index 0 is transparent. Keep the list at 32 colours or fewer. */
const PALETTE = {
  none: [0, 0, 0, 0],
  ink: "#111111",
  white: "#ffffff",
  skin: "#f0bf9d",
  skinLight: "#f9d9ba",
  skinShade: "#dc9d7c",
  skinDeep: "#b8775a",
  skinLine: "#6e3f2f",
  hair: "#3b2b22",
  hairLight: "#5c4536",
  hairDark: "#231813",
  lens: "#d9ebf0",
  eyeWhite: "#f6f2ea",
  iris: "#3a2416",
  mouth: "#a8514f",
  shirt: "#28345a",
  shirtLight: "#3b4b7c",
  shirtDark: "#1a2340",
  button: "#a3acc4",
};

const NAMES = Object.keys(PALETTE);
const INDEX = Object.fromEntries(NAMES.map((name, index) => [name, index]));
const RGBA = NAMES.map((name) => {
  const value = PALETTE[name];
  if (Array.isArray(value)) return value;
  return [1, 3, 5]
    .map((start) => parseInt(value.slice(start, start + 2), 16))
    .concat(255);
});

const THUMBNAIL = { width: 150, height: 90 };

/** The page tokens the sprite sits on. */
const YELLOW = "#f0da50";
const PAPER = { light: "#f8f7f3", dark: "#111111" };

// ---------------------------------------------------------------------------------------------
// Drawing

const grid = new Uint8Array(SIZE * SIZE);
/** Everything is drawn 3 px lower than its coordinates, to leave room for the outline above. */
const OFFSET_Y = 3;

const inside = (x, y) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;
const get = (x, y) => (inside(x, y) ? grid[y * SIZE + x] : 0);
const is = (x, y, ...names) => names.some((name) => get(x, y) === INDEX[name]);

function set(x, y, name) {
  if (inside(x, y)) grid[y * SIZE + x] = INDEX[name];
}

/** Paints every pixel for which `test(x, y)` holds; `only` restricts it to pixels of those colours. */
function paint(name, test, only) {
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (only && !is(x, y, ...only)) continue;
      if (test(x, y - OFFSET_Y)) set(x, y, name);
    }
  }
}

const ellipse = (cx, cy, rx, ry) => (x, y) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const rect = (x0, y0, x1, y1) => (x, y) =>
  x >= x0 && x <= x1 && y >= y0 && y <= y1;
const either =
  (...tests) =>
  (x, y) =>
    tests.some((test) => test(x, y));
/** The same shape on both sides of the vertical axis of the face (between columns 45 and 46). */
const mirrored = (test) => either(test, (x, y) => test(91 - x, y));

/** Even-odd polygon test on pixel centres. */
const polygon = (points) => (x, y) => {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (
      yi > y + 0.5 !== yj > y + 0.5 &&
      x + 0.5 < ((xj - xi) * (y + 0.5 - yi)) / (yj - yi) + xi
    ) {
      hit = !hit;
    }
  }
  return hit;
};

const pixels = (name, list) =>
  list.forEach(([x, y]) => set(x, y + OFFSET_Y, name));
const row = (name, y, x0, x1) => {
  for (let x = x0; x <= x1; x += 1) set(x, y + OFFSET_Y, name);
};
const mirrorRow = (name, y, x0, x1) => {
  row(name, y, x0, x1);
  row(name, y, 91 - x1, 91 - x0);
};

function drawSprite() {
  // Shirt: shoulders that run off the bottom edge, like the reference.
  paint(
    "shirt",
    polygon([
      [30, 72],
      [62, 72],
      [79, 79],
      [82, 92],
      [10, 92],
      [13, 79],
    ]),
  );
  paint(
    "shirtDark",
    mirrored(
      polygon([
        [13, 79],
        [21, 76],
        [17, 92],
        [10, 92],
      ]),
    ),
    ["shirt"],
  );

  // Neck, and the chest inside the open collar.
  paint("skin", rect(40, 60, 51, 73));
  paint(
    "skin",
    polygon([
      [40, 72],
      [52, 72],
      [46, 81],
    ]),
  );

  // Collar flaps with a shadow under them, placket and a button.
  const collar = mirrored(
    polygon([
      [39, 69],
      [32, 73],
      [36, 83],
      [45, 79],
      [41, 73],
    ]),
  );
  paint("shirtLight", collar);
  paint("shirtDark", (x, y) => collar(x, y - 1) && !collar(x, y), ["shirt"]);
  paint("shirtDark", rect(45, 83, 46, 91), ["shirt"]);
  pixels("button", [
    [45, 86],
    [46, 86],
    [45, 87],
    [46, 87],
  ]);

  // Head: a cranium and a narrower jaw. Ears behind the temples of the glasses.
  const head = either(ellipse(45.5, 39, 15.5, 17), ellipse(45.5, 47, 12.6, 18));
  paint("skin", mirrored(ellipse(29.6, 45, 2.6, 4.6)));
  paint("skinShade", mirrored(ellipse(29.9, 45.5, 1.2, 2.6)), ["skin"]);
  paint("skin", head);

  // The chin casts a shadow on the neck that follows its curve.
  paint("skinShade", (x, y) => head(x, y - 7) && !head(x, y), ["skin"]);
  paint("skinDeep", (x, y) => head(x, y - 3) && !head(x, y), ["skinShade"]);

  // Shade on the cheeks and the jaw, light on the forehead.
  const core = either(ellipse(45.5, 39, 14.2, 17), ellipse(45.5, 46, 11, 17.6));
  paint("skinShade", (x, y) => head(x, y) && !core(x, y) && y > 44, ["skin"]);
  paint("skinLight", ellipse(45.5, 31, 8, 2.6), ["skin"]);

  // Hair: short. A cap a little larger than the head, so the sides show as a thin strip, and
  // more volume on top, brushed up towards the front.
  const hairline = (x) => 25 + Math.round((Math.abs(x - 45.5) / 14) ** 2 * 2);
  const cap = either(
    ellipse(45.5, 30.5, 17, 18.5),
    ellipse(48.5, 21.5, 12, 10.5),
  );
  const hair = (x, y) =>
    cap(x, y) && y <= 39 && (y < hairline(x) || !head(x, y));
  paint("hair", hair);
  paint("hair", mirrored(rect(31, 33, 32, 40)));
  paint(
    "hairDark",
    (x, y) => hair(x, y) && !ellipse(45.5, 31, 15.6, 17.4)(x, y),
    ["hair"],
  );
  // Strands, running up and to the right.
  [
    [35, 23, 6],
    [41, 22, 7],
    [48, 21, 6],
    [54, 22, 4],
    [38, 17, 4],
    [45, 16, 5],
  ].forEach(([x, y, length]) => {
    for (let step = 0; step < length; step += 1) {
      if (is(x + step, y - step + OFFSET_Y, "hair")) {
        set(x + step, y - step + OFFSET_Y, "hairLight");
      }
    }
  });
  // The hair casts a thin shadow on the forehead.
  paint("skinShade", (x, y) => head(x, y) && y === hairline(x), ["skin"]);

  // Eyebrows.
  mirrorRow("hair", 36, 34, 41);
  mirrorRow("hair", 37, 33, 35);

  // Glasses: thick rectangular frames, heavier on top, with a hint of glass.
  const frame = mirrored(rect(31, 39, 43, 48));
  const lens = mirrored(rect(32, 41, 42, 47));
  paint("ink", (x, y) => frame(x, y) && !lens(x, y));
  paint("ink", rect(44, 41, 47, 42));
  paint("ink", mirrored(rect(28, 41, 30, 42)));
  // Rounded outer corners.
  [
    [31, 39],
    [43, 39],
    [31, 48],
    [43, 48],
  ].forEach(([x, y]) => {
    set(x, y + OFFSET_Y, "skin");
    set(91 - x, y + OFFSET_Y, "skin");
  });
  mirrorRow("lens", 41, 33, 35);
  mirrorRow("lens", 42, 33, 33);

  // Eyes: open, looking ahead.
  mirrorRow("hairDark", 43, 35, 40);
  mirrorRow("eyeWhite", 44, 35, 40);
  mirrorRow("eyeWhite", 45, 35, 40);
  mirrorRow("eyeWhite", 46, 36, 39);
  for (let y = 44; y <= 46; y += 1) mirrorRow("iris", y, 37, 38);

  // Nose.
  for (let y = 48; y <= 52; y += 1) set(47, y + OFFSET_Y, "skinShade");
  row("skinShade", 53, 44, 47);

  // Moustache, a closed smile, and the beard on the chin.
  row("hair", 55, 41, 50);
  pixels("hair", [
    [40, 56],
    [51, 56],
  ]);
  row("mouth", 59, 42, 49);
  pixels("mouth", [
    [41, 58],
    [50, 58],
  ]);
  row("skinLight", 60, 44, 47);
  row("hair", 62, 44, 47);
  row("hair", 63, 43, 48);
  row("hair", 64, 43, 48);
  row("hair", 65, 44, 47);
}

/** The shirt runs off the bottom edge: nothing is outlined there, since no pixel below is empty. */
const solid = (x, y) => inside(x, y) && get(x, y) !== 0;

/** Paints `name` on every empty pixel within `radius` of the figure. */
function outline(name, radius) {
  const reach = Math.ceil(radius);
  const additions = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (get(x, y) !== 0) continue;
      let near = false;
      for (let dy = -reach; dy <= reach && !near; dy += 1) {
        for (let dx = -reach; dx <= reach && !near; dx += 1) {
          if (dx * dx + dy * dy <= radius * radius && solid(x + dx, y + dy)) {
            near = true;
          }
        }
      }
      if (near) additions.push([x, y]);
    }
  }
  additions.forEach(([x, y]) => set(x, y, name));
}

drawSprite();
outline("ink", 1);
outline("white", 4.3);

// ---------------------------------------------------------------------------------------------
// Export

const rgba = Buffer.alloc(SIZE * SIZE * 4);
grid.forEach((index, position) => rgba.set(RGBA[index], position * 4));

const sprite = () =>
  sharp(rgba, { raw: { width: SIZE, height: SIZE, channels: 4 } });
const png = { palette: true, colours: 32, dither: 0, compressionLevel: 9 };

/** A square crop of the sprite on the yellow tile, scaled by a whole factor. */
function tile({ left, top, size, scale }) {
  return sprite()
    .extract({ left, top, width: size, height: size })
    .flatten({ background: YELLOW })
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
  const face = { left: 22, top: 22, size: 48 };
  // Next decodes the ICO at build time and only accepts a 32-bit RGBA PNG inside it.
  await write(
    "src/app/favicon.ico",
    ico(
      await sprite()
        .extract({ left: 30, top: 34, width: 32, height: 32 })
        .flatten({ background: YELLOW })
        .ensureAlpha()
        .png({ compressionLevel: 9 })
        .toBuffer(),
      32,
    ),
  );
  await write("src/app/icon.png", await tile({ ...face, scale: 2 }).toBuffer());
  await write(
    "src/app/apple-icon.png",
    await tile({ left: 23, top: 24, size: 45, scale: 4 }).toBuffer(),
  );
  await write(
    "public/avatar/icon-192.png",
    await tile({ ...face, scale: 4 }).toBuffer(),
  );
  await write(
    "public/avatar/icon-512.png",
    await tile({ left: 14, top: 16, size: 64, scale: 8 }).toBuffer(),
  );

  // The 8-bit version of every project thumbnail: 150×90 in 24 colours, shown enlarged with
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
        .png({ ...png, colours: 24 })
        .toBuffer(),
    );
  }
}

async function exportSheet(output, reference) {
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
        background: YELLOW,
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
    { input: await onTile(4), left: gap * 3 + 368 * 2, top: gap },
  ];
  if (reference) {
    layers.push({
      input: await sharp(reference).resize(368, 368).png().toBuffer(),
      left: gap * 2 + 368,
      top: gap,
    });
  }
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

const options = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, value = "true"] = argument.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

if (options.sheet) await exportSheet(options.sheet, options.reference);
else await exportAssets();
