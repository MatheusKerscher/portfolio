import { play } from "@/lib/pixel-audio";
import { setSound, usePixelPrefs } from "@/lib/pixel-prefs";
import PixelIcon from "../pixel-icon";
import { speaker, speakerOff } from "../pixel-icons";

/** Turns the sound back on with a sound, which is how one knows that it worked. */
export function toggleSound(sound: boolean) {
  setSound(sound);
  if (sound) play("on");
}

/** The mute of the 8-bit skin, in the navbar from `sm` up. Below it, the PAUSE menu has it. */
export default function SoundToggle({ label }: { label: string }) {
  const { sound } = usePixelPrefs();

  return (
    <button
      type="button"
      aria-pressed={!sound}
      aria-label={label}
      title={label}
      onClick={() => toggleSound(!sound)}
      className="flex h-8 w-8 items-center justify-center text-ink transition-colors duration-200 hover:text-brand aria-pressed:text-ink-muted max-lg:h-11 max-lg:w-11"
    >
      <PixelIcon grid={sound ? speaker : speakerOff} />
    </button>
  );
}
