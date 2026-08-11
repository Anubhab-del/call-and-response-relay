# Play Call and Response from any city

You do **not** need the same Wi‑Fi. You need one tiny free server on the internet (a “relay”) that both phones talk to.

Solo still works with **no** relay.

---

## One-time: put the relay online (Anubhab, ~10 minutes)

### Option A — Render (free, recommended)

1. Create a free account: https://render.com  
2. **New → Web Service**  
3. Connect this folder (or upload / link a GitHub repo that has `relay.js` + `package.json`)  
4. Settings:
   - **Runtime:** Node  
   - **Build command:** `npm install`  
   - **Start command:** `node relay.js`  
5. Create the service. Wait until it says **Live**.  
6. Copy the public URL, e.g.  
   `https://call-response-xxxx.onrender.com`  
7. Change it for the game:
   - `https://…` → **`wss://…`**  
   - Example: `wss://call-response-xxxx.onrender.com`

> Free Render apps **sleep** after ~15 minutes idle. First connect after sleep can take 30–60 seconds. Then it stays awake while you play.

### Option B — Railway / Fly.io

Same idea: deploy `relay.js`, get a public HTTPS URL, use **`wss://`** instead of `https://`.

---

## Both phones (every time you play together)

1. Open **Call and Response**.  
2. **Begin** → **Anubhab** on your phone, **Smrutii** on hers.  
3. Open **Settings** (gear).  
4. Under **Relay URL (any city)** paste the **same** link, e.g.  
   `wss://call-response-xxxx.onrender.com`  
5. **Shared room** — same secret on both (default is fine):  
   `cr-anubhab-smrutii`  
6. Tap **Save & connect**.  
7. Wait for the soft light / “is here”.  
   If the server was asleep, wait up to a minute once.

### Then play

- Settings → turn **Two of you** **on**  
- Menu → **Free play**  
- **Anubhab:** play a phrase → **Enter** to send  
- **Smrutii:** hears the call → answers on the pads  

Or free-jam with **Live pads** on so notes echo across the distance.

---

## Checklist when it won’t link

| Check | |
|--------|--|
| Both used **`wss://`** not `https://`? | |
| Same relay URL on both? | |
| Same room name on both? | |
| Server **Live** on Render? | |
| Waited after free-tier sleep? | |
| One is Call, one is Response? | |

---

## Privacy

The room name is the lock. Pick something only you two know if you want. The relay only forwards messages for that room; it does not need accounts for the game.
