import { useEffect } from 'react';
import disableDevtool from 'disable-devtool';

export default function SecurityManager() {
  useEffect(() => {
    // 1. Initialize disable-devtool with ultra-aggressive settings
    try {
      disableDevtool({
        ondevtoolopen: (type) => {
          window.location.replace("about:blank");
          try { window.close(); } catch (e) {}
        },
        clearLog: true,
        disableMenu: true,
        disableCopy: true,
        disableCut: true,
        disablePaste: true,
        disableSelect: true,
        interval: 200, // Even more frequent checks
        tkName: 'lumina_security_v2',
        url: 'about:blank', // Redirect URL
      });
    } catch (e) {
      // Silent fail to avoid alerting the user
    }

    // 2. Advanced Anti-Debugging & Environment Protection
    const aggressiveSecurity = () => {
      // Trick 1: Timing Attack Protection (Relaxed threshold to avoid false positives)
      const t1 = performance.now();
      // eslint-disable-next-line no-debugger
      debugger; 
      const t2 = performance.now();
      if (t2 - t1 > 500) { // Increased to 500ms to be safe
        window.location.replace("about:blank");
      }

      // Trick 2: Automation Detection (Puppeteer, Selenium, etc.)
      const isAutomated = 
        navigator.webdriver || 
        (window as any).domAutomation || 
        (window as any).domAutomationController ||
        document.documentElement.getAttribute('webdriver');
      
      if (isAutomated) {
        window.location.replace("about:blank");
      }

      // Trick 3: Console ID Property Trick (Refined)
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: function() {
          window.location.replace("about:blank");
          return 'lock';
        }
      });
      // We don't log it every time to avoid performance issues, just occasionally
      if (Math.random() > 0.9) console.log(element);
    };

    const securityInterval = setInterval(aggressiveSecurity, 1000);

    // 3. Global Event Protections
    const handleKeyDown = (e: KeyboardEvent) => {
      const forbiddenKeys = ['F12', 'F10', 'F11'];
      const forbiddenCombos = [
        (e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase()),
        (e.ctrlKey || e.metaKey) && ['U', 'S', 'P', 'H'].includes(e.key.toUpperCase()),
        e.altKey && (e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'I'
      ];

      if (forbiddenKeys.includes(e.key) || forbiddenCombos.some(combo => combo)) {
        e.preventDefault();
        e.stopPropagation();
        window.location.replace("about:blank");
        return false;
      }
    };

    const preventDefault = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // 4. Iframe / Clickjacking Protection
    if (window.self !== window.top) {
      window.top!.location.href = window.self.location.href;
    }

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', preventDefault, true);
    window.addEventListener('dragstart', preventDefault, true);
    window.addEventListener('selectstart', preventDefault, true);

    // 5. Detect if the page is being recorded or captured (Experimental)
    if (navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia) {
      // This is just a placeholder for more advanced detection if needed
    }

    return () => {
      clearInterval(securityInterval);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', preventDefault, true);
      window.removeEventListener('dragstart', preventDefault, true);
      window.removeEventListener('selectstart', preventDefault, true);
    };
  }, []);

  return null;
}
