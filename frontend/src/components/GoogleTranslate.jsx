import React, { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    // 1. CLEANUP PREVIOUS SCRIPT & WIDGET (Aggressive Reset)
    const scriptId = "google-translate-script";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }
    
    // Clear global callback to force re-execution
    if (window.googleTranslateElementInit) {
        delete window.googleTranslateElementInit;
    }
    
    // Clear specific Google Translate global objects if possible (risky but necessary for aggressive reset)
    // We avoid deleting window.google entire object to not break other google services like Maps/Auth
    if (window.google && window.google.translate) {
      // Trying to reset translation state
       // Note: Safely deleting sub-properties might not be enough, but removing script is key.
    }

    const initGoogleTranslate = () => {
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
           const container = document.getElementById("google_translate_element");
           if (container) {
               container.innerHTML = "";
               new window.google.translate.TranslateElement(
                {
                  pageLanguage: "en",
                  includedLanguages: "en,fr",
                  layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false,
                },
                "google_translate_element"
              );
              hideGoogleBanner();
           }
        }
    };

    window.googleTranslateElementInit = initGoogleTranslate;

    // 2. RE-INJECT SCRIPT
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // 3. BANNER HIDING LOGIC
    const hideGoogleBanner = () => {
        const banners = document.querySelectorAll(
          '.goog-te-banner-frame.skiptranslate, .goog-te-banner-frame, iframe[id=":2.container"], iframe[class*="banner"]'
        );
        banners.forEach((banner) => {
          if (banner && !banner.classList.contains('goog-te-menu-frame')) {
            banner.style.display = "none";
            banner.style.visibility = "hidden";
            banner.style.height = "0";
            banner.style.opacity = "0";
          }
        });
        if (
          document.body.style.top !== "0px" ||
          document.body.style.marginTop !== "0px" ||
          document.body.style.position !== "static"
        ) {
          document.body.style.top = "0px";
          document.body.style.marginTop = "0px";
          document.body.style.position = ""; 
        }
    };

    // Maintenance
    const intervalId = setInterval(hideGoogleBanner, 1000);
    const observer = new MutationObserver(hideGoogleBanner);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
      // On unmount, we can optionally remove the script again, but we do it on mount anyway.
    };
  }, []);

  // STYLES TO HIDE GOOGLE BRANDING & IMPROVE UI
  const googleTranslateStyles = `
    /* Safe Styles to ensure visibility while trying to be clean */
    .goog-te-banner-frame {
        display: none !important;
        visibility: hidden !important;
    }
    
    body {
        top: 0px !important; 
    }

    /* Hide the Google Icon only if it doesn't break layout */
    .goog-te-gadget-icon {
        display: none !important;
    }

    /* Basic styling for the container */
    .goog-te-gadget-simple {
        background-color: transparent !important;
        border: none !important;
        padding: 0 !important;
        font-family: inherit !important;
    }

    /* Ensure dropdown is visible */
    .goog-te-combo {
        color: #1e293b !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 6px !important;
        padding: 6px !important;
        font-size: 14px !important;
        outline: none !important;
        background: white !important;
    }
  `;

  return (
    <>
      <style>{googleTranslateStyles}</style>
      <div
        id="google_translate_element"
        className="google-translate-container relative z-50"
      >
        {/* The widget renders here */}
      </div>
    </>
  );
};

export default GoogleTranslate;
