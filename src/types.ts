export interface StarNode {
  id: string;
  x: number; // percentage width 0-100
  y: number; // percentage height 0-100
  name: string;
  type: "major" | "minor" | string;
  significance: string;
}

export interface SignificanceDetail {
  personality: string;
  destiny: string;
  cosmicRhythm: string;
}

export interface ConstellationMap {
  id: string;
  constellationName: string;
  constellationType: string;
  element: "Aether" | "Nebula" | "Stardust" | "Supernova" | "Dark Energy" | string;
  celestialReading: string;
  significanceDetail: SignificanceDetail;
  starNodes: StarNode[];
  connections: string[][]; // pair of node IDs
  image: string; // Base64 representation of original user's captured face or default nebula backdrop
  date: string;
  isFallback?: boolean;
  notes?: string;
  userName?: string;
  starStyle?: "neon" | "golden" | "classic" | "emerald" | "supernova" | "cosmic";
}
