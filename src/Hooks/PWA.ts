import React from "react";

/**
 * Example user case:
 * When in standalone mode don't show the home hero page.
 *
 * @returns The display mode of the app
 */
export function getPWADisplayMode(): "twa" | "standalone" | "browser" {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  if (document.referrer.startsWith("android-app://")) {
    return "twa";
  } else if (isStandalone) {
    return "standalone";
  }
  return "browser";
}

/**
 * getInstalledRelatedApps()
 *
 *
 * @returns Allow you to install/uninstall a PWA and see the status of the installation
 */
export function usePWAInstall(): [boolean, () => void] {
  const [canInstallPWA, setCanInstallPWA] = React.useState(false);
  const promptInstallContainer = React.useRef<any>(null);

  React.useEffect(() => {
    // TODO: What type is e?
    const handler = (e: any) => {
      e.preventDefault();
      promptInstallContainer.current = e;
      setCanInstallPWA(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("transitionend", handler);
  }, []);

  const install = () => {
    if (promptInstallContainer.current) {
      setCanInstallPWA(false);
      promptInstallContainer.current.prompt();
      promptInstallContainer.current = null;
    }
  };
  return [canInstallPWA, install];
}

/**
 * Limited support (Only android)
 */
export async function isInstalled() {
  if ("getInstalledRelatedApps" in navigator) {
    const navigatorAny = navigator as any;
    const relatedApps = await navigatorAny.getInstalledRelatedApps();
    relatedApps.forEach((app: any) => {
      //if your PWA exists in the array it is installed
      console.log(app.platform, app.url);
    });
  }
}
