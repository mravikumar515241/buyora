import { useEffect } from 'react';

export function useAutofillFix() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus,
      textarea:-webkit-autofill:active {
        transition: background-color 0s 600000s, color 0s 600000s !important;
      }
    `;
    document.head.appendChild(style);

    const applyAutofillFix = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const inputs = document.querySelectorAll('input:-webkit-autofill, textarea:-webkit-autofill');
      
      inputs.forEach(input => {
        if (isDark) {
          input.style.setProperty('background-color', '#334155', 'important');
          input.style.setProperty('color', '#f1f5f9', 'important');
          input.style.setProperty('-webkit-box-shadow', '0 0 0 1000px #334155 inset', 'important');
          input.style.setProperty('-webkit-text-fill-color', '#f1f5f9', 'important');
        } else {
          input.style.setProperty('background-color', '#ffffff', 'important');
          input.style.setProperty('color', '#0f172a', 'important');
          input.style.setProperty('-webkit-box-shadow', '0 0 0 1000px #ffffff inset', 'important');
          input.style.setProperty('-webkit-text-fill-color', '#0f172a', 'important');
        }
      });
    };

    // Apply fix on mount and when autofill happens
    const timer = setInterval(applyAutofillFix, 100);
    
    // Also observe for dark class changes
    const observer = new MutationObserver(applyAutofillFix);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => {
      clearInterval(timer);
      observer.disconnect();
      document.head.removeChild(style);
    };
  }, []);
}
