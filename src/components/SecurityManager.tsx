import { useEffect } from 'react';
import disableDevtool from 'disable-devtool';

export default function SecurityManager() {
  useEffect(() => {
    // 1. Initialize disable-devtool with aggressive settings
    try {
      disableDevtool({
        ondevtoolopen: (type) => {
          // Immediate redirection if DevTools is detected
          window.location.href = "about:blank";
          window.close();
        },
        clearLog: true,
        disableMenu: true,
        disableCopy: true,
        disableCut: true,
        disablePaste: true,
        disableSelect: true,
        interval: 500, // Frequent checks
        tkName: 'lumina_security'
      });
    } catch (e) {
      console.error("Security core failure", e);
    }

    // 2. Advanced Anti-Debugging & Inspection Protection
    const aggressiveSecurity = () => {
      const startTime = performance.now();
      
      // Trick 1: Debugger Timing Attack
      // This causes a massive slowdown if DevTools is open
      (function() {
        const t1 = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const t2 = performance.now();
        if (t2 - t1 > 100) {
          window.location.href = "about:blank";
        }
      })();

      // Trick 2: Console ID Property Trick
      // Detecting console.log of specific objects
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: function() {
          window.location.href = "about:blank";
          return 'security-lock';
        }
      });
      console.log(element);

      // Trick 3: Function toString protection
      const check = function() {};
      if (check.toString().length !== 13) {
        // Function was tampered with
        window.location.href = "about:blank";
      }

      const endTime = performance.now();
      if (endTime - startTime > 150) {
        window.location.href = "about:blank";
      }
    };

    const interval = setInterval(aggressiveSecurity, 500);

    // 3. Prevent common view-source and inspection shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) ||
        (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'I')) // Mac support
      ) {
        e.preventDefault();
        window.location.href = "about:blank";
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
