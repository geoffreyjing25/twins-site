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
      "I'm Geoffrey, welcome to my site. I most recently worked at Judgment Labs as the founding PM.",
      "Prior to that, I was an AC within Bain PEG in the NYC office. Before that, I interned in product & engineering roles at early-stage startups and Fortune 500 companies, and was a scout/fellow at Soma Capital, .406 Ventures, and V11. Now I'm exploring something new.",
      "In my free time, I like to read, eat clean, play guitar, and participate in any activity that makes me sweat intensely.",
    ],
  },
  // The trailing "flows" sentence is rendered separately so the
  // word can be wired up as the hidden music trigger.
  // flowsLine: {
  //   prefix: "You can often find me out on the golf course, deep in work, or learning something new,",
  //   suffix: ".",
  // },
  now: [
    { label: "Exploring",        value: "something new" },
    { label: "Building",       value: "a side project for SMBs" },
    { label: "Watching",         value: "Triple Crown" }, 
    { label: "Sweating through", value: "sauna" },
  ],
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/geoffreyjing/", handle: "geoffreyjing" },
    { label: "Twitter",  href: "https://x.com/geoffrey__jing",              handle: "@geoffrey__jing" },
    { label: "Email",    href: "mailto:jinggeoffrey[@]gmail.com",             handle: "jinggeoffrey@gmail.com" },
  ],
};

const ALBERT = {
  name: "Albert Jing",
  initials: "AJ",
  location: "Midwest",
  intro: {
    greeting: "Welcome.",
    paragraphs: [
      "Hey I'm Albert, thanks for stopping by.Most recently I worked on consumer and defense tech projects at BCG. Prior to that I founded a personal data monetization startup and worked in software, networking, and crypto domains in product, ops, & engineering roles.",
      "In my free time, I stay active through basketball, golf, and tennis. I am a fan of polyglots, underdog athletes, and contrarian investors.",
      // "I am interested in Xunzi teachings, game theory, and political realism.",
    ],
  },
  flowsLine: {
    prefix: "You can often find me strolling near a body of water listening to some ",
    suffix: ".",
  },
  // now section intentionally hidden — keep for future re-enable.
  // now: [
  //   { label: "Practicing", value: "breakdancing" },
  //   { label: "Reading",   value: "Xunzi, game theory, and political realism" },
  //   { label: "Often near", value: "a body of water" },
  // ],
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/albert-jing", handle: "albertjing" },
    { label: "Twitter",  href: "https://x.com/",               handle: "@albertjing" },
    { label: "Email",    href: "mailto:albertjing1@gmail.com",  handle: "hello@albertjing.com" },
  ],
};

window.PROFILES = { geoffrey: GEOFFREY, albert: ALBERT };
