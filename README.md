# FOKA · Marathon (Web PoC)

Hosted concept-validation build of **Marathon** ("The endless marathon"), a couples ritual experience by FOKA. Three slot-machine wheels, controlled-chaos selection rules, peel-off letter progression, and a quiet wooden-fortune-wheel soundscape.

Built per `foka-marathon-poc-brief.md` (Arthur / eclipt ai, 2026-05-12).

## Stack

- Vanilla HTML / CSS / JavaScript. No framework, no build step.
- Web Audio API for synthesized clicks, thunks, and peel swooshes (no audio assets).
- `localStorage` for email lead capture.

## Local preview

Any static server will do, for example:

```sh
npx serve .
# or
python -m http.server 5500
```

Then open `http://localhost:<port>` on a phone in landscape (or use Chrome DevTools' device emulator).

## File layout

```
index.html      markup for all 6 screens
styles.css      burgundy / black / gold theme + wheel + peel animation
script.js       game state, wheel mechanics, spin orchestration, audio
content.js      placeholder copy from Cosmin's content draft
README.md       this file
```

Copy lives entirely in `content.js`. Cosmin's final text drops in there without touching markup or styles.

## Screen flow

`splash → intro 1 → intro 2 → intro 3 → marathon → final`

The 4th onboarding fragment ("Golden Rule") appears as a fade-out overlay at the start of the Marathon screen.

## Game logic at a glance

- **Wheel 1** (stops first): anti-repeat after 2 identical results in a row.
- **Wheel 2** (stops last, faster): anti-repeat for 2 spins after 3 identical results.
- **Wheel 3** (6 letters always active): randomly drawn unless a forced-pick is queued. The forced-pick rule triggers when a higher-group letter wins while lower-group letters remain on the wheel — the next spin is forced to the topmost remaining lower-group letter.
- **Peel-off**: after each spin, the winning letter on Wheel 3 peels away and the next letter from the queue (`group 2 ... group 3`) is revealed underneath.
- **Ending**: the PoC ends when "Inner Thighs" is peeled into the wheel. No further spins.

## Cooldown timing

After the wheels stop, the SPIN button reactivates 30 seconds later. Per the locked interpretation in the brief: the timer bar starts filling at t = 3s post-stop and reaches 100% at t = 30s.

## Email capture

The "Notify Me" form on the final screen persists `{ email, timestamp }` entries to `localStorage` under the key `foka_subscribers`. No backend.

## Deploy

Drop the directory onto Cloudflare Pages, Netlify, or any static host. No build step required.
