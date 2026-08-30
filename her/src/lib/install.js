var installPrompt = null;
var installListeners = new Set();
function watchInstallPrompt() {
  let e = (e) => {
      (e.preventDefault(), (installPrompt = e));
      for (let e of installListeners) e(true);
    },
    t = () => {
      installPrompt = null;
      for (let e of installListeners) e(false);
    };
  return (
    window.addEventListener("beforeinstallprompt", e),
    window.addEventListener("appinstalled", t),
    () => {
      (window.removeEventListener("beforeinstallprompt", e),
        window.removeEventListener("appinstalled", t));
    }
  );
}
function onInstallAvailable(e) {
  return (
    installListeners.add(e),
    e(!!installPrompt),
    () => {
      installListeners.delete(e);
    }
  );
}
async function promptInstall() {
  if (!installPrompt) return false;
  try {
    await installPrompt.prompt();
    let e = await installPrompt.userChoice;
    installPrompt = null;
    for (let e of installListeners) e(false);
    return e.outcome === "accepted";
  } catch {
    return false;
  }
}
function isStandalone() {
  return typeof window === "undefined"
    ? false
    : window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}
function isFileProtocol() {
  return typeof location !== "undefined" && location.protocol === "file:";
}
// There is no service worker. There is no sw.js in the build, and registering
// one asked a static host for a file that was never shipped — a 404 on a page
// whose whole promise is that it fetches nothing.
//
// This drops any worker an older copy left behind, so a stale cache cannot
// keep serving her an old house, and clears its caches with it.
function dropServiceWorker() {
  if (isFileProtocol() || typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .getRegistrations?.()
    .then((all) => all.forEach((reg) => reg.unregister().catch(() => {})))
    .catch(() => {});
  globalThis.caches
    ?.keys?.()
    .then((keys) => keys.forEach((k) => caches.delete(k).catch(() => {})))
    .catch(() => {});
}
