var SEAL_MAGIC = "HER1";
function encodeUtf8(e) {
  return new TextEncoder().encode(e);
}
function decodeUtf8(e) {
  return new TextDecoder().decode(e);
}
function toBase64(e) {
  let t = "",
    n = 32768;
  for (let r = 0; r < e.length; r += n) t += String.fromCharCode(...e.subarray(r, r + n));
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64(e) {
  let t = e.length % 4 == 0 ? "" : "=".repeat(4 - (e.length % 4)),
    n = atob(e.replace(/-/g, "+").replace(/_/g, "/") + t),
    r = new Uint8Array(n.length);
  for (let e = 0; e < n.length; e++) r[e] = n.charCodeAt(e);
  return r;
}
function fnv1a(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n++) ((t ^= e.charCodeAt(n)), (t = Math.imul(t, 16777619)));
  return (t >>> 0).toString(36);
}
function hasCompression() {
  return typeof globalThis.CompressionStream == "function";
}
async function deflate(e) {
  let t = new CompressionStream("deflate-raw"),
    n = new Blob([e]).stream().pipeThrough(t);
  return new Uint8Array(await new Response(n).arrayBuffer());
}
async function inflate(e) {
  let t = new DecompressionStream("deflate-raw"),
    n = new Blob([e]).stream().pipeThrough(t);
  return new Uint8Array(await new Response(n).arrayBuffer());
}
async function sealNotes(e, t = "her") {
  let n = e.filter((e) => !e.private && e.text.trim().length > 0),
    r = JSON.stringify({
      v: 1,
      from: t,
      at: Date.now(),
      replies: n,
    }),
    i = fnv1a(r),
    a;
  a = hasCompression() ? `z${toBase64(await deflate(encodeUtf8(r)))}` : `r${toBase64(encodeUtf8(r))}`;
  let o = `${SEAL_MAGIC}.${i}.${a}`;
  return {
    code: o,
    count: n.length,
    size: o.length,
  };
}
async function openSeal(e) {
  let t = e.trim().replace(/\s+/g, "");
  if (!t)
    return {
      ok: false,
      reason: "Nothing was pasted.",
    };
  if (!t.startsWith(`${SEAL_MAGIC}.`))
    return {
      ok: false,
      reason: "That is not from here. It should begin with HER1.",
    };
  let n = t.split(".");
  if (n.length !== 3)
    return {
      ok: false,
      reason: "Part of it is missing. Copy the whole message, from HER1 to the very end.",
    };
  let [, r, i] = n,
    a;
  try {
    let e = fromBase64(i.slice(1));
    if (i[0] === "z") {
      if (!hasCompression())
        return {
          ok: false,
          reason: "This browser cannot unpack it. Try Chrome.",
        };
      a = decodeUtf8(await inflate(e));
    } else if (i[0] === "r") a = decodeUtf8(e);
    else
      return {
        ok: false,
        reason: "This was written by a newer version than the one you have.",
      };
  } catch {
    return {
      ok: false,
      reason: "It arrived damaged. Ask for it again — messaging apps sometimes cut long text.",
    };
  }
  if (fnv1a(a) !== r)
    return {
      ok: false,
      reason: "Some of it was lost on the way. Ask her to send it as a file instead.",
    };
  try {
    let e = JSON.parse(a);
    if (e.v !== 1 || !Array.isArray(e.replies))
      return {
        ok: false,
        reason: "The inside of it does not look right.",
      };
    let t = e.replies.filter((e) => e && typeof e.text == "string" && typeof e.id == "string");
    return t.length === 0
      ? {
          ok: false,
          reason: "It opened, but there was nothing in it.",
        }
      : {
          ok: true,
          replies: t,
          from: e.from ?? "her",
          at: e.at ?? Date.now(),
        };
  } catch {
    return {
      ok: false,
      reason: "It opened and then would not read.",
    };
  }
}
function isShortEnough(e) {
  return e < 3500;
}
