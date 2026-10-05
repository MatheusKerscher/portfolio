"use client";

import { useEffect } from "react";
import { unlockAudio } from "@/lib/audio-context";
import { applyVolume, play, whenAudioRuns } from "@/lib/pixel-audio";
import { startMusic } from "@/lib/pixel-music";
import { setMusic, usePixelPrefs } from "@/lib/pixel-prefs";
import { recentSkinEntry } from "@/lib/skin";
import { pixelDictionaryFor } from "../../data/dictionaries/pixel";
import type { Locale } from "../../data/locales";
import { useAchievements } from "./achievements";
import { useDialogue } from "./dialogue";
import Effects, { animate } from "./effects";
import Hud from "./hud";
import InspectorLock from "./inspector-lock";
import PauseMenu from "./pause-menu";
import "./pixel.css";
import Scenery from "./scenery";
import Slot from "./slot";
import { useSoundEffects } from "./sound-effects";
import SoundToggle from "./sound-toggle";

/**
 * The runtime of the 8-bit skin: everything the skin does beyond its shapes. It is one lazy
 * chunk, mounted by `PixelRuntimeGate` while the skin is on, and it reaches the page through
 * selectors and a few `data-px` attributes, by delegation on `document`: no component of the
 * page knows about sound, particles or achievements.
 */
export default function PixelRuntime({ locale }: { locale: Locale }) {
  const copy = pixelDictionaryFor(locale);
  const { sound, effects, music } = usePixelPrefs();

  useSoundEffects();
  useAchievements(locale);
  useDialogue();

  // What the stylesheet reads to stop everything that moves on its own.
  useEffect(() => {
    const root = document.documentElement;
    if (effects) root.removeAttribute("data-fx");
    else root.setAttribute("data-fx", "off");
    return () => root.removeAttribute("data-fx");
  }, [effects]);

  useEffect(applyVolume, [sound]);

  useEffect(() => {
    // An entry is greeted; a page that loads with the skin stored is not. The press that
    // entered the skin created the audio context a moment ago, and it may still be starting:
    // the jingle waits for it, for as long as the entry is recent.
    let forgetGreeting = () => {};
    if (recentSkinEntry()) {
      forgetGreeting = whenAudioRuns(() => {
        if (recentSkinEntry()) play("enter");
      });
      animate(document.querySelector("main"), "px-shake", 260);
    }

    // A returning visitor has made no gesture yet: the first press wakes the audio up. For a
    // finger the gesture is the end of the touch, not its start.
    const PRESSES = ["pointerdown", "pointerup", "keydown"];
    PRESSES.forEach((type) =>
      document.addEventListener(type, unlockAudio, true),
    );
    return () => {
      forgetGreeting();
      PRESSES.forEach((type) =>
        document.removeEventListener(type, unlockAudio, true),
      );
      // Only when the skin is left: in development React runs a cleanup once more on mount.
      if (document.documentElement.getAttribute("data-skin") !== "8bit") {
        play("exit");
        setMusic(false);
      }
    };
  }, []);

  useEffect(() => {
    if (!music) return;
    let stop: (() => void) | null = null;
    // A hidden tab runs its timers once a second, too slow for the sequencer: the loop waits.
    // On a page that loads with the music on nobody has pressed anything yet. The context is
    // created all the same: where the browser lets it run, the music is back at once; where it
    // does not, its clock stands still, the sequencer with it, and the first press starts both.
    const restart = () => {
      stop?.();
      const context = document.hidden ? null : unlockAudio();
      stop = context ? startMusic(context) : null;
    };
    restart();
    document.addEventListener("visibilitychange", restart);
    return () => {
      document.removeEventListener("visibilitychange", restart);
      stop?.();
    };
  }, [music]);

  return (
    <>
      <Scenery />
      <Effects />
      <Hud copy={copy} />
      <InspectorLock label={copy.inspector.locked} />
      <Slot name="sound">
        <SoundToggle label={copy.sound.mute} />
      </Slot>
      <Slot name="pause">
        <PauseMenu copy={copy} />
      </Slot>
    </>
  );
}
