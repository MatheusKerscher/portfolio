let context: AudioContext | null = null;

/**
 * The one `AudioContext` of the 8-bit skin, created or woken up. A browser only starts one
 * inside a gesture, so this is called by whatever handles the gesture: `toggleSkin()` when the
 * skin is entered, and the runtime of the skin on the first press of a returning visitor. It
 * is apart from the sound engine, which is fetched with that runtime, after the gesture.
 */
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
  } catch {
    // No audio in this browser: the skin is silent.
  }
  return context;
}

/** The context, if a gesture has created it. */
export const currentAudio = () => context;
