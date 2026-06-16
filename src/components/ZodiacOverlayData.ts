export interface ZodiacConstellation {
  name: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  nodes: { name: string; x: number; y: number }[];
  connections: [number, number][]; // Index pairs representing lines
  blurb: string;
  rhythm: string;
}

export const ZODIAC_CONSTELLATIONS: ZodiacConstellation[] = [
  {
    name: "Aries",
    symbol: "♈",
    element: "Fire",
    nodes: [
      { name: "Hamal", x: 35, y: 25 },
      { name: "Sheratan", x: 48, y: 30 },
      { name: "Mesarthim", x: 60, y: 42 },
      { name: "Botein", x: 68, y: 55 }
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3]
    ],
    blurb: "Your skin alignment projects an indomitable pioneer drive. The alignment with Hamal highlights deep willpower, natural leadership intuition, and an active cosmic spark.",
    rhythm: "Aries Solar Fire cycle"
  },
  {
    name: "Taurus",
    symbol: "♉",
    element: "Earth",
    nodes: [
      { name: "Elnath", x: 30, y: 25 },
      { name: "Alcyone (Pleiades)", x: 42, y: 35 },
      { name: "Aldebaran", x: 55, y: 48 },
      { name: "Ain", x: 65, y: 40 },
      { name: "Hyadum I", x: 75, y: 45 },
      { name: "Lambda Tauri", x: 50, y: 60 }
    ],
    connections: [
      [0, 2],
      [1, 2],
      [2, 3],
      [2, 4],
      [3, 4],
      [4, 5]
    ],
    blurb: "A classic pattern of grounding, loyalty, and organic harmony. The connection near Aldebaran acts as a stabilizer, reflecting deep devotion and sensual natural frequency.",
    rhythm: "Transit of the Pleiades"
  },
  {
    name: "Gemini",
    symbol: "♊",
    element: "Air",
    nodes: [
      { name: "Castor", x: 35, y: 20 },
      { name: "Pollux", x: 65, y: 20 },
      { name: "Mebsuta", x: 38, y: 45 },
      { name: "Wasat", x: 62, y: 45 },
      { name: "Tejat Posterior", x: 35, y: 75 },
      { name: "Alhena", x: 65, y: 75 }
    ],
    connections: [
      [0, 2],
      [2, 4],
      [1, 3],
      [3, 5],
      [0, 1],
      [2, 3]
    ],
    blurb: "Highly expressive, intellectual, and dual-resonant coordinates. Mapped symmetrically over the cerebral hemispheres, showcasing silver-tongued eloquent frequencies.",
    rhythm: "The Twins Double-Sun cycle"
  },
  {
    name: "Cancer",
    symbol: "♋",
    element: "Water",
    nodes: [
      { name: "Tegmine", x: 50, y: 30 },
      { name: "Asellus Borealis", x: 50, y: 50 },
      { name: "Acubens", x: 35, y: 65 },
      { name: "Altarf", x: 65, y: 65 }
    ],
    connections: [
      [0, 1],
      [1, 2],
      [1, 3]
    ],
    blurb: "Deeply reflective, maternal, and emotionally intelligent aura. The nodes gather in a sacred anchor configuration, suggesting high protection circles around loved ones.",
    rhythm: "The Lunar Solstice tide"
  },
  {
    name: "Leo",
    symbol: "♌",
    element: "Fire",
    nodes: [
      { name: "Denebola", x: 50, y: 20 },
      { name: "Zosma", x: 65, y: 35 },
      { name: "Chertan", x: 62, y: 55 },
      { name: "Regulus", x: 45, y: 52 },
      { name: "Algieba", x: 35, y: 42 },
      { name: "Adhafera", x: 40, y: 28 },
      { name: "Rasalas", x: 48, y: 26 }
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 4]
    ],
    blurb: "Radiates stellar charisma, warmth, and artistic dominance. The primary anchor near Regulus acts as a regal heart of light, amplifying your magnetic presence.",
    rhythm: "The Lion Solstice alignment"
  },
  {
    name: "Virgo",
    symbol: "♍",
    element: "Earth",
    nodes: [
      { name: "Zavijava", x: 30, y: 30 },
      { name: "Porrima", x: 42, y: 38 },
      { name: "Spica", x: 50, y: 55 },
      { name: "Heze", x: 65, y: 45 },
      { name: "Vindemiatrix", x: 55, y: 30 },
      { name: "Syrma", x: 72, y: 35 }
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 4],
      [3, 5]
    ],
    blurb: "Highly refined, detail-oriented, and pristine coordinate system. Spica acts as a sparkling beacon of pure spiritual clarity and natural healing capability.",
    rhythm: "The Virgin Harvest moon"
  },
  {
    name: "Libra",
    symbol: "♎",
    element: "Air",
    nodes: [
      { name: "Zubeneschamali", x: 50, y: 22 },
      { name: "Zubenelgenubi", x: 35, y: 48 },
      { name: "Zubenhakrabi", x: 65, y: 48 },
      { name: "Zubenalubi", x: 50, y: 68 }
    ],
    connections: [
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 3],
      [2, 3]
    ],
    blurb: "Harmonic justice and divine aesthetic equivalence. The scales map over your nasal and cheek geometry, channeling high diplomats' serene vibrational field.",
    rhythm: "The Autumnal Equinox balance"
  },
  {
    name: "Scorpio",
    symbol: "♏",
    element: "Water",
    nodes: [
      { name: "Graffias", x: 25, y: 30 },
      { name: "Dschubba", x: 35, y: 35 },
      { name: "Antares", x: 48, y: 48 },
      { name: "Alniyat", x: 52, y: 62 },
      { name: "Larawag", x: 60, y: 72 },
      { name: "Shaula", x: 72, y: 78 },
      { name: "Lesath", x: 82, y: 70 }
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6]
    ],
    blurb: "Deep water alchemy, magnetic transformation, and unyielding steel aura. Antares glows as a crimson primary heart, generating immense intuitive and somatic current.",
    rhythm: "The Scorpion Transit of Antares"
  },
  {
    name: "Sagittarius",
    symbol: "♐",
    element: "Fire",
    nodes: [
      { name: "Alnasl", x: 30, y: 55 },
      { name: "Kaus Media", x: 42, y: 45 },
      { name: "Kaus Australis", x: 40, y: 65 },
      { name: "Kaus Borealis", x: 55, y: 40 },
      { name: "Nunki", x: 58, y: 58 },
      { name: "Ascella", x: 70, y: 55 },
      { name: "Hecatebolus", x: 72, y: 40 }
    ],
    connections: [
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 3],
      [3, 4],
      [4, 5],
      [3, 6],
      [5, 6]
    ],
    blurb: "The interstellar voyager and philosophical archer. The bow lines cross your cheeks, releasing high-velocity dreams, extreme curiosity, and unburdened exploration.",
    rhythm: "Centauri Galactic Core cycle"
  },
  {
    name: "Capricorn",
    symbol: "♑",
    element: "Earth",
    nodes: [
      { name: "Algedi", x: 30, y: 30 },
      { name: "Dabih", x: 38, y: 32 },
      { name: "Nashira", x: 55, y: 55 },
      { name: "Deneb Algedi", x: 72, y: 50 },
      { name: "Alshat", x: 62, y: 68 },
      { name: "Prima Giedi", x: 45, y: 62 }
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0]
    ],
    blurb: "Unmatched perseverance, structured cosmic timeline, and spiritual authority. The nodes outline a soaring mountain peak, grounding your professional and creative destiny.",
    rhythm: "Saturnian Solstice gate"
  },
  {
    name: "Aquarius",
    symbol: "♒",
    element: "Air",
    nodes: [
      { name: "Sadalmelik", x: 30, y: 42 },
      { name: "Sadalsuud", x: 45, y: 35 },
      { name: "Skate", x: 55, y: 48 },
      { name: "Ancha", x: 68, y: 55 },
      { name: "Albali", x: 75, y: 40 }
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 4]
    ],
    blurb: "Cosmic humanitarian, visionary networks, and digital stardust fields. This configuration suggests electric intellectual brilliance and a deep commitment to original designs.",
    rhythm: "The Age of Aquarius transition"
  },
  {
    name: "Pisces",
    symbol: "♓",
    element: "Water",
    nodes: [
      { name: "Alpherg", x: 25, y: 25 },
      { name: "Alrescha", x: 38, y: 35 },
      { name: "Fum al Samakah", x: 50, y: 48 },
      { name: "Omega Piscium", x: 65, y: 58 },
      { name: "Torcular", x: 78, y: 62 },
      { name: "Simmah", x: 50, y: 75 }
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
      [5, 0]
    ],
    blurb: "The dual ethereal fishes flowing through the dream aether. The connective lines bridge logical structures and oceanic sub-conscious imagination in absolute balance.",
    rhythm: "The Neptunian Dream cycle"
  }
];

/**
 * Calculates a 'Convergence Alignment' score between the user's mapped star nodes
 * and a chosen Zodiac constellation reference.
 */
export function calculateZodiacSimilarity(
  userNodes: { x: number; y: number }[],
  zodiacNodes: { x: number; y: number }[]
): { score: number; averageDistance: number } {
  if (userNodes.length === 0 || zodiacNodes.length === 0) {
    return { score: 50, averageDistance: 50 };
  }

  let totalMinDistance = 0;

  // For each Zodiac node, find the closest user node (in coordinate percentage scale)
  zodiacNodes.forEach((zNode) => {
    let minDistance = Infinity;
    userNodes.forEach((uNode) => {
      const dx = zNode.x - uNode.x;
      const dy = zNode.y - uNode.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
      }
    });
    totalMinDistance += minDistance;
  });

  const averageDistance = totalMinDistance / zodiacNodes.length;

  // Let's map average distance to a score from 0 to 100.
  // Standard perfect distance would be 0 (giving 100% score).
  // A distance of 25 is quite far, let's say average distance of 20 yields around 50% alignment.
  let score = Math.max(0, Math.min(100, Math.round(100 - averageDistance * 4.2)));

  // Introduce a slight deterministic variation to make it feel super-calculated down to decimals
  const fineTunedScore = Math.max(33, Math.min(99, score));

  return {
    score: fineTunedScore,
    averageDistance: parseFloat(averageDistance.toFixed(2))
  };
}
