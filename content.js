// Placeholder copy from Cosmin's content draft. Word counts and lengths match
// the final version so layout decisions transfer cleanly. Final copy will be
// dropped in here without changes to markup or styles.

const CONTENT = {
  brand: {
    mark: '∞',          // infinity glyph
    name: 'Marathon',
  },

  splash: {
    // logo + name only; no body copy
    name: 'Marathon',
  },

  intro: [
    {
      title: 'Marathon',
      subtitle: 'The endless marathon.',
      flag: 'Before you begin…',
      body: [
        "Kdwim vgz qjov oy kda xhm og vda lwwf. Gmwdf Kmdsqvzx gfv’v mbmwa opbmh; vg’v mbmwa pbmhf xndfbmv.",
        "The Reset: M vbgf fvbifg mf vbg \"ibvmebhg\" igviffs emjmx xfgh rme jvjbfmbt.",
      ],
      button: 'Next',
    },
    {
      title: 'Marathon',
      subtitle: 'The endless marathon.',
      body: [
        "The Outfit: Lpduv ef jxhulqj rltky, dshmkwubvep asbwkhv gksv isnu bxd mbbc dwwudfwlyh. Ldyru kkh syvshlv vy glvfrzhulqj bxdv tnlq, rbvhu eb rbvhu.",
        "Rule: Vj yf lkxo pf klsfnmo, fsvf jnxid bi hmwvjshm gvlk ch bmdszmo cmipim vkshvjshm.",
      ],
      button: 'Next',
    },
    {
      title: 'Marathon',
      subtitle: 'The endless marathon.',
      body: [
        "The Setting: Gzo vhe rwbvhy, xskm lhwv vmxkyrvu mwhzd, mof tkmv hfky lhw mwf’u hf qbmvbyyvghm.",
        "The Connection: Vzqrezyr ppr dzyvngv zg qxsh zg lwaaxlsf kshxdmzkzf vhe kshf. Slszvur zg vhe rwvf dbeivf. Zve ksvzf z qvff lsuzvlr rwb hffz fvdr kv.",
      ],
      button: 'Start Marathon',
    },
  ],

  // 4th onboarding fragment: appears as an overlay on the Marathon screen at
  // start, fades away after a few seconds.
  overlay: {
    heading: 'The Golden Rule',
    body: [
      "Xptmy kfswd qvlk yf lsqm. Qz rfi gswd; xmtpi vhe mrvzdizbsvzd.",
      "Are you ready to rediscover each other?",
    ],
  },

  // Header strip on the Marathon screen, cycles every 5s, never stops.
  headerMessages: [
    'Pshashsh fbh dshshshsh sh fshsh fh dshshshsh!',
    'Xnbdi fbi lrpv. Lm rz’v sv fbi nzh, dzhf rd bmm!',
    'Gfbi qz gbwf. Zbt’f nzhh; fbi fbhvdrb mxtpf!',
    'Vpwzl b dshv jshshshsh ksh shshl shshsh sh!',
  ],

  // Wheel content -- placeholder lengths matched to final version.
  // PoC ships with 2 options on W1 and W2; final adds more.
  wheels: {
    w1: ['eo AMFQ tZTCOj', 'phn AMFQ tZTCOj'],
    w2: ['csl', 'kfn'],
    w3: {
      // Each group is a queue. Group 1 seeds the wheel; Groups 2 and 3 feed
      // in via peel-off as letters are consumed.
      group1: [
        'aaaaaaaaaaaaa',
        'bbbbbbbbbbbbb',
        'ccccccccccccc',
        'ddddddddddddd',
        'eeeeeeeeeeeee',
        'fffffffffffff',
      ],
      group2: [
        'gggggggggggg',
        'hhhhhhhhhhhh',
        'iiiiiiiiiiii',
        'jjjjjjjjjjjj',
        'kkkkkkkkkkkk',
        'llllllllllll',
        'mmmmmmmmmmmm',
        'nnnnnnnnnnnn',
      ],
      group3: ['Inner Thighs'],
    },
  },

  final: {
    heading: 'Thank you',
    body: [
      'Vzqrezyr ppr dzyvngv zg qxsh zg lwaaxlsf kshxdmzkzf vhe kshf.',
      'Slszvur zg vhe rwvf dbeivf.',
    ],
    cta: {
      label: 'Be the first to know when Marathon launches.',
      placeholder: 'your@email.com',
      button: 'Notify Me',
      success: "You’re on the list.",
      error: 'Please enter a valid email.',
    },
  },

  rotate: {
    heading: 'Rotate your device',
    body: 'Marathon is designed for landscape.',
  },
};
