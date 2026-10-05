import { currentAudio } from "./audio-context";
import { pixelPrefs } from "./pixel-prefs";

/**
 * The sound of the 8-bit skin, synthesised: oscillators and a burst of noise, the way a console
 * of the time made it. There is no audio file.
 */

export type Voice = {
  /** `noise` is white noise, for a drum or a thud. */
  wave?: OscillatorType | "noise";
  /** Frequency in hertz; `to` slides to another one over the length of the voice. */
  from: number;
  to?: number;
  /** When it starts, in seconds after the effect does. */
  at?: number;
  length: number;
  volume?: number;
};

/** Notes one after the other. */
const arpeggio = (
  notes: number[],
  length: number,
  wave: OscillatorType = "square",
): Voice[] =>
  notes.map((from, index) => ({ wave, from, at: index * length, length }));

const EFFECTS = {
  hover: [{ from: 880, length: 0.03, volume: 0.2 }],
  select: [
    { from: 660, length: 0.05 },
    { from: 990, at: 0.05, length: 0.07 },
  ],
  tick: [{ from: 520, length: 0.04 }],
  bump: [
    { wave: "noise", from: 0, length: 0.08, volume: 0.6 },
    { wave: "triangle", from: 110, to: 70, length: 0.1, volume: 0.9 },
  ],
  enter: arpeggio([523, 659, 784, 1047], 0.07),
  exit: arpeggio([1047, 784, 659, 523], 0.07),
  on: [
    { from: 440, length: 0.05 },
    { from: 880, at: 0.05, length: 0.08 },
  ],
  off: [
    { from: 880, length: 0.05 },
    { from: 440, at: 0.05, length: 0.08 },
  ],
  open: arpeggio([330, 494, 659], 0.04),
  close: arpeggio([659, 494, 330], 0.04),
  jump: [{ from: 300, to: 900, length: 0.16 }],
  coin: [
    { from: 988, length: 0.07 },
    { from: 1319, at: 0.07, length: 0.22 },
  ],
  stage: arpeggio([392, 523, 659], 0.08, "triangle"),
  achievement: [
    ...arpeggio([523, 659, 784, 1047], 0.08),
    { from: 1319, at: 0.32, length: 0.3 },
  ],
  type: [{ from: 1200, length: 0.015, volume: 0.15 }],
} satisfies Record<string, Voice[]>;

export type Effect = keyof typeof EFFECTS;

/** Quiet on purpose: the sound decorates the page, it does not compete with it. */
const VOLUME = 0.14;
const MUSIC_VOLUME = 0.45;

let output: {
  context: AudioContext;
  master: GainNode;
  music: GainNode;
  noise: AudioBuffer;
} | null = null;

/** Where the voices of a context are sent: everything through `master`, the music through its own. */
function outputOf(context: AudioContext) {
  if (output?.context !== context) {
    const master = context.createGain();
    master.connect(context.destination);
    const music = context.createGain();
    music.gain.value = MUSIC_VOLUME;
    music.connect(master);

    const noise = context.createBuffer(
      1,
      context.sampleRate / 4,
      context.sampleRate,
    );
    const samples = noise.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }
    output = { context, master, music, noise };
  }
  output.master.gain.value = pixelPrefs().sound ? VOLUME : 0;
  return output;
}

/** Applies the mute to what is already playing. */
export function applyVolume() {
  const context = currentAudio();
  if (context) outputOf(context);
}

/** Schedules one voice at `start`, a time of the context. */
function schedule(
  context: AudioContext,
  destination: AudioNode,
  { wave = "square", from, to, length, volume = 0.5 }: Voice,
  start: number,
) {
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(volume, start);
  // A short release: a voice that is cut off clicks.
  envelope.gain.setValueAtTime(volume, start + length * 0.7);
  envelope.gain.linearRampToValueAtTime(0, start + length);
  envelope.connect(destination);

  let source: AudioScheduledSourceNode;
  if (wave === "noise") {
    const node = context.createBufferSource();
    node.buffer = outputOf(context).noise;
    source = node;
  } else {
    const node = context.createOscillator();
    node.type = wave;
    node.frequency.setValueAtTime(from, start);
    if (to) node.frequency.linearRampToValueAtTime(to, start + length);
    source = node;
  }
  source.connect(envelope);
  source.start(start);
  source.stop(start + length + 0.02);
}

/**
 * Plays an effect now. It does nothing while the sound is muted, where there is no audio, and
 * while the context has not started: what was scheduled then would all play at once later.
 */
export function play(effect: Effect) {
  const context = currentAudio();
  if (!context || !pixelPrefs().sound) return;
  if (context.state !== "running") {
    void context.resume();
    return;
  }
  const { master } = outputOf(context);
  for (const voice of EFFECTS[effect] as Voice[]) {
    schedule(context, master, voice, context.currentTime + (voice.at ?? 0));
  }
}

/**
 * Runs `run` once the context is running: at once if it is, when it starts otherwise. A press
 * creates the context, and a browser, or an audio output that has to wake up, may take a moment
 * to start it. Returns what gives up the wait.
 */
export function whenAudioRuns(run: () => void) {
  const context = currentAudio();
  if (!context) return () => {};
  if (context.state === "running") {
    run();
    return () => {};
  }

  const onChange = () => {
    if (context.state !== "running") return;
    context.removeEventListener("statechange", onChange);
    run();
  };
  context.addEventListener("statechange", onChange);
  return () => context.removeEventListener("statechange", onChange);
}

/** For the sequencer: one voice of the music at a time of the context. */
export function playInMusic(
  context: AudioContext,
  voice: Voice,
  start: number,
) {
  schedule(context, outputOf(context).music, voice, start);
}
