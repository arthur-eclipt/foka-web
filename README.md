# FOKA · Touch Marathon (Web PoC)

Hosted concept-validation build of **Touch Marathon** ("The endless caress"), a couples ritual experience by FOKA. Three slot-machine wheels, controlled-chaos selection rules, peel-off zone progression, and a quiet wooden-fortune-wheel soundscape.

## Stack

- Vanilla HTML / CSS / JavaScript. No framework, no build step.
- Web Audio API for synthesized clicks, thunks, and peel swooshes (no audio assets).
- `localStorage` for the Beta opt-in lead capture.

## Local preview

```sh
npx serve .
# or
python -m http.server 5500
```

Open on a phone in landscape (or Chrome DevTools device emulator).

## File layout

```
index.html      markup for all 7 screens
styles.css      burgundy / black / gold theme + wheel + peel animation
script.js       game state, wheel mechanics, spin orchestration, audio
content.js      all visible copy (single point of edit for text changes)
README.md       this file
```

Copy lives entirely in `content.js`. Final wording drops in there without touching markup or styles.

## Screen flow

```
splash (2s)
  → intro 0 (Title + OK)
  → intro 1 (Reset + Continue)
  → intro 2 (Setting / Outfit + We are ready)
  → intro 3 (Golden Rule + Start Marathon)
  → marathon (with "The Connection" overlay fading after 6s)
  → semi-final (Beta opt-in: email + consent checkbox)
  → final (Welcome to the inner circle)
```

## Game logic at a glance

- **Wheel 1 (Giver)** stops first: `[He will caress] / [She will caress]`. Anti-repeat after 2 identical results in a row.
- **Wheel 2 (Receiver)** stops last (narrower + faster): `[his] / [her]`. Anti-repeat for 2 spins after 3 identical results.
- **Wheel 3 (Body Zones)** stops in the middle. 6 zones always active. Random unless a forced-pick is queued. The forced-pick fires when a higher-group zone wins while lower-group zones remain on the wheel — next spin lands on the topmost remaining lower-group zone.
- **Peel-off**: after each spin, the winning zone on Wheel 3 peels away and the next zone from the queue (`group2 ... group3`) is revealed underneath.
- **Ending**: the PoC ends when "Inner Thighs" is peeled into the wheel. No further spins; advance to the Semi-Final.

## Pre-spin display

Before the first SPIN, the three wheels show the title:

```
above:  | The  | endless | caress       |
center: | The  | Touch   | Marathon     |
below:  | This | is a    | demo version |
```

The first SPIN swaps each wheel to its real game items mid-animation.

## Cooldown timing (PoC)

Total cooldown from wheel-stop to SPIN re-active = **4 seconds** (per Cosmin's 2026-05-14 note — tightened from 15s for fluid PoC testing). The timer bar starts filling ~1.5s after wheels stop and reaches 100% at 4s.

## Email capture

The Semi-Final form submits `{ email, consent, timestamp }` to `localStorage` under `foka_subscribers`. Both a valid email and the consent checkbox are required. After submit, the screen transitions to the Final ("Welcome to the inner circle.").

## Deploy

Drop the directory onto Vercel, Cloudflare Pages, or Netlify. Application preset: **Other**. No build step.
