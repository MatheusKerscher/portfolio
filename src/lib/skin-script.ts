export const SKIN_STORAGE_KEY = "skin";
export const SKIN_ATTRIBUTE = "data-skin";

/**
 * Runs in `<head>`, before the first paint, so a returning visitor never sees the normal skin
 * flash. React does not render the attribute, so it causes no hydration mismatch. Kept apart from
 * `skin.ts` so the root layout, a Server Component, can import it.
 */
export const skinScript = `(function(){try{if(localStorage.getItem("${SKIN_STORAGE_KEY}")==="8bit")document.documentElement.setAttribute("${SKIN_ATTRIBUTE}","8bit")}catch(e){}})()`;
