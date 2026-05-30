// ── XP / Leveling ─────────────────────────────────────────────────────────────
export const XP_PER_LEVEL = (lvl) => lvl * 80;

// ── Streak system ─────────────────────────────────────────────────────────────
export const STREAK_BONUS_XP   = (streak) => streak > 1 ? (streak - 1) * 8 : 0;
export const STREAK_TAME_BOOST = (streak) => Math.min(streak * 0.04, 0.20);

// ── Rarity ────────────────────────────────────────────────────────────────────
export const RARITY_ORDER  = ["common", "uncommon", "rare", "epic", "legendary"];
export const RARITY_WEIGHT = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 };

export const RARITY_COLORS = {
  common:    "#94a3b8",
  uncommon:  "#4ade80",
  rare:      "#60a5fa",
  epic:      "#c084fc",
  legendary: "#fbbf24",
};

export const RARITY_GLOW = {
  common:    "rgba(148,163,184,0.30)",
  uncommon:  "rgba(74,222,128,0.40)",
  rare:      "rgba(96,165,250,0.45)",
  epic:      "rgba(192,132,252,0.50)",
  legendary: "rgba(251,191,36,0.60)",
};

// ── Beast Moods ───────────────────────────────────────────────────────────────
export const BEAST_MOODS = [
  { id: "calm",    emoji: "😌", label: "Calm",    tameMod:  0.10, flavorText: "Watches you with curious, gentle eyes." },
  { id: "playful", emoji: "🎀", label: "Playful", tameMod:  0.15, flavorText: "Bouncing around, clearly wanting attention!" },
  { id: "wary",    emoji: "😰", label: "Wary",    tameMod: -0.10, flavorText: "Keeps its distance, ears pinned back." },
  { id: "fierce",  emoji: "😤", label: "Fierce",  tameMod: -0.20, flavorText: "A low growl rumbles in its chest." },
  { id: "hungry",  emoji: "🍙", label: "Hungry",  tameMod:  0.20, flavorText: "Its tummy rumbles. Do you have a snack?" },
  { id: "sleepy",  emoji: "😴", label: "Sleepy",  tameMod:  0.05, flavorText: "Eyes half-closed. It doesn't seem to mind you." },
];

// ── Random Events ─────────────────────────────────────────────────────────────
export const ENCOUNTER_EVENTS = [
  { id: "shrine",     emoji: "🏮", title: "Ancient Shrine",   desc: "A glowing shrine hums softly. Do you offer a prayer?",
    choices: [{ label: "🙏 Pray",      outcome: "xp", xpGain: 40, msg: "The shrine pulses warmly. +40 XP!" },
              { label: "🏃 Pass By",   outcome: "none",         msg: "You leave it undisturbed. Some things are sacred." }] },
  { id: "treasure",   emoji: "🎁", title: "Hidden Cache",     desc: "A small bundle left by a previous Tamer.",
    choices: [{ label: "✨ Open it!",  outcome: "xp", xpGain: 25, msg: "A note reads 'Keep going.' +25 XP!" },
              { label: "🎀 Leave it",  outcome: "none",         msg: "You leave it for whoever needs it more." }] },
  { id: "ambush",     emoji: "😼", title: "Rival Tamer!",     desc: "A Guild Tamer blocks your path and challenges you.",
    choices: [{ label: "😤 Stare back",outcome: "xp", xpGain: 50, msg: "They blink first. +50 XP!" },
              { label: "🙄 Walk past", outcome: "xp", xpGain: 10, msg: "Not worth your time. +10 XP." }] },
  { id: "wellspring",  emoji: "💧", title: "Soul Wellspring",  desc: "A shimmering pool ripples with pure Soul energy.",
    choices: [{ label: "💫 Drink deep",outcome: "xp", xpGain: 60, msg: "A rush of warmth fills you. +60 XP!" },
              { label: "🖐️ Just touch",outcome: "xp", xpGain: 20, msg: "A tingle runs through your fingers. +20 XP." }] },
  { id: "lostkit",    emoji: "🐣", title: "Lost Hatchling",   desc: "A tiny, confused hatchling looks up with enormous eyes.",
    choices: [{ label: "🤲 Help it home",outcome:"xp", xpGain: 35, msg: "Its family arrives with grateful chirps. +35 XP!" },
              { label: "📷 Take a photo",outcome:"xp", xpGain: 5,  msg: "Cutest thing you've seen all day. +5 XP." }] },
];

// ── Daily Quests ──────────────────────────────────────────────────────────────
const ALL_QUESTS = [
  { id: "tame3",      label: "Tame 3 beasts",          type: "tame",   goal: 3,  reward: 60  },
  { id: "explore3",   label: "Explore 3 zones",         type: "explore",goal: 3,  reward: 40  },
  { id: "tameRare",   label: "Tame a Rare beast",       type: "tameRarity:rare",  goal: 1, reward: 80 },
  { id: "streak3",    label: "Reach a 3× tame streak",  type: "streak", goal: 1,  reward: 100 },
  { id: "tame5",      label: "Tame 5 beasts",           type: "tame",   goal: 5,  reward: 120 },
  { id: "event2",     label: "Trigger 2 random events", type: "event",  goal: 2,  reward: 50  },
];

export function getDailyQuests() {
  const seed = new Date().toDateString();
  const shuffled = [...ALL_QUESTS].sort((a, b) =>
    (seed + a.id).split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 7 -
    (seed + b.id).split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 7
  );
  return shuffled.slice(0, 3);
}

// ── Beasts ────────────────────────────────────────────────────────────────────
export const BEASTS = [
  { id: "fluffpaw",    name: "Fluffpaw",    emoji: "🐾", level: 1, rarity: "common",    color: "#f9a8d4", role: "The Distraction",    ability: "Pink Decoy",       abilityDesc: "Distracts all enemies for 2 turns.",        desc: "Looks entirely harmless, making enemies lower their guard." },
  { id: "bubblefin",   name: "Bubblefin",   emoji: "🫧", level: 1, rarity: "common",    color: "#bae6fd", role: "The Shield",         ability: "Bubble Shield",    abilityDesc: "Wraps Tamer in a bubble for 1 hit.",        desc: "Floats dreamily and absorbs one hit for its Tamer." },
  { id: "sparklet",    name: "Sparklet",    emoji: "✨", level: 1, rarity: "common",    color: "#fde68a", role: "The Catalyst",       ability: "Soul Spark",       abilityDesc: "Ignites Soul Resonance.",                   desc: "Tiny sparks that trigger Soul Resonance — the first sign you are something more." },
  { id: "mossling",    name: "Mossling",    emoji: "🌿", level: 2, rarity: "common",    color: "#86efac", role: "The Tank",           ability: "Root Grasp",       abilityDesc: "Roots enemies for 1 turn.",                 desc: "Bonds with the earth to absorb damage so the Tamer can press forward." },
  { id: "puddlesprout",name: "Puddlesprout",emoji: "🌱", level: 2, rarity: "common",    color: "#bbf7d0", role: "The Healer",         ability: "Rain Bloom",       abilityDesc: "Restores HP each round.",                   desc: "A gentle sprout that brings healing rain wherever it wanders." },
  { id: "gloomice",    name: "Gloomice",    emoji: "🧊", level: 2, rarity: "uncommon",  color: "#a5f3fc", role: "The Lockdown",       ability: "Frost Nova",       abilityDesc: "Freezes all enemies for 2 turns.",          desc: "Freeze control specialist. Its tiny frosty footprints mark the path of a legend." },
  { id: "embercub",    name: "Embercub",    emoji: "🔥", level: 3, rarity: "uncommon",  color: "#fdba74", role: "The Living Furnace", ability: "Warm Aura",        abilityDesc: "Grants freeze immunity.",                   desc: "Radiates warmth, keeping the Tamer immune to freeze spells." },
  { id: "stormwing",   name: "Stormwing",   emoji: "⚡", level: 3, rarity: "uncommon",  color: "#c4b5fd", role: "The Storm Caller",   ability: "Static Field",     abilityDesc: "Chains lightning across all enemies.",      desc: "Rains static electricity across entire battlefields." },
  { id: "moonpup",     name: "Moonpup",     emoji: "🌙", level: 4, rarity: "rare",      color: "#e0e7ff", role: "The Omen",           ability: "Silver Sight",     abilityDesc: "Reveals hidden enemies and traps.",         desc: "Only appears when moonlight hits just right — a sign the wilds trust you." },
  { id: "coralite",    name: "Coralite",    emoji: "🪸", level: 4, rarity: "rare",      color: "#f9a8d4", role: "The Beacon",         ability: "Biolume Pulse",    abilityDesc: "Stuns enemies with blinding flash.",        desc: "A bioluminescent guide through the Glowing Caves." },
  { id: "thundermane", name: "Thundermane", emoji: "🦁", level: 5, rarity: "epic",      color: "#fbbf24", role: "The Silencer",       ability: "Valley Roar",      abilityDesc: "Paralyzes all enemies for 3 turns.",        desc: "Its roar echoes across three valleys, paralyzing elite knights." },
  { id: "voidfox",     name: "Voidfox",     emoji: "🦊", level: 6, rarity: "epic",      color: "#818cf8", role: "The Assassin",       ability: "Phase Walk",       abilityDesc: "Phases through walls and disarms.",         desc: "Phases the Tamer through physical walls and enemy lines." },
  { id: "crystalwyrm", name: "Crystalwyrm", emoji: "🐉", level: 7, rarity: "legendary", color: "#67e8f9", role: "The Ancient",        ability: "Riddle of the Void",abilityDesc: "Solves any trap instantly.",               desc: "Speaks only in riddles — and the answer is always your victory." },
  { id: "solarbeam",   name: "Solarbeam",   emoji: "☀️", level: 8, rarity: "legendary", color: "#fef08a", role: "The Ultimate Divine",ability: "Stellar Nova",     abilityDesc: "Turns darkness into blinding dawn.",        desc: "Channels pure stellar energy. Born from a fallen star to end a world-ending rift." },
];

// ── Zones (with full zone explorer data) ──────────────────────────────────────
export const ZONES = [
  {
    id: "meadow", name: "Verdant Meadow", emoji: "🌸", minLevel: 1,
    beastLevels: [1, 2], color: "#86efac",
    act: "Act I", actTitle: "First Steps",
    weather: "sunny",
    encounterTable: { common: 65, uncommon: 28, rare: 6, epic: 1, legendary: 0 },
    sky:    "linear-gradient(180deg,#7dd3fc 0%,#bfdbfe 30%,#a7f3d0 80%,#4ade80 100%)",
    ground: "linear-gradient(0deg,#15803d,#4ade80)",
    ambience: "The breeze carries sweet wildflower scents...",
    desc: "Peaceful fields buzzing with gentle creatures.",
    story: "Kicked out of the Guild for picking Tamer, you retreat here. When you bond with your first beasts, Soul Resonance ignites.",
    deco: [{ e:"🌳",x:4,y:9,s:58 },{ e:"🌳",x:82,y:6,s:64 },{ e:"☁️",x:36,y:4,s:50 },{ e:"☁️",x:66,y:2,s:38 },{ e:"🌼",x:24,y:71,s:26 }],
    spots: [
      { id:"s1", emoji:"🌿", label:"Rustling Bush",  x:17, y:63, desc:"Leaves twitch without any wind" },
      { id:"s2", emoji:"🌸", label:"Flower Patch",   x:43, y:58, desc:"Petals arranged suspiciously perfectly" },
      { id:"s3", emoji:"🪵", label:"Hollow Log",     x:64, y:68, desc:"A cozy-looking hideout" },
      { id:"s4", emoji:"🕳️", label:"Fresh Burrow",   x:31, y:77, desc:"Still-warm paw prints lead here" },
      { id:"s5", emoji:"💧", label:"Still Pond",     x:78, y:64, desc:"Ripples with no wind at all" },
    ],
    routes: [
      { id:"sunny",   emoji:"🌻", label:"Sunny Trail",   desc:"Easy path through golden wildflowers.",      tag:"Safe",     tc:"#4ade80", ec:0.20 },
      { id:"thicket", emoji:"🌾", label:"Wild Thicket",  desc:"Dense overgrowth hides rare things.",        tag:"Balanced", tc:"#fbbf24", ec:0.15 },
      { id:"creek",   emoji:"🏞️", label:"Creek Bed",     desc:"Rare beasts love fresh water.",              tag:"Risky",    tc:"#f87171", ec:0.10 },
    ],
    particles: "petals",
  },
  {
    id: "forest", name: "Whispering Forest", emoji: "🌳", minLevel: 2,
    beastLevels: [2, 3], color: "#6ee7b7",
    act: "Act I", actTitle: "Deeper In",
    weather: "misty",
    encounterTable: { common: 42, uncommon: 36, rare: 16, epic: 5, legendary: 1 },
    sky:    "linear-gradient(180deg,#052e16 0%,#14532d 45%,#166534 100%)",
    ground: "linear-gradient(0deg,#021a0e,#052e16)",
    ambience: "Ancient trees creak. You feel watched.",
    desc: "Ancient trees hide curious beasts within.",
    story: "A Guild assessment team arrives expecting a corpse. They find you surrounded by moss and crackling static.",
    deco: [{ e:"🌲",x:2,y:7,s:66 },{ e:"🌲",x:76,y:4,s:72 },{ e:"🌳",x:46,y:11,s:64 },{ e:"🍄",x:35,y:68,s:32 },{ e:"🍂",x:59,y:72,s:24 }],
    spots: [
      { id:"s1", emoji:"🌳", label:"Ancient Tree",  x:19, y:54, desc:"Bark carved with old symbols" },
      { id:"s2", emoji:"🍄", label:"Mushroom Ring", x:51, y:62, desc:"Glows faintly gold" },
      { id:"s3", emoji:"🪨", label:"Mossy Rock",    x:71, y:67, desc:"Something moved underneath it" },
      { id:"s4", emoji:"🌊", label:"Dark Stream",   x:35, y:75, desc:"Fish-shapes dart in the depths" },
      { id:"s5", emoji:"🕳️", label:"Tree Hollow",   x:13, y:72, desc:"Big enough to hide something..." },
    ],
    routes: [
      { id:"rootpath",  emoji:"🌳", label:"Root Path",   desc:"Through ancient oaks. Peaceful but shadowed.", tag:"Safe",  tc:"#4ade80", ec:0.20 },
      { id:"darkgrove", emoji:"🌑", label:"Dark Grove",  desc:"No light here. Rare beasts prefer the dark.",  tag:"Risky", tc:"#f87171", ec:0.10 },
      { id:"ravine",    emoji:"🌊", label:"Ravine Edge", desc:"A steep drop reveals a hidden world below.",    tag:"Epic",  tc:"#c084fc", ec:0.08 },
    ],
    particles: "leaves",
  },
  {
    id: "cliffs", name: "Thunder Cliffs", emoji: "⛰️", minLevel: 3,
    beastLevels: [3, 4], color: "#e0e7ff",
    act: "Act II", actTitle: "Altering the Weather",
    weather: "stormy",
    encounterTable: { common: 35, uncommon: 38, rare: 20, epic: 6, legendary: 1 },
    sky:    "linear-gradient(180deg,#1e3a5f 0%,#1e40af 45%,#3b82f6 100%)",
    ground: "linear-gradient(0deg,#1e3a5f,#1d4ed8)",
    ambience: "Gusts carry the cries of aerial beasts.",
    desc: "Gusts carry the cries of aerial beasts.",
    story: "You are no longer just surviving — you are changing the weather of entire zones.",
    deco: [{ e:"⛰️",x:60,y:5,s:70 },{ e:"⛰️",x:10,y:12,s:54 },{ e:"⚡",x:35,y:18,s:36 },{ e:"☁️",x:70,y:25,s:44 }],
    spots: [
      { id:"s1", emoji:"🪨", label:"Cliffside Ledge", x:20, y:58, desc:"A narrow perch with scratches on the stone" },
      { id:"s2", emoji:"⚡", label:"Lightning Stone",  x:48, y:52, desc:"Permanently scorched — something shelters here" },
      { id:"s3", emoji:"🌬️", label:"Wind Tunnel",     x:70, y:62, desc:"Air rushes through with force" },
      { id:"s4", emoji:"🐦", label:"Nest Hollow",      x:33, y:72, desc:"Giant feathers left behind" },
      { id:"s5", emoji:"💧", label:"Cliff Spring",     x:80, y:70, desc:"Trickles from the rock face" },
    ],
    routes: [
      { id:"highpath", emoji:"⛰️", label:"High Path",    desc:"Exposed ridge — stunning but dangerous.",       tag:"Risky",    tc:"#f87171", ec:0.10 },
      { id:"stormway", emoji:"⚡", label:"Storm Way",    desc:"Follow lightning strikes to rare beasts.",      tag:"Rare",     tc:"#60a5fa", ec:0.12 },
      { id:"thermals", emoji:"🌬️", label:"Thermals",    desc:"Ride updrafts to secret aerial nest zones.",    tag:"Balanced", tc:"#fbbf24", ec:0.15 },
    ],
    particles: "sparkles",
  },
  {
    id: "cave", name: "Glowing Caves", emoji: "🕳️", minLevel: 4,
    beastLevels: [4, 5], color: "#fef3c7",
    act: "Act III", actTitle: "Awaking the Ancients",
    weather: "glowing",
    encounterTable: { common: 30, uncommon: 35, rare: 25, epic: 9, legendary: 1 },
    sky:    "linear-gradient(180deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)",
    ground: "linear-gradient(0deg,#020617,#1e293b)",
    ambience: "Bioluminescent light pulses in the deep dark.",
    desc: "Bioluminescent beasts roam underground.",
    story: "Elite adventurers are sent to stop you. You dive into the hazardous underground — and the Ancients answer your call.",
    deco: [{ e:"💎",x:9,y:25,s:38 },{ e:"💎",x:76,y:18,s:34 },{ e:"🪨",x:44,y:50,s:46 },{ e:"✨",x:60,y:42,s:28 },{ e:"💧",x:27,y:67,s:24 }],
    spots: [
      { id:"s1", emoji:"💎", label:"Crystal Formation", x:19, y:57, desc:"Hums at a frequency you feel in your teeth" },
      { id:"s2", emoji:"🌊", label:"Glowing Pool",      x:53, y:64, desc:"The water looks impossibly deep" },
      { id:"s3", emoji:"🧊", label:"Stalactite",        x:73, y:48, desc:"Tiny creatures cling to it" },
      { id:"s4", emoji:"🍄", label:"Cave Fungi",        x:36, y:72, desc:"Glows blue when you approach" },
      { id:"s5", emoji:"🪨", label:"Ancient Carving",   x:13, y:75, desc:"The beast depicted looks real" },
    ],
    routes: [
      { id:"mainshaft",   emoji:"🕳️", label:"Main Shaft",    desc:"Well-worn — others have been here.",               tag:"Balanced", tc:"#fbbf24", ec:0.15 },
      { id:"crystalvein", emoji:"💎", label:"Crystal Vein",  desc:"Follow glowing minerals deeper underground.",      tag:"Rare",     tc:"#60a5fa", ec:0.12 },
      { id:"abyss",       emoji:"🌑", label:"The Abyss",     desc:"No one knows how deep it goes. Perfect.",          tag:"Epic",     tc:"#c084fc", ec:0.08 },
    ],
    particles: "sparkles",
  },
  {
    id: "volcano", name: "Ember Peaks", emoji: "🌋", minLevel: 5,
    beastLevels: [5, 6], color: "#fee2e2",
    act: "Act III", actTitle: "Forces of Nature",
    weather: "scorching",
    encounterTable: { common: 15, uncommon: 30, rare: 30, epic: 22, legendary: 3 },
    sky:    "linear-gradient(180deg,#450a0a 0%,#7f1d1d 50%,#991b1b 100%)",
    ground: "linear-gradient(0deg,#1c0606,#450a0a)",
    ambience: "The ground trembles. Heat shimmers everything.",
    desc: "Fierce beasts thrive in the heat.",
    story: "When the elite Guild party corners you, your Thundermane's roar paralyzes their knights. The Guild realizes: you are not playing with pets.",
    deco: [{ e:"🌋",x:67,y:3,s:74 },{ e:"🪨",x:8,y:46,s:46 },{ e:"🪨",x:49,y:54,s:38 },{ e:"💨",x:27,y:26,s:32 }],
    spots: [
      { id:"s1", emoji:"🪨", label:"Smoldering Boulder", x:21, y:58, desc:"Still warm to the touch" },
      { id:"s2", emoji:"🌋", label:"Lava Crack",         x:50, y:70, desc:"Heat-resistant creatures live down there" },
      { id:"s3", emoji:"💨", label:"Steam Vent",         x:72, y:57, desc:"Creatures use these as warm dens" },
      { id:"s4", emoji:"🖤", label:"Obsidian Shard",     x:38, y:74, desc:"A beast shelters in its shadow" },
      { id:"s5", emoji:"🌫️", label:"Ash Mound",          x:14, y:66, desc:"Fresh tracks disappear into it" },
    ],
    routes: [
      { id:"ash",      emoji:"💨", label:"Ash Fields",     desc:"Soft ash muffles footsteps. Good for sneaking.",       tag:"Balanced", tc:"#fbbf24", ec:0.15 },
      { id:"lavaflow", emoji:"🌋", label:"Lava Flow",      desc:"Epic beasts thrive near active magma channels.",       tag:"Epic",     tc:"#c084fc", ec:0.08 },
      { id:"obsidian", emoji:"🖤", label:"Obsidian Ridge", desc:"Razor-sharp volcanic glass. Worth the danger.",        tag:"Rare",     tc:"#60a5fa", ec:0.10 },
    ],
    particles: "embers",
  },
  {
    id: "void", name: "Void Rift", emoji: "🌌", minLevel: 7,
    beastLevels: [7, 8], color: "#1e1b4b",
    act: "Act IV", actTitle: "The Sovereign of the Rift",
    weather: "void",
    encounterTable: { common: 0, uncommon: 5, rare: 20, epic: 35, legendary: 40 },
    sky:    "linear-gradient(180deg,#020617 0%,#0f0a1e 60%,#1e1b4b 100%)",
    ground: "linear-gradient(0deg,#020617,#0f0a1e)",
    ambience: "The silence here has weight. Reality feels optional.",
    desc: "Only the bravest tamers dare enter.",
    story: "You step forward alone. Your Crystalwyrm speaks its final riddle. Your Solarbeam answers with starlight. You tame the Rift itself.",
    deco: [{ e:"🌌",x:17,y:14,s:58 },{ e:"⚫",x:64,y:23,s:44 },{ e:"💜",x:42,y:9,s:38 },{ e:"👁️",x:81,y:48,s:34 }],
    spots: [
      { id:"s1", emoji:"🌌", label:"Void Rift",     x:19, y:58, desc:"A tear in reality itself" },
      { id:"s2", emoji:"⚫", label:"Void Debris",   x:53, y:64, desc:"Fragments of what was once real" },
      { id:"s3", emoji:"🌀", label:"Dark Portal",   x:72, y:56, desc:"Pulses with contained energy" },
      { id:"s4", emoji:"💜", label:"Soul Crystal",  x:36, y:72, desc:"Trapped light of ancient beasts" },
      { id:"s5", emoji:"👁️", label:"Void Echo",     x:13, y:67, desc:"Something watches from nowhere" },
    ],
    routes: [
      { id:"riftedge",  emoji:"🌌", label:"Rift Edge",     desc:"Walk the boundary between existence and nothing.", tag:"Epic",      tc:"#c084fc", ec:0.08 },
      { id:"debrisfld", emoji:"⚫", label:"Debris Field",  desc:"Follow shattered space into the deep Void.",      tag:"Legendary", tc:"#fbbf24", ec:0.05 },
      { id:"soulstrm",  emoji:"💜", label:"Soul Stream",   desc:"Legendary beasts drink from pure soul energy.",   tag:"Legendary", tc:"#fbbf24", ec:0.05 },
    ],
    particles: "void",
  },
];
