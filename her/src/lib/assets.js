var SCORE_FILES = Object.assign({});

var STILL_FILES = Object.assign({});

function indexAssets(e, t) {
  let n = new Map();
  for (let [r, i] of Object.entries(e)) {
    let e = r.split(`/`).pop();
    e && n.set(`${t}/${e}`, i);
  }
  return n;
}

var scoreIndex = indexAssets(SCORE_FILES, `/score`);

var stillIndex = indexAssets(STILL_FILES, `/stills`);

function scoreUrl(e) {
  return scoreIndex.get(e) ?? ``;
}

function stillUrl(e) {
  return stillIndex.get(e) ?? ``;
}

function hasStill(e) {
  return stillIndex.has(e);
}

var VOW_SOURCES = [`/score/vow.mp3`, `/score/vow.m4a`, `/score/vow.ogg`, `/score/song.mp3`];

var NAME_SOURCES = [`/score/her-name.m4a`, `/score/her-name.mp3`, `/score/her-name.ogg`];

function firstAvailable(e) {
  for (let t of e) {
    let e = scoreUrl(t);
    if (e) return e;
  }
  return ``;
}
