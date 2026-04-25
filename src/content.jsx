// ============================================================
//  Two profiles: GEOFFREY (Minimal page) and ALBERT (Monet page).
//  Each HTML page loads only the profile it needs, but both are
//  defined here so the source files stay parallel and easy to
//  diff/edit side-by-side.
// ============================================================

const GEOFFREY = {
  name: "Geoffrey Jing",
  initials: "GJ",
  location: "San Francisco",
  intro: {
    greeting: "Welcome.",
    paragraphs: [
      "I most recently worked at Judgment Labs as the founding PM. Prior to that, I was an AC within Bain PEG in the NYC office. Now I'm exploring something new.",
      "In my free time, I like to cook, eat, play guitar, and participate in any activity that makes me sweat intensely.",
    ],
  },
  // The trailing "flows" sentence is rendered separately so the
  // word can be wired up as the hidden music trigger.
  flowsLine: {
    prefix: "When I'm out on the golf course, deep in work, or doing any form of writing, I'm usually locked in to some ",
    suffix: ".",
  },
  now: [
    { label: "Exploring",        value: "what's next" },
    { label: "Watching",         value: "Kentucky Derby prep" },
    { label: "Picking up",       value: "a fingerstyle piece" },
    { label: "Sweating through", value: "sauna" },
  ],
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/geoffreyjing/", handle: "geoffreyjing" },
    { label: "Twitter",  href: "https://x.com/geoffrey__jing",              handle: "@geoffrey__jing" },
    { label: "Email",    href: "mailto:hello@geoffreyjing.com",             handle: "hello@geoffreyjing.com" },
  ],
};

const ALBERT = {
  name: "Albert Jing",
  initials: "AJ",
  location: "San Francisco",
  intro: {
    greeting: "Welcome.",
    paragraphs: [
      "Most recently I worked on consumer and defense tech projects at BCG and ate a lot of fancy dinners I wouldn't pay for. Prior to that I founded a personal data monetization startup and worked in software, networking, and crypto domains in product, ops, & engineering roles.",
      "In my free time, I bounce or hit balls (basketball, golf, tennis), and pick up new skills (currently breakdancing). I am a fan of polyglots, underdog athletes, and contrarian investors.",
      "When I have even more free time, I study Xunzi teachings, game theory, and political realism, and watch youtube golf.",
    ],
  },
  flowsLine: {
    prefix: "If I don't respond back on time, you can often find me strolling near a body of water listening to some ",
    suffix: ".",
  },
  now: [
    { label: "Practicing", value: "breakdancing" },
    { label: "Studying",   value: "Xunzi, game theory, realism" },
    { label: "Watching",   value: "YouTube golf" },
    { label: "Often near", value: "a body of water" },
  ],
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/albert-jing", handle: "albertjing" },
    { label: "Twitter",  href: "https://x.com/",               handle: "@albertjing" },
    { label: "Email",    href: "mailto:albertjing1@gmail.com",  handle: "hello@albertjing.com" },
  ],
};

window.PROFILES = { geoffrey: GEOFFREY, albert: ALBERT };
