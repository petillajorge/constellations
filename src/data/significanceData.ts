export interface InterpretationItem {
  id: string;
  name: string;
  subtitle: string;
  symbol: string; // e.g. SVG paths or visual markers
  description: string;
  vibrationalLevel: string;
  spiritualResonance: string;
}

export interface RegionInterpretation {
  id: string;
  name: string;
  astralDomain: string;
  rulerStar: string;
  description: string;
  association: string;
  coordinates: string;
}

export const GEOMETRIC_PATTERNS: InterpretationItem[] = [
  {
    id: "trine",
    name: "The Celestial Trine",
    subtitle: "Triangular Harmony & Flow",
    symbol: "trine",
    description: "A three-star triangular vertex layout across your skin. Trines represent perfect elemental flow, emotional stabilization, and intuitive synthesis. Your mental, emotional, and physical high points are perfectly balanced, channeling stellar energy with minimal friction.",
    vibrationalLevel: "9.2 Hz - Harmonics",
    spiritualResonance: "Intuitive Intellect & Creativity"
  },
  {
    id: "stellar-line",
    name: "The Meridian Star Line",
    subtitle: "Linear Alignment & Focus",
    symbol: "line",
    description: "A sequence of three or more stars aligned in a continuous vector. This indicates an alignment with direct action, deep laser focus, and iron willpower. Individuals with strong star lines rarely stray from their pre-ordained destiny, acting as direct portals for cosmic wisdom.",
    vibrationalLevel: "8.5 Hz - Direct Wave",
    spiritualResonance: "Indomitable Resolve & Purpose"
  },
  {
    id: "nebulous-cluster",
    name: "The Cosmic Nebula Cluster",
    subtitle: "Dense Luminous Intensity",
    symbol: "cluster",
    description: "A highly dense grouping of coordinates within a single landscape domain (e.g. cheek or chin). This projects rich creative mystery and an overflowing pool of thoughts. You possess rare empathetic depth, absorbing external frequencies and transforming them into beautiful spiritual expressions.",
    vibrationalLevel: "11.1 Hz - Cosmic Mist",
    spiritualResonance: "Empathy, Depth & Subconscious Arts"
  },
  {
    id: "aegis-cross",
    name: "The Aegis Anchor Cross",
    subtitle: "Cross and Quad Formations",
    symbol: "cross",
    description: "Four or more nodes forming an anchor, square, or diamond formation. This acts as a robust protective shield ('The Aegis') over your aura. In celestial cartography, this layout brings heavy spiritual protection, deep loyalty, and exceptional spatial navigation skills.",
    vibrationalLevel: "7.8 Hz - Shumann Resonance",
    spiritualResonance: "Aura Shield, Grounding & Integrity"
  },
  {
    id: "scattered-nebula",
    name: "The Scattered Star Array",
    subtitle: "Symmetric Galaxy Array",
    symbol: "scatter",
    description: "Sparsely distributed nodes across all landmarks. This projects absolute versatility and stellar adaptiveness. Rather than focusing energy on a single life domain, your spirit resonates with the infinite cosmos, allowing a natural, smooth transition through any planetary season.",
    vibrationalLevel: "12.4 Hz - Stellar Draft",
    spiritualResonance: "Wanderlust, Adaptation & Universal Sight"
  }
];

export const EPIDERMAL_REGIONS: RegionInterpretation[] = [
  {
    id: "forehead",
    name: "The Celestial Crown Domain",
    astralDomain: "Forehead / Zenith Crown",
    rulerStar: "Orion's Apex Primus",
    description: "The mental vault of celestial wisdom. Star nodes mapped across the forehead are connected to higher frequency intellect, creative planning, and cosmic willpower. When active, it acts as a mental receiver of trans-dimensional insights.",
    association: "Stellar Logic, Strategy & Intuition",
    coordinates: "Y: 5% - 30%"
  },
  {
    id: "eyes",
    name: "The Oculi Portal Domain",
    astralDomain: "Oculi Ridges & Temples",
    rulerStar: "Nebula Oculi Sinistra",
    description: "The gate of internal cosmic vision and third-eye observation. Stars situated near the eyes and temples project exceptional aura discernment, natural curiosity, and deeply accurate situational awareness.",
    association: "Aura Discernment, Spiritual Vision & Truth",
    coordinates: "Y: 30% - 44%"
  },
  {
    id: "cheeks",
    name: "The Radiant Cheek Fields",
    astralDomain: "Luminosa Fields (Cheeks)",
    rulerStar: "Aura Auriga & Vega",
    description: "The primary landscape fields of cosmic warmth and healing frequencies. High concentration of nodes here projects deep heart-center empathy, charismatic expressiveness, and an organic connection with other souls.",
    association: "Healing Frequencies, Empathy & Charisma",
    coordinates: "Y: 44% - 66%"
  },
  {
    id: "nose",
    name: "The Polarian Bridge Point",
    astralDomain: "Nose Tip & Bridge Line",
    rulerStar: "Nexus Polaris Core",
    description: "The absolute geometric balance line. As the central ridge of the structural face, stars landing directly on the nose line denote a person who serves as an anchor of balance, mediating conflicts and guiding lost travelers.",
    association: "Conflict Mediation, High Balance & Compass",
    coordinates: "X: 45% - 55%"
  },
  {
    id: "chin",
    name: "The Grounded Sirius Anchor",
    astralDomain: "Chin / Basal Foundation",
    rulerStar: "Sirius Ascendant Major",
    description: "The critical foundational coordinate of physical and spirit grounding. Chin stars act as heavy ballast anchors, allowing you to synthesize and actualize complex astral dreams into tangible material achievements on Earth.",
    association: "Persistence, Materialization & Ancestral Grounding",
    coordinates: "Y: 78% - 95%"
  }
];

export const STELLAR_TYPOLOGIES = [
  {
    id: "major",
    name: "Supernova Anchor Nodes (Major Stars)",
    description: "These are prominent freckles or highly defined skin landmarks. They represent primary vibrational pillars in your design, acting as beacon-transmitters of spiritual energy to the outer world.",
    frequency: "Highly Luminous High Energy"
  },
  {
    id: "minor",
    name: "Cosmic Nebula Accents (Minor Stars)",
    description: "Smaller, softer, or faint freckle coordinates. They denote auxiliary traits, hidden emotional desires, subconscious wisdom, and undercurrent intuitive channels that unlock during deep meditation.",
    frequency: "Ambient Resonance Low Energy"
  }
];
