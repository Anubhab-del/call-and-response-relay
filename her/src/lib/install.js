var installPrompt = null;

var installListeners = new Set();

function watchInstallPrompt() {
  let e = (e) => {
      (e.preventDefault(), (installPrompt = e));
      for (let e of installListeners) e(!0);
    },
    t = () => {
      installPrompt = null;
      for (let e of installListeners) e(!1);
    };
  return (
    window.addEventListener(`beforeinstallprompt`, e),
    window.addEventListener(`appinstalled`, t),
    () => {
      (window.removeEventListener(`beforeinstallprompt`, e),
        window.removeEventListener(`appinstalled`, t));
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
  if (!installPrompt) return !1;
  try {
    await installPrompt.prompt();
    let e = await installPrompt.userChoice;
    installPrompt = null;
    for (let e of installListeners) e(!1);
    return e.outcome === `accepted`;
  } catch {
    return !1;
  }
}

function isStandalone() {
  return typeof window > `u`
    ? !1
    : window.matchMedia(`(display-mode: standalone)`).matches || navigator.standalone === !0;
}

function isFileProtocol() {
  return typeof location < `u` && location.protocol === `file:`;
}

function dropServiceWorker() {
  isFileProtocol() ||
    (`serviceWorker` in navigator &&
      window.addEventListener(`load`, () => {
        navigator.serviceWorker.register(`./sw.js`).catch(() => {});
      }));
}
