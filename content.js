// Final copy from Cosmin (2026-05-14 update). Swapping placeholder strings
// for production wording; structure here matches script.js / index.html.

const CONTENT = {
  brand: {
    mark: '∞',
    name: 'Touch Marathon',
  },

  splash: {
    name: 'Touch Marathon',
  },

  // 4 intro stages: Title → Reset → Setting/Outfit → Golden Rule.
  // (Spec splits old "Before you begin" into screens 2.1, 2.2, 2.3 plus the
  //  title screen with the OK button.)
  intro: [
    {
      title: 'Touch Marathon',
      subtitle: 'The endless caress.',
      flag: '',
      body: [
        'This is a game for adult couples.',
      ],
      button: 'OK',
    },
    {
      title: 'Touch Marathon',
      subtitle: 'The endless caress.',
      flag: 'Before you begin…',
      body: [
        'The Reset: A warm shower is the "boundary" between daily life and intimacy.',
        'Leave the rush of the day at the door. Touch Marathon isn’t about speed; it’s about being present.',
      ],
      button: 'Continue',
    },
    {
      title: 'Touch Marathon',
      subtitle: 'The endless caress.',
      flag: '',
      body: [
        'The Setting: Dim the lights, play your favorite music, and make sure you won’t be interrupted.',
        'The Outfit: Start by wearing light, comfortable clothes that make you feel attractive. Savor the process of discovering your skin, layer by layer.',
        'Are you ready to rediscover each other through touch?',
      ],
      button: 'We are ready',
    },
    {
      title: 'Touch Marathon',
      subtitle: 'The endless caress.',
      flag: '',
      body: [
        'The Golden Rule: If an area is covered, that piece of clothing must be removed before touching. Every touch must be slow. Do not rush; savor the anticipation.',
      ],
      button: 'Start Marathon',
    },
  ],

  // In-game overlay (Part 4 / "The Connection"). Fades after ~6s.
  overlay: {
    heading: 'The Connection',
    body: [
      'Maintain eye contact as much as possible throughout the game.',
      'Breathe in the same rhythm. And steal a kiss whenever you feel like it.',
    ],
  },

  // Cycling header messages on the Marathon screen.
  headerMessages: [
    'Maintain eye contact as much as possible!',
    'Touch the skin. If it’s in the way, take it off!',
    'Slow is sexy. Don’t rush; let the tension build!',
    'Steal a kiss whenever you feel like it!',
  ],

  // Pre-spin display on the 3 wheels:
  //   above:  | The | endless | caress      |
  //   center: | The | Touch   | Marathon    |
  //   below:  | This | is a   | demo version |
  // Each wheel's initialDisplay is [above, center, below] -- 3 items, currentIdx=1.
  wheels: {
    initialDisplay: {
      w1: ['The', 'The', 'This'],
      w2: ['endless', 'Touch', 'is a'],
      w3: ['caress', 'Marathon', 'demo version'],
    },
    w1: ['He will caress', 'She will caress'],
    w2: ['his', 'her'],
    w3: {
      group1: ['Scalp/Hair', 'Face', 'Palms/Wrists', 'Forearms', 'Feet/Ankles', 'Neck'],
      group2: [
        'Mouth', 'Shoulders/Arms', 'Upper Back', 'Calves/Knees',
        'Lower Back', 'Outer Thighs', 'Abdomen', 'Hips',
      ],
      group3: ['Inner Thighs'],
    },
  },

  // Semi-Final: shown when "Inner Thighs" surfaces. Email capture lives here.
  semiFinal: {
    heading: 'The Touch Marathon is just beginning.',
    body: [
      'You were among the first to explore the mechanics.',
      'Join us as an official Beta tester.',
      'Get a Free Access Code for the Premium version at launch.',
      'Zero spam, just pure adrenaline.',
    ],
    cta: {
      label: '',
      placeholder: 'your@email.com',
      consent: 'I’m okay with being notified for the Beta launch.',
      button: 'Notify Me',
      error: 'Please enter a valid email.',
      consentError: 'Please confirm consent to be notified.',
    },
    teaser: 'The K. S., The I. R. and T.T.T. soon',
  },

  // Final: shown after the user submits on Semi-Final.
  final: {
    heading: 'Welcome to the inner circle.',
    body: [
      'This PoC was just the prelude. In the Beta and Premium versions, we’re raising the stakes with synchronized interactions and total control over the escalation.',
      'We’ll be in touch when the heat rises.',
    ],
  },

  rotate: {
    heading: 'Rotate your device',
    body: 'Touch Marathon is designed for landscape.',
  },
};
