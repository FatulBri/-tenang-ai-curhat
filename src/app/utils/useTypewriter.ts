import { useEffect, useState, useRef } from "react";

/**
 * Typewriter hook — animates text character by character.
 * @param fullText   The complete target string
 * @param active     Start animating when true
 * @param speed      ms per character (default 18ms)
 */
export function useTypewriter(fullText: string, active: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplayed(fullText);
      setDone(true);
      return;
    }
    // Reset on new text
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(fullText.slice(0, indexRef.current));
      if (indexRef.current >= fullText.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [fullText, active, speed]);

  return { displayed, done };
}
