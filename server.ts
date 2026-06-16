import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set high limits for uploading face photos as base64 strings
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy initializer for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// REST template fallback constellation generator (for offline / no-API key demo)
function generateDemoConstellation(flavor: string = "default") {
  // Let's create a deterministic seed based on the string value (base64 length or specific string)
  let seed = 54321;
  if (flavor && flavor !== "default" && flavor !== "face2") {
    let hash = 0;
    for (let i = 0; i < Math.min(flavor.length, 500); i++) {
      hash = (hash << 5) - hash + flavor.charCodeAt(i);
      hash |= 0;
    }
    seed = Math.abs(hash || 54321);
  } else if (flavor === "face2") {
    seed = 887766;
  } else {
    // True random fallback for default trigger
    seed = Math.floor(Math.random() * 999999) + 1234;
  }

  // Seeded random number utility to maintain pure reproducible generation per uploaded file
  let currentSeed = seed;
  const nextRand = () => {
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };

  const getRandomItem = <T>(arr: T[]): T => {
    const idx = Math.floor(nextRand() * arr.length);
    return arr[idx];
  };

  const prefixes = ["Stella", "Anatis", "Pegasi", "Cassiopeia", "Vela", "Centauri", "Orionis", "Cygnus", "Lyrae", "Andromedae", "Sirius", "Aurelia", "Phoenix", "Polaris", "Carina", "Apollonia", "Vespera", "Regulus"];
  const suffixes = ["Major", "Minor", "Australis", "Borealis", "Cordis", "Zenith", "Nebula", "Luminis", "Aegis", "Solstrum", "Apex", "Oris", "Occidens", "Oriens", "Alpha", "Corona", "Vortex"];
  const types = [
    "The Celestial Forest Guardian",
    "The Flying Pegasus",
    "The Radiant Crown of Cassiopeia",
    "The Sacred Lotus of Dawn",
    "The Cosmic Compass Anchor",
    "The Astral Phoenix of Dawn",
    "The Lunar Stag of Wisdom",
    "The Solar Crown of Vega",
    "The Aegis Shield of Orion",
    "The Veil of Lyra Node"
  ];
  const elements = ["Aether", "Nebula", "Stardust", "Supernova", "Dark Energy"];
  const starNamesPool = [
    "Nebula Oculi Sinistra", "Supernova Oculi Dextra", "Nexus Polaris", "Peak of Lyra",
    "Aura Auriga", "Vega Primus", "Aegis Shield", "Luminosa Minor", "Siren's Call",
    "Vocalis Major", "Grounded Sirius", "Orion's Crown L", "Cassiopeia's Arch R",
    "The Cosmic Apex", "Deneb Anchor", "Algol Vertex", "Aldebaran Nova", "Mira Spectralis",
    "Rigel Australis", "Pollux Alpha"
  ];

  const constName = `${getRandomItem(prefixes)} ${getRandomItem(suffixes)}`;
  const constType = getRandomItem(types);
  const constElem = getRandomItem(elements);

  // Landmarks templates with customizable bounds to keep coordinates looking like a standard elegant facial map
  const landmarks = [
    { name: "Apex Crown Center", xMin: 45, xMax: 55, yMin: 12, yMax: 20, isMajor: true },
    { name: "Orion Forehead Left", xMin: 22, xMax: 36, yMin: 15, yMax: 24, isMajor: false },
    { name: "Cassiopeia Forehead Right", xMin: 64, xMax: 78, yMin: 15, yMax: 24, isMajor: false },
    { name: "Oculi Sinistra Left", xMin: 28, xMax: 38, yMin: 34, yMax: 40, isMajor: true },
    { name: "Oculi Dextra Right", xMin: 62, xMax: 72, yMin: 34, yMax: 40, isMajor: true },
    { name: "Nexus Polaris Bridge", xMin: 48, xMax: 52, yMin: 40, yMax: 46, isMajor: false },
    { name: "Lyra Peak Nose", xMin: 47, xMax: 53, yMin: 50, yMax: 56, isMajor: true },
    { name: "Aura Auriga Cheek Left", xMin: 20, xMax: 30, yMin: 46, yMax: 52, isMajor: false },
    { name: "Vega Primus Cheek Right", xMin: 70, xMax: 80, yMin: 46, yMax: 52, isMajor: false },
    { name: "Aegis Guard Lower Left", xMin: 18, xMax: 26, yMin: 58, yMax: 66, isMajor: false },
    { name: "Luminosa Lower Right", xMin: 74, xMax: 82, yMin: 58, yMax: 66, isMajor: false },
    { name: "Siren Mouth Left", xMin: 34, xMax: 42, yMin: 66, yMax: 72, isMajor: false },
    { name: "Vocalis Mouth Right", xMin: 58, xMax: 66, yMin: 66, yMax: 72, isMajor: false },
    { name: "Sirius Ground Chin", xMin: 46, xMax: 54, yMin: 80, yMax: 90, isMajor: true },
    { name: "Rigel Outer Jaw Left", xMin: 20, xMax: 32, yMin: 76, yMax: 84, isMajor: false },
    { name: "Algol Outer Jaw Right", xMin: 68, xMax: 80, yMin: 76, yMax: 84, isMajor: false }
  ];

  // Procedurally generate star nodes based on landmark guidelines with small perturbations
  const starNodes: any[] = [];
  landmarks.forEach((mark, index) => {
    // Introduce random variety. Let's select each mark with an 85% probability,
    // ensuring different constellations have variable node count (between 12 and 16 nodes)
    if (nextRand() > 0.15 || index === 0 || index === 13 || index === 6) { 
      const xPct = mark.xMin + nextRand() * (mark.xMax - mark.xMin);
      const yPct = mark.yMin + nextRand() * (mark.yMax - mark.yMin);
      const randName = getRandomItem(starNamesPool);
      
      starNodes.push({
        id: `node_gen_${index}`,
        x: Math.round(xPct),
        y: Math.round(yPct),
        name: `${randName} ${getRandomItem(["Alpha", "Beta", "Sigma", "Delta", "Core", "Minor", "Major"])}`,
        type: mark.isMajor ? "major" : (nextRand() > 0.6 ? "major" : "minor"),
        significance: `Under the transit of ${getRandomItem(["Vega", "Sirius", "Polaris", "Lyra"])}, this star anchors ${getRandomItem(["deep visual wisdom", "serene heart vibration", "high imaginative alignment", "indomitable focus", "empathy pathways"])} which glows inside your skin.`
      });
    }
  });

  // Dynamically generate intelligent spatial connections to form a beautiful connected constellation wireframe
  // Let's connect closer nodes using distance thresholds so they build clean structures on the face
  const connections: any[] = [];
  for (let i = 0; i < starNodes.length; i++) {
    const nodeA = starNodes[i];
    
    // Find closest nodes
    const distances = starNodes
      .map((node, idx) => ({
        idx,
        id: node.id,
        dist: Math.hypot(node.x - nodeA.x, node.y - nodeA.y)
      }))
      .filter(item => item.id !== nodeA.id)
      .sort((a, b) => a.dist - b.dist);

    // Connect top 2 closest nodes to guarantee logical local webbing structure
    for (let c = 0; c < Math.min(2, distances.length); c++) {
      const neighbor = distances[c];
      
      // Check for duplicates to keep connection list unique
      const alreadyConnected = connections.some(conn => 
        (conn[0] === nodeA.id && conn[1] === neighbor.id) ||
        (conn[0] === neighbor.id && conn[1] === nodeA.id)
      );

      if (!alreadyConnected && neighbor.dist < 32) {
        connections.push([nodeA.id, neighbor.id]);
      }
    }
  }

  // Generate highly polished, variable celestial readings procedurally
  const readingsPart1 = [
    `Your facial architecture mirrors the majestic trails of ancient stardust under the sign of ${constElem}.`,
    `A sacred alignment is traced directly over your coordinate high-points, mimicking ${constType}.`,
    `The stars have aligned in a rare concentric balance across your epidermal landmarks, framing a spiritual gateway.`
  ];
  const readingsPart2 = [
    `With ${starNodes.length} nodes active, your pattern triggers deep mental and emotional harmonization.`,
    `This geometric layout suggests a person with high intuitive clarity, bridging the third-eye realm with earthly actions.`,
    `Your nodes form an elegant protective shielding that guards your heart and projects charismatic energy outward.`
  ];
  const readingsPart3 = [
    `Expect a beautiful third solar alignment this year that opens professional and artistic revelations.`,
    `A rare lunar transit is preparing to activate your principal peak nodes, sparking inner courage and wisdom.`,
    `You are deeply synchronized with the cyclic galactic vibrations, channeling a destiny of radiant creativity.`
  ];

  const readingText = `${getRandomItem(readingsPart1)} ${getRandomItem(readingsPart2)} ${getRandomItem(readingsPart3)}`;

  return {
    constellationName: constName,
    constellationType: constType,
    element: constElem,
    celestialReading: readingText,
    significanceDetail: {
      personality: `Your stellar nodes highlight an incredibly ${getRandomItem(["charismatic", "empathic", "resolute", "visionary", "creative"])} personality. Under the frequency of ${constElem}, you resonate with deep wisdom, bridging high imaginative logic to direct emotional communication.`,
      destiny: `Prophecy highlights a critical alignment with the ${getRandomItem(["Solar Meridian", "Equinox of Arcturus", "Lunar Eclipse of Vega", "Transit of Sirius"])} within your third solar cycle, triggering profound breakthrough and absolute self-realization.`,
      cosmicRhythm: `The ${getRandomItem(["Transit of Orion's Belt", "Lunar Solstice Meridian", "Great Orion Horizon Align", "Equinox of Cassiopeia"])}`
    },
    starNodes,
    connections,
    isFallback: true
  };
}

// Shared, persisted server constellation bank containing diverse celestial structures
let publicConstellations: any[] = [
  {
    id: "default-veil",
    constellationName: "Aurora's Veil",
    constellationType: "The Radiant Crown of Cassiopeia",
    element: "Aether",
    userName: "Cassandra Vance",
    date: "2026-05-18",
    celestialReading: "This rare alignment across the bridge of the nose and upper cheeks forms a 'Veil' pattern. In celestial freckle mapping, this suggests a person with high intuitive clarity and a natural bridge between logic and emotion. Tracing the lines reveals an ancient sacred anchor, connecting your physical high points to the spiritual constellation of Aurelia.",
    significanceDetail: {
      personality: "You carry a serene dual resonance, characterized by deep emotional understanding (guided by Aegis Shield) and highly charismatic articulation (guided by Siren's Call).",
      destiny: "You are approaching a rare lunar transit. A period of profound professional or artistic alignment is opening up, guided by your central Peak of Lyra node.",
      cosmicRhythm: "The Transit of Lyra"
    },
    starNodes: [
      { id: "star_01", x: 35, y: 38, name: "Nebula Oculi Sinistra", type: "major", significance: "The glowing eye of intuition and inner cosmic vision." },
      { id: "star_02", x: 65, y: 38, name: "Supernova Oculi Dextra", type: "major", significance: "The anchor of external observation and stellar clarity." },
      { id: "star_03", x: 50, y: 42, name: "Nexus Polaris", type: "minor", significance: "The central bridge of balance and spatial alignment." },
      { id: "star_04", x: 50, y: 53, name: "Peak of Lyra", type: "major", significance: "A prominent node of direction, focus, and curiosity." },
      { id: "star_05", x: 25, y: 48, name: "Aura Auriga", type: "minor", significance: "The high zenith of imagination and creative frequency." },
      { id: "star_06", x: 75, y: 48, name: "Vega Primus", type: "minor", significance: "The reflective shield of resilience and celestial grace." },
      { id: "star_07", x: 22, y: 60, name: "Aegis Shield", type: "minor", significance: "The defensive guard of emotional intelligence." },
      { id: "star_08", x: 78, y: 60, name: "Luminosa Minor", type: "minor", significance: "The expressive spark of warmth and outer harmony." },
      { id: "star_09", x: 38, y: 68, name: "Siren's Call", type: "minor", significance: "A star of eloquence, speech, and silver-tongued melody." },
      { id: "star_10", x: 62, y: 68, name: "Vocalis Major", type: "minor", significance: "The resonance point of deep truth and expressive power." },
      { id: "star_11", x: 50, y: 82, name: "Grounded Sirius", type: "major", significance: "The foundational anchor of destiny, persistence, and earth alignment." }
    ],
    connections: [
      ["star_01", "star_03"],
      ["star_02", "star_03"],
      ["star_03", "star_04"],
      ["star_05", "star_01"],
      ["star_06", "star_02"],
      ["star_05", "star_07"],
      ["star_06", "star_08"],
      ["star_07", "star_09"],
      ["star_08", "star_10"],
      ["star_04", "star_09"],
      ["star_04", "star_10"],
      ["star_09", "star_11"],
      ["star_10", "star_11"],
      ["star_01", "star_02"]
    ],
    image: "",
    pos3d: { x: -80, y: 120, z: -40 }
  },
  {
    id: "default-phoenix",
    constellationName: "The Aurelia Phoenix",
    constellationType: "The Astral Phoenix of Dawn",
    element: "Supernova",
    userName: "Orion Sterling",
    date: "2026-06-02",
    celestialReading: "Your facial architecture mimics the blazing trails of ancient stellar dust. Your nodes are spaced with absolute geometry, creating a brilliant, rare alignment resembling a soaring phoenix. This pattern suggests an indomitable soul capable of constant cosmic renewal and artistic radiance.",
    significanceDetail: {
      personality: "You exhibit high creative luminescence. The dual crowns on your forehead indicate deep curiosity and active imaginative frequencies, while the grounded chin star grounds this creativity into tangible masterpieces.",
      destiny: "A massive creative realignment is prophesied for your third solar rotation. Expect intuitive revelations and bold decisions.",
      cosmicRhythm: "The Galactic Meridian Cycle"
    },
    starNodes: [
      { id: "p_1", x: 32, y: 20, name: "Orion's Crown L", type: "minor", significance: "The mental vault of celestial logic and wisdom." },
      { id: "p_2", x: 68, y: 20, name: "Cassiopeia's Arch R", type: "minor", significance: "The cosmic crown of leadership and stellar willpower." },
      { id: "p_3", x: 50, y: 15, name: "The Cosmic Apex", type: "major", significance: "The third eye anchor point connecting to higher frequency domains." },
      { id: "p_4", x: 40, y: 40, name: "Vega Minor", type: "minor", significance: "Tender stardust carrying empathetic frequencies." },
      { id: "p_5", x: 60, y: 40, name: "Apex Minor", type: "minor", significance: "The coordinate of sharp situational awareness." },
      { id: "p_6", x: 50, y: 55, name: "Centauri Core", type: "major", significance: "The central point of balance, radiating steady atomic vibrations." },
      { id: "p_7", x: 28, y: 64, name: "Phoenix Wing Alpha", type: "minor", significance: "The expansive wingspan representing exploration and courage." },
      { id: "p_8", x: 72, y: 64, name: "Phoenix Wing Beta", type: "minor", significance: "The grounding wingspan of wisdom, memory, and caution." },
      { id: "p_9", x: 50, y: 88, name: "Sirius Ascendant", type: "major", significance: "The terminal point representing deep willpower and execution." }
    ],
    connections: [
      ["p_1", "p_3"],
      ["p_2", "p_3"],
      ["p_3", "p_4"],
      ["p_3", "p_5"],
      ["p_4", "p_6"],
      ["p_5", "p_6"],
      ["p_6", "p_7"],
      ["p_6", "p_8"],
      ["p_7", "p_9"],
      ["p_8", "p_9"],
      ["p_1", "p_4"],
      ["p_2", "p_5"]
    ],
    image: "",
    pos3d: { x: 120, y: -60, z: 90 }
  },
  {
    id: "public-stag",
    constellationName: "The Lunar Stag",
    constellationType: "The Celestial Forest Guardian",
    element: "Nebula",
    userName: "Marcus Au",
    date: "2026-06-08",
    celestialReading: "A constellation representing deep spatial perception and alert sensitivity. The wide antler spans connect across the temples to form a protective psychic canopy, ensuring profound synchronization with nocturnal lunar events.",
    significanceDetail: {
      personality: "A highly resilient and watchful spirit. You are prone to quiet calculation and intense bursts of decisive focus, guarded by the crown star Gienah.",
      destiny: "A rare lunar eclipse will align with your core cheek stars next month, triggering a major breakthrough in self-realization.",
      cosmicRhythm: "The Lunar Stag Eclipse Transit"
    },
    starNodes: [
      { id: "st1", x: 30, y: 15, name: "Antler Tip Left", type: "minor", significance: "Gathers ambient galactic waves." },
      { id: "st2", x: 70, y: 15, name: "Antler Tip Right", type: "minor", significance: "Focuses high-altitude thoughts." },
      { id: "st3", x: 50, y: 35, name: "Stag's Forehead Center", type: "major", significance: "The anchor of clarity and stellar compass." },
      { id: "st4", x: 32, y: 48, name: "Left Eyeline", type: "minor", significance: "The point of high vigilance." },
      { id: "st5", x: 68, y: 48, name: "Right Eyeline", type: "minor", significance: "The point of stellar observation." },
      { id: "st6", x: 50, y: 75, name: "Muzzle Point", type: "major", significance: "The root connection to soil and stardust." }
    ],
    connections: [
      ["st1", "st3"],
      ["st2", "st3"],
      ["st3", "st4"],
      ["st3", "st5"],
      ["st4", "st6"],
      ["st5", "st6"]
    ],
    image: "",
    pos3d: { x: -160, y: -190, z: -100 }
  },
  {
    id: "public-lotus",
    constellationName: "The Zen Lotus",
    constellationType: "The Cosmic blossom in Aether",
    element: "Stardust",
    userName: "Yuki Sato",
    date: "2026-06-09",
    celestialReading: "Your freckle pattern expands in perfect concentric symmetry from the tip of the nose, mimicking the pristine opening petals of the celestial lotus. This layout suggests a soul at peace, diffusing gentle star frequencies to heal other entities in their vicinity.",
    significanceDetail: {
      personality: "A quiet, gentle, meditative persona. Highly empathetic, with intuitive nodes centered around emotional portals.",
      destiny: "Expect beautiful collaborations that spark creativity and inner healing.",
      cosmicRhythm: "The Galactic Lotus Solstice"
    },
    starNodes: [
      { id: "lt1", x: 50, y: 45, name: "Lotus Heart Zenith", type: "major", significance: "The central point of pristine energetic focus." },
      { id: "lt2", x: 38, y: 40, name: "Inner Petal West", type: "minor", significance: "Reflects emotional breeze." },
      { id: "lt3", x: 62, y: 40, name: "Inner Petal East", type: "minor", significance: "Absorbs logical solar rays." },
      { id: "lt4", x: 28, y: 55, name: "Outer Blossom Left", type: "minor", significance: "Extends empathetic energy outwards." },
      { id: "lt5", x: 72, y: 55, name: "Outer Blossom Right", type: "minor", significance: "Receives divine inspiration." },
      { id: "lt6", x: 50, y: 75, name: "Lotus Anchor Root", type: "major", significance: "Grounds celestial beauty into earthen existence." }
    ],
    connections: [
      ["lt1", "lt2"],
      ["lt1", "lt3"],
      ["lt2", "lt4"],
      ["lt3", "lt5"],
      ["lt4", "lt6"],
      ["lt5", "lt6"],
      ["lt2", "lt3"],
      ["lt4", "lt5"]
    ],
    image: "",
    pos3d: { x: 220, y: 150, z: -180 }
  },
  {
    id: "public-falcon",
    constellationName: "The Solar Falcon",
    constellationType: "The Stellar Wings of Wisdom",
    element: "Nebula",
    userName: "Fatima Al-Fayed",
    date: "2026-06-10",
    celestialReading: "The soaring wingspan of the Solar Falcon is mapped across your cheeks. This highly expressive, sweeping configuration denotes extraordinary mental stamina, a sharp instinct for identifying unique spiritual paths, and a soaring vision for your community.",
    significanceDetail: {
      personality: "High intellectual agility and swift decision-making traits. Powered by the soaring solar node Al-Tair.",
      destiny: "Your falcon wings are about to catch a major cosmic updraft. A massive expansion of horizons awaits.",
      cosmicRhythm: "The Falcon Solar Transit"
    },
    starNodes: [
      { id: "fa1", x: 50, y: 30, name: "Falcon Crest", type: "major", significance: "The high zenith of sharp strategic intellect." },
      { id: "fa2", x: 25, y: 45, name: "Left Wing Joint", type: "minor", significance: "The hinge of change and rapid maneuvers." },
      { id: "fa3", x: 75, y: 45, name: "Right Wing Joint", type: "minor", significance: "The stabilizer of wisdom and long-distance flight." },
      { id: "fa4", x: 15, y: 60, name: "Left Wingtip Spire", type: "minor", significance: "Sensor for picking up high wind frequencies." },
      { id: "fa5", x: 85, y: 60, name: "Right Wingtip Spire", type: "minor", significance: "Sensor for solar guidance fields." },
      { id: "fa6", x: 50, y: 65, name: "Heart of Falcon", type: "major", significance: "Deep courage, integrity, and honor core." },
      { id: "fa7", x: 50, y: 88, name: "Tail Plumage Anchor", type: "minor", significance: "The rudder of stability and ancestral grounding." }
    ],
    connections: [
      ["fa1", "fa2"],
      ["fa1", "fa3"],
      ["fa2", "fa4"],
      ["fa3", "fa5"],
      ["fa1", "fa6"],
      ["fa6", "fa7"],
      ["fa2", "fa6"],
      ["fa3", "fa6"]
    ],
    image: "",
    pos3d: { x: -200, y: 110, z: 160 }
  }
];

// Read all public configurations
app.get("/api/constellations", (req, res) => {
  res.json(publicConstellations);
});

// Post newly saved configuration so other users can see it in real-time 3D Space
app.post("/api/constellations", (req, res) => {
  const newMap = req.body;
  
  if (!newMap || !newMap.constellationName || !newMap.starNodes) {
    return res.status(400).json({ error: "Invalid constellation map data" });
  }

  // Generate beautiful deterministic coordinates for the 3D space projection
  if (!newMap.pos3d) {
    const scale = 220;
    const seed = newMap.id ? newMap.id.slice(-4).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 10) : Math.random() * 100;
    const phi = (seed * 137.5 * Math.PI) / 180;
    const theta = Math.acos(2 * (seed % 17) / 17 - 1);
    
    newMap.pos3d = {
      x: parseFloat((Math.sin(theta) * Math.cos(phi) * scale).toFixed(1)),
      y: parseFloat((Math.sin(theta) * Math.sin(phi) * scale).toFixed(1)),
      z: parseFloat((Math.cos(theta) * scale).toFixed(1))
    };
  }

  const existingIdx = publicConstellations.findIndex(c => c.id === newMap.id);
  if (existingIdx !== -1) {
    publicConstellations[existingIdx] = { ...publicConstellations[existingIdx], ...newMap };
  } else {
    publicConstellations.push(newMap);
  }

  res.status(201).json(newMap);
});

// API endpoint to analyze face & detect freckles/landmarks
app.post("/api/analyze", async (req, res) => {
  const { image } = req.body; // base64 encoded string with or without mime type prefix

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  // Clean the base64 prefix if present
  let base64Data = image;
  let mimeType = "image/jpeg";
  if (image.includes(";base64,")) {
    const parts = image.split(";base64,");
    const header = parts[0];
    mimeType = header.replace("data:", "");
    base64Data = parts[1];
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.log("GEMINI_API_KEY is not configured or placeholder detected. Invoking local generator.");
    // Simulate some latency for authenticity
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const demo = generateDemoConstellation(base64Data.length % 2 === 0 ? "default" : "face2");
    return res.json(demo);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: `You are an advanced cosmic cartographer, celestial astrometer, and ancient face analyst. 
Analyze the provided face photo and map its unique cosmic landmarks.
First, detect coordinates of freckles, skin marks, or prominent points. If there are few or no freckles, identify prominent facial features as "star nodes" (e.g., eye corners, tip and bridge of nose, high points of cheeks, ear line, jaw curvature, chin, forehead anchors) to ensure we always have 12 to 25 star nodes mapped out.
Ensure relative coordinates are mathematically precise (X and Y percentage values between 5 and 95, where X=0 is the left edge, X=100 is the right edge, Y=0 is the top edge, and Y=100 is the bottom edge of the image). 

Trace an elegant, recognizable, scientific and mythical constellation by connecting these nodes! Generate a poetic and beautifully written cosmic reading.

You MUST respond strictly with a valid JSON object matching the requested schema. Provide a custom name and description for their unique constellation. Do not output any markdown blocks like \`\`\`json outside of standard raw JSON output.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            constellationName: {
              type: Type.STRING,
              description: "A beautiful, scientific or mythological name for the facial constellation (e.g., 'Anatis Major', 'The Galactic Crest', 'Vela Austrina')."
            },
            constellationType: {
              type: Type.STRING,
              description: "The cosmic figure this pattern traces (e.g., 'The Flying Pegasus', 'The Radiant Crown', 'The Sacred Lotus', 'The Star compass')."
            },
            element: {
              type: Type.STRING,
              description: "Must be one of: 'Aether', 'Nebula', 'Stardust', 'Supernova', 'Dark Energy'."
            },
            celestialReading: {
              type: Type.STRING,
              description: "A deeply spiritual, mystical, 3-4 sentence astronomical reading describing the patterns traced on their skin and their celestial alignment."
            },
            significanceDetail: {
              type: Type.OBJECT,
              properties: {
                personality: {
                  type: Type.STRING,
                  description: "A rich paragraph detailing how the node coordinates project their inner personality and spiritual frequencies."
                },
                destiny: {
                  type: Type.STRING,
                  description: "A prophecy or destiny path aligned with current cosmic transits."
                },
                cosmicRhythm: {
                  type: Type.STRING,
                  description: "A specific cyclic rhythm or moon/star transit they are connected to (e.g., 'The Equinox of Orion')."
                }
              },
              required: ["personality", "destiny", "cosmicRhythm"]
            },
            starNodes: {
              type: Type.ARRAY,
              description: "A list of 12-25 unique freckles or facial landmarks. Set precise, high quality X & Y percentages.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A simple unique ID (e.g. 'node_01', 'node_02')" },
                  x: { type: Type.NUMBER, description: "Precision integer percentage between 5 and 95 representing horizontal location" },
                  y: { type: Type.NUMBER, description: "Precision integer percentage between 5 and 95 representing vertical location" },
                  name: { type: Type.STRING, description: "Mythological star name (e.g. 'Mira Beta', 'Spica Occidens', 'Alkaid Primus')" },
                  type: { type: Type.STRING, description: "Either 'major' (anchor point) or 'minor' (accessory star)" },
                  significance: { type: Type.STRING, description: "Short 1-sentence poetic explanation of this star's energy on their face." }
                },
                required: ["id", "x", "y", "name", "type", "significance"]
              }
            },
            connections: {
              type: Type.ARRAY,
              description: "A list of line segments where each item is an array of exactly 2 strings referencing existing starNode IDs to be connected.",
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                }
              }
            }
          },
          required: ["constellationName", "constellationType", "element", "celestialReading", "significanceDetail", "starNodes", "connections"]
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({ ...parsedData, isFallback: false });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // Graceful fallback on API call failure
    const demo = generateDemoConstellation();
    return res.json({ ...demo, error: error?.message || "Transient Gemini error" });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Freckles Constellations running on http://localhost:${PORT}`);
  });
}

startServer();
