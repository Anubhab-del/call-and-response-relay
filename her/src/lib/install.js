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
function dropServiceWorker() {
  isFileProtocol() ||
    ("serviceWorker" in navigator &&
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {});
      }));
}
