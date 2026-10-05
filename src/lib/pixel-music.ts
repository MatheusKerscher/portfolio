import { playInMusic, type Voice } from "./pixel-audio";

/**
 * The background loop of the 8-bit skin: an original eight-bar tune in A minor, on the four
 * channels of a console of the time — a lead and an arpeggio in square waves, a bass in a
 * triangle wave and drums made of noise. It is data, played by a step sequencer.
 */

const TEMPO = 132;
/** A sixteenth note, in seconds. */
const STEP = 60 / TEMPO / 4;
const STEPS_PER_BAR = 16;

/** The frequency of a MIDI note. */
const hertz = (note: number) => 440 * 2 ** ((note - 69) / 12);

/** One bar each: the root of the bass and the notes of the arpeggio. Am, F, C, G. */
const CHORDS = [
  { bass: 45, arpeggio: [57, 60, 64, 69] },
  { bass: 41, arpeggio: [53, 57, 60, 65] },
  { bass: 48, arpeggio: [60, 64, 67, 72] },
  { bass: 43, arpeggio: [55, 59, 62, 67] },
];

/** The lead, bar by bar: the step it starts on, the note, and how many steps it lasts. */
const LEAD: [step: number, note: number, steps: number][][] = [
  [
    [0, 76, 3],
    [4, 74, 2],
    [6, 72, 2],
    [8, 69, 4],
    [12, 72, 2],
    [14, 74, 2],
  ],
  [
    [0, 72, 4],
    [4, 69, 4],
    [8, 65, 2],
    [10, 69, 2],
    [12, 72, 4],
  ],
  [
    [0, 76, 4],
    [4, 79, 2],
    [6, 76, 2],
    [8, 74, 2],
    [10, 72, 2],
    [12, 74, 2],
    [14, 76, 2],
  ],
  [
    [0, 74, 4],
    [4, 71, 4],
    [8, 67, 2],
    [10, 71, 2],
    [12, 74, 4],
  ],
  [
    [0, 81, 2],
    [2, 79, 2],
    [4, 76, 4],
    [8, 72, 2],
    [10, 74, 2],
    [12, 76, 4],
  ],
  [
    [0, 77, 4],
    [4, 76, 2],
    [6, 72, 2],
    [8, 69, 4],
    [12, 72, 4],
  ],
  [
    [0, 79, 4],
    [4, 76, 4],
    [8, 72, 2],
    [10, 76, 2],
    [12, 79, 4],
  ],
  [
    [0, 74, 2],
    [2, 76, 2],
    [4, 74, 2],
    [6, 71, 2],
    [8, 67, 8],
  ],
];

const KICK: Voice = { wave: "triangle", from: 140, to: 50, length: 0.09 };
const SNARE: Voice = { wave: "noise", from: 0, length: 0.06, volume: 0.3 };
const HAT: Voice = { wave: "noise", from: 0, length: 0.02, volume: 0.1 };

/** Everything that sounds on one step of the loop. */
function voicesOf(position: number): Voice[] {
  const bar = Math.floor(position / STEPS_PER_BAR);
  const step = position % STEPS_PER_BAR;
  const chord = CHORDS[bar % CHORDS.length];
  const voices: Voice[] = [
    {
      from: hertz(chord.arpeggio[step % chord.arpeggio.length]),
      length: STEP * 0.8,
      volume: 0.16,
    },
  ];

  // The bass plays eighth notes and jumps an octave on the off beats.
  if (step % 2 === 0) {
    voices.push({
      wave: "triangle",
      from: hertz(chord.bass + (step % 8 === 4 ? 12 : 0)),
      length: STEP * 1.8,
      volume: 0.7,
    });
    voices.push(HAT);
  }
  if (step % 8 === 0) voices.push(KICK);
  if (step % 8 === 4) voices.push(SNARE);

  for (const [start, note, steps] of LEAD[bar]) {
    if (start === step) {
      voices.push({
        from: hertz(note),
        length: STEP * steps * 0.9,
        volume: 0.4,
      });
    }
  }
  return voices;
}

/**
 * Starts the loop and returns what stops it. The notes are scheduled a little ahead on the clock
 * of the context, which a timer of the page only has to keep up with.
 */
export function startMusic(context: AudioContext) {
  const total = LEAD.length * STEPS_PER_BAR;
  let position = 0;
  let next = context.currentTime + 0.06;

  const timer = window.setInterval(() => {
    while (next < context.currentTime + 0.12) {
      for (const voice of voicesOf(position)) playInMusic(context, voice, next);
      next += STEP;
      position = (position + 1) % total;
    }
  }, 30);
  return () => window.clearInterval(timer);
}
