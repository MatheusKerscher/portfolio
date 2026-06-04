import { createContext, useContext, type RefObject } from "react";
import type Lenis from "lenis";

export const LenisContext = createContext<RefObject<Lenis | null>>({
  current: null,
});
export const useLenis = () => useContext(LenisContext);
