import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Map as MapIcon, 
  Trash2, 
  Download, 
  Share2, 
  Info, 
  Volume2, 
  VolumeX, 
  Compass, 
  User, 
  Calendar, 
  Eye, 
  Grid3X3, 
  ArrowLeft, 
  Heart,
  Globe,
  Plus,
  Camera,
  Moon,
  Copy,
  Check,
  Smartphone,
  ChevronRight,
  Shield,
  Star,
  Edit,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { synth } from "./components/CelestialSynth";
import { FacialCamera } from "./components/FacialCamera";
import { ConstellationMap, StarNode } from "./types";
import { ZODIAC_CONSTELLATIONS, calculateZodiacSimilarity } from "./components/ZodiacOverlayData";
import { CosmicCluster3D } from "./components/CosmicCluster3D";
import { 
  GEOMETRIC_PATTERNS, 
  EPIDERMAL_REGIONS, 
  STELLAR_TYPOLOGIES 
} from "./data/significanceData";

// Firebase User Authentication & Cloud Firestore Integration
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logoutUser, 
  handleFirestoreError, 
  OperationType 
} from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  onSnapshot 
} from "firebase/firestore";


// Star Styling Settings and Color Palettes
export type StarStyleType = "neon" | "golden" | "classic" | "emerald" | "supernova" | "cosmic";

interface StylePalette {
  name: string;
  majorColor: string;
  minorColor: string;
  glowColor: string;
  lineColor: string;
  lineGradient: string;
  spectralColors: string[];
}

export const STAR_STYLES: Record<StarStyleType, StylePalette> = {
  neon: {
    name: "Neon Cosmic",
    majorColor: "#ffffff",
    minorColor: "#22d3ee",
    glowColor: "#06b6d2",
    lineColor: "#a855f7",
    lineGradient: "glowingLineGrad",
    spectralColors: [
      "#38bdf8", // Sky blue
      "#34d399", // Emerald mint
      "#f472b6", // Light pink
      "#fb7185", // Rose
      "#60a5fa", // Royal blue
      "#c084fc", // Orchid purple
      "#22d3ee", // Cyan
    ]
  },
  golden: {
    name: "Golden Alchemy",
    majorColor: "#fff7ed",
    minorColor: "#f59e0b",
    glowColor: "#d97706",
    lineColor: "#ea580c",
    lineGradient: "goldenLineGrad",
    spectralColors: [
      "#facc15", // Warm yellow
      "#fbbf24", // Gold
      "#f97316", // Amber orange
      "#fdba74", // Soft peach
      "#ca8a04", // Dark gold
      "#fef08a", // Pale cream yellow
      "#fb7185", // Golden rose
    ]
  },
  classic: {
    name: "Classic White",
    majorColor: "#ffffff",
    minorColor: "#e2e8f0",
    glowColor: "#94a3b8",
    lineColor: "#cbd5e1",
    lineGradient: "classicLineGrad",
    spectralColors: [
      "#ffffff", // pure white
      "#f8fafc", // slate white
      "#f1f5f9", // cool gray-white
      "#e2e8f0", // silver
      "#cbd5e1", // light slate
      "#94a3b8", // zinc
      "#e0f2fe", // soft snow-blue
    ]
  },
  emerald: {
    name: "Emerald Nebula",
    majorColor: "#f0fdf4",
    minorColor: "#10b981",
    glowColor: "#059669",
    lineColor: "#06b6d2",
    lineGradient: "emeraldLineGrad",
    spectralColors: [
      "#10b981", // Emerald
      "#34d399", // Mint
      "#059669", // Dark emerald
      "#a7f3d0", // Pale jade
      "#84cc16", // Lime
      "#06b6d2", // Cyan
      "#2dd4bf", // Teal
    ]
  },
  supernova: {
    name: "Supernova",
    majorColor: "#fff1f2",
    minorColor: "#f43f5e",
    glowColor: "#be123c",
    lineColor: "#d946ef",
    lineGradient: "supernovaLineGrad",
    spectralColors: [
      "#ef4444", // Red
      "#f43f5e", // Rose
      "#f472b6", // Pink
      "#ec4899", // Magenta
      "#d946ef", // Fuchsia
      "#fb7185", // Light rose
      "#ea580c", // Fiery orange
    ]
  },
  cosmic: {
    name: "Cosmic Indigo",
    majorColor: "#faf5ff",
    minorColor: "#8b5cf6",
    glowColor: "#6d28d9",
    lineColor: "#6366f1",
    lineGradient: "cosmicLineGrad",
    spectralColors: [
      "#8b5cf6", // Violet
      "#a78bfa", // Lavendar
      "#6366f1", // Indigo
      "#d946ef", // Fuchsia
      "#4f46e5", // Deep indigo
      "#c084fc", // Soft purple
      "#818cf8", // Blue indigo
    ]
  }
};

export const getStarNodeColor = (nodeName: string, nodeId: string, isMajor: boolean, style: StarStyleType) => {
  const palette = STAR_STYLES[style];
  if (isMajor) {
    return palette.majorColor;
  }
  
  const str = nodeName + nodeId;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.spectralColors.length;
  return palette.spectralColors[index];
};


// Preloaded beautiful default constellations
const PRELOADED_CONSTELLATIONS: ConstellationMap[] = [
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
    image: "" // Empty will display the procedural celestial background
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
    image: ""
  }
];

export default function App() {
  const [maps, setMaps] = useState<ConstellationMap[]>(() => {
    const saved = localStorage.getItem("freckles_constellations_library");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse saved maps", err);
      }
    }
    return PRELOADED_CONSTELLATIONS;
  });

  // Firebase Authenticated User State & Loaders
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Rename constellation state
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>("");
  const isCancelingRenameRef = useRef<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time updates for user constellations
  useEffect(() => {
    if (!currentUser) {
      // Clean up maps list when logging out - roll back to preloaded and localStorage
      const localMaps = (() => {
        const saved = localStorage.getItem("freckles_constellations_library");
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (err) {
            console.error(err);
          }
        }
        return PRELOADED_CONSTELLATIONS;
      })();
      setMaps(localMaps);
      return;
    }

    const q = query(
      collection(db, "constellations"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbMaps: ConstellationMap[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        dbMaps.push({
          id: docSnap.id,
          constellationName: data.constellationName,
          constellationType: data.constellationType,
          element: data.element,
          celestialReading: data.celestialReading,
          significanceDetail: {
            personality: data.significanceDetail?.personality || "",
            destiny: data.significanceDetail?.destiny || "",
            cosmicRhythm: data.significanceDetail?.cosmicRhythm || ""
          },
          starNodes: data.starNodes || [],
          connections: data.connections || [],
          image: data.image || "",
          date: data.date || "",
          userName: data.userName || ""
        });
      });

      setMaps(prev => {
        // Find default or public preloaded constellations
        const defaults = PRELOADED_CONSTELLATIONS;
        
        // Combine them making sure we don't duplicate ids, preserving both defaults and custom user ones starting with "map-"
        const nonDb = prev.filter(m => !dbMaps.some(dbM => dbM.id === m.id) && (m.id.startsWith("default-") || m.id.startsWith("map-")));
        
        return [...dbMaps, ...nonDb];
      });
    }, (error) => {
      console.error("Firestore synchronizer failure:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleStartRename = (map: ConstellationMap) => {
    isCancelingRenameRef.current = false;
    setEditingMapId(map.id);
    setTempName(map.constellationName);
  };

  const handleSaveRename = async (id: string) => {
    if (isCancelingRenameRef.current) return;
    if (!tempName.trim()) return;
    try {
      const existingMap = maps.find(m => m.id === id);
      if (!existingMap) return;
      const updatedMap = { ...existingMap, constellationName: tempName.trim() };

      // Optimistically update the name in the local state immediately
      setMaps(prev => prev.map(m => m.id === id ? updatedMap : m));
      setEditingMapId(null);
      playSound("bell", 600);

      if (currentUser && !id.startsWith("default-")) {
        await setDoc(doc(db, "constellations", id), {
          ...updatedMap,
          userId: currentUser.uid
        }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `constellations/${id}`);
    }
  };

  const [selectedMapId, setSelectedMapId] = useState<string>("default-veil");
  const [selectedStarId, setSelectedStarId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Tab selector state to toggle between 2D Map and 3D Cluster space
  const [activeTab, setActiveTab ] = useState<"2d" | "3d">("2d");

  // Traditional Zodiac constellations overlay controls
  const [showZodiacOverlay, setShowZodiacOverlay] = useState<boolean>(false);
  const [selectedZodiacIndex, setSelectedZodiacIndex] = useState<number>(0);
  const [zodiacOpacity, setZodiacOpacity] = useState<number>(0.65);

  // Zoom & Pan controls for 2D map
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset zoom on map selections
  useEffect(() => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  }, [selectedMapId]);

  // Sidebar map archive collapse state
  const [isArchiveCollapsed, setIsArchiveCollapsed] = useState<boolean>(false);

  // Custom metadata input form
  const [scanName, setScanName] = useState<string>("");
  const [scanSubject, setScanSubject] = useState<string>("");

  // Analysis / Scan Mode state
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");

  // Cancellation refs for calibration scan
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeIntervalRef = useRef<any>(null);

  const cancelGeneration = () => {
    playSound("bell", 300);
    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current);
      activeIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setAnalysisLoading(false);
    setIsCapturing(false);
    setActiveTab("2d");
  };

  // Interactive Export Settings
  const [posterModalVisible, setPosterModalVisible] = useState<boolean>(false);
  const [posterTheme, setPosterTheme] = useState<string>("midnight");
  const [posterGrid, setPosterGrid] = useState<boolean>(true);
  const [posterAstroText, setPosterAstroText] = useState<boolean>(true);

  // Sharing states
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Quick info panel
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showSignificanceGuide, setShowSignificanceGuide] = useState<boolean>(false);
  const [significanceActiveTab, setSignificanceActiveTab] = useState<"patterns" | "regions" | "typologies">("patterns");
  const [selectedPatternId, setSelectedPatternId] = useState<string>("trine");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("forehead");

  // Sizing states for adjustable columns
  const [leftWidth, setLeftWidth] = useState<number>(256);
  const [rightWidth, setRightWidth] = useState<number>(420);
  const [activeResizer, setActiveResizer] = useState<"left" | "right" | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  const [starStyle, setStarStyle] = useState<StarStyleType>(() => {
    const saved = localStorage.getItem("freckles_star_style");
    return (saved as StarStyleType) || "neon";
  });

  useEffect(() => {
    localStorage.setItem("freckles_star_style", starStyle);
  }, [starStyle]);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    if (!activeResizer) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (activeResizer === "left") {
        const newWidth = Math.max(200, Math.min(450, e.clientX));
        setLeftWidth(newWidth);
      } else if (activeResizer === "right") {
        const newWidth = Math.max(280, Math.min(650, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const clientX = e.touches[0].clientX;
      if (activeResizer === "left") {
        const newWidth = Math.max(200, Math.min(450, clientX));
        setLeftWidth(newWidth);
      } else if (activeResizer === "right") {
        const newWidth = Math.max(280, Math.min(650, window.innerWidth - clientX));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setActiveResizer(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [activeResizer]);

  // Selected map helper
  const selectedMap = maps.find(m => m.id === selectedMapId) || maps[0];

  useEffect(() => {
    localStorage.setItem("freckles_constellations_library", JSON.stringify(maps));
  }, [maps]);

  // Synchronize star style with selected map
  useEffect(() => {
    if (selectedMap && selectedMap.starStyle) {
      setStarStyle(selectedMap.starStyle as StarStyleType);
    }
  }, [selectedMapId, selectedMap]);

  const handleUpdateStarStyle = async (newStyle: StarStyleType) => {
    setStarStyle(newStyle);
    
    // Update the selected map's starStyle in local maps state
    setMaps((prev) =>
      prev.map((m) =>
        m.id === selectedMap.id ? { ...m, starStyle: newStyle } : m
      )
    );

    // If logged in, persist to backend
    if (currentUser && !selectedMap.id.startsWith("default-")) {
      try {
        await setDoc(doc(db, "constellations", selectedMap.id), {
          ...selectedMap,
          starStyle: newStyle,
          userId: currentUser.uid
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `constellations/${selectedMap.id}`);
      }
    }
  };

  // Load public constellations from backend on mount and sync to state
  useEffect(() => {
    const fetchCloudMaps = async () => {
      try {
        const response = await fetch("/api/constellations");
        const cloudData = await response.json();
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          setMaps(prev => {
            // Merge maps by maintaining local modifications but absorbing new elements
            const updated = [...prev];
            cloudData.forEach((cMap: ConstellationMap) => {
              const matchedIdx = updated.findIndex((m) => m.id === cMap.id);
              if (matchedIdx !== -1) {
                // Keep local image if present
                updated[matchedIdx] = {
                  ...cMap,
                  image: updated[matchedIdx].image || cMap.image
                };
              } else {
                updated.push(cMap);
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn("Could not sync shared constellations from backend server:", err);
      }
    };
    fetchCloudMaps();
  }, []);

  // Audio prompt helper
  const playSound = (type: "bell" | "pulse" | "sweep", pitch = 880) => {
    if (!soundEnabled) return;
    if (type === "bell") synth.playStarBell(pitch);
    if (type === "pulse") synth.playCosmicPulse();
    if (type === "sweep") synth.playScanningSweep();
  };

  const handlePhotoCaptured = async (base64Image: string) => {
    setIsCapturing(false);
    setAnalysisLoading(true);
    playSound("sweep");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const steps = [
      "Calibrating orbital spatial cameras...",
      "Isolating epidermal coordinates...",
      "Resolving localized stellar intensity...",
      "Consulting the celestial alignments...",
      "Mapping sacred geometric vector nodes...",
      "Synthesizing spiritual astrometric forecast..."
    ];

    let currentStep = 0;
    setLoadingStep(steps[0]);

    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current);
    }
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setLoadingStep(steps[currentStep]);
      }
    }, 2000);
    activeIntervalRef.current = stepInterval;

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
        signal: controller.signal
      });

      const data = await response.json();
      clearInterval(stepInterval);
      activeIntervalRef.current = null;

      if (data && data.starNodes) {
        const finalName = scanName.trim() || data.constellationName || "Aurelia Phoenix";
        const finalSubject = scanSubject.trim() || "Aura Mirror";

        const newMap: ConstellationMap = {
          id: `map-${Date.now()}`,
          constellationName: finalName,
          constellationType: data.constellationType || "Sacred Planetary Alignment",
          element: data.element || "Aether",
          userName: finalSubject,
          date: new Date().toISOString().split('T')[0],
          celestialReading: data.celestialReading || "An extraordinary layout has been discovered.",
          significanceDetail: data.significanceDetail || {
            personality: "You carry highly magnetic coordinates that represent creative energy and visionary power.",
            destiny: "Your nodes point towards immense spiritual growth in the current season.",
            cosmicRhythm: "The Great Solstice Transit"
          },
          starNodes: data.starNodes,
          connections: data.connections || [],
          image: base64Image
        };

        // Optimistically add the new constellation to local state so it renders instantly
        setMaps(prev => {
          if (prev.some(m => m.id === newMap.id)) return prev;
          return [newMap, ...prev];
        });
        
        setSelectedMapId(newMap.id);

        // If logged in, persist to Firestore in the background
        if (currentUser) {
          setDoc(doc(db, "constellations", newMap.id), {
            id: newMap.id,
            constellationName: newMap.constellationName,
            constellationType: newMap.constellationType,
            element: newMap.element,
            celestialReading: newMap.celestialReading,
            significanceDetail: {
              personality: newMap.significanceDetail.personality || "",
              destiny: newMap.significanceDetail.destiny || "",
              cosmicRhythm: newMap.significanceDetail.cosmicRhythm || ""
            },
            starNodes: newMap.starNodes,
            connections: newMap.connections,
            image: newMap.image,
            date: newMap.date,
            userName: newMap.userName || "",
            userId: currentUser.uid
          }).catch((error) => {
            handleFirestoreError(error, OperationType.CREATE, `constellations/${newMap.id}`);
          });
        }
        setSelectedStarId(null);
        playSound("pulse");

        // Sync the newly created map to the server pool in-memory
        try {
          await fetch("/api/constellations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMap)
          });
        } catch (syncErr) {
          console.warn("Shared server pool synchronization failed:", syncErr);
        }
      } else {
        alert("Could not extract facial coordinates. Please check your photo and try again.");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Calibration request aborted by explorer.");
        return;
      }
      console.error(err);
      alert("Error contacting the celestial server. Please try again.");
    } finally {
      if (activeIntervalRef.current === stepInterval) {
        clearInterval(stepInterval);
        activeIntervalRef.current = null;
      }
      setAnalysisLoading(false);
      setScanName("");
      setScanSubject("");
    }
  };

  const deleteMap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith("default-")) {
      alert("Preloaded constellations cannot be deleted.");
      return;
    }
    if (confirm("Are you sure you want to delete this cosmic map?")) {
      playSound("bell", 330);
      
      // Optimistically remove from local state immediately
      const remaining = maps.filter(m => m.id !== id);
      setMaps(remaining);
      
      if (selectedMapId === id && remaining.length > 0) {
        const nextSelected = remaining.find(m => m.id.startsWith("default-")) || remaining[0];
        setSelectedMapId(nextSelected.id);
      }

      if (currentUser) {
        try {
          await deleteDoc(doc(db, "constellations", id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `constellations/${id}`);
        }
      }
    }
  };

  // High Resolution Poster Drawer
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleExportPoster = () => {
    if (!currentUser) {
      playSound("bell", 300);
      alert("Poster export is a connection-restricted privilege. Please connect your Google account in the top right to download!");
      return;
    }
    playSound("bell", 550);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Poster Dimensions
    const width = 1200;
    const height = 1800;
    canvas.width = width;
    canvas.height = height;

    // 1. BG Color Theme Selection
    let bgGradient = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, width);
    let borderLineColor = "#222230";
    let accentColor = "#22d3ee"; // cyan
    let secondaryColor = "#c084fc"; // purple

    if (posterTheme === "midnight") {
      bgGradient.addColorStop(0, "#0e111d");
      bgGradient.addColorStop(1, "#030408");
      accentColor = "#22d3ee";
      secondaryColor = "#818cf8";
    } else if (posterTheme === "dawn") {
      bgGradient.addColorStop(0, "#1c140d");
      bgGradient.addColorStop(1, "#080503");
      accentColor = "#fbbf24"; // amber
      secondaryColor = "#f472b6"; // rose
      borderLineColor = "#3c2a1e";
    } else if (posterTheme === "supernova") {
      bgGradient.addColorStop(0, "#190e22");
      bgGradient.addColorStop(1, "#050308");
      accentColor = "#f43f5e"; // rose-red
      secondaryColor = "#d946ef"; // fuchsia
      borderLineColor = "#3d1e4a";
    } else { // charcoal / deep space
      bgGradient.addColorStop(0, "#0b0c10");
      bgGradient.addColorStop(1, "#020203");
      accentColor = "#10b981"; // emerald
      secondaryColor = "#6366f1"; // indigo
    }

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Cosmic coordinate spacing grid background
    if (posterGrid) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      
      // Horizontal coordinate grid lines
      for (let y = 100; y < height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.font = "10px monospace";
        ctx.fillText(`DEC: ${Math.floor(90 - (y/height)*180)}°`, 15, y - 5);
      }

      // Vertical lines
      for (let x = 100; x < width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.font = "10px monospace";
        ctx.fillText(`RA: ${(x/width * 24).toFixed(1)}h`, x + 5, 20);
      }
    }

    // 3. Elegant concentric circular scopes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 100, 320, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = accentColor + "20";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 100, 380, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 100, 200, 0, Math.PI * 2);
    ctx.stroke();

    // Compass lines crossing center of circle
    ctx.setLineDash([5, 10]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.beginPath();
    ctx.moveTo(width / 2 - 420, height / 2 - 100);
    ctx.lineTo(width / 2 + 420, height / 2 - 100);
    ctx.moveTo(width / 2, height / 2 - 520);
    ctx.lineTo(width / 2, height / 2 + 320);
    ctx.stroke();
    ctx.setLineDash([]); // clear dash

    // Compass cardinal markers
    ctx.fillStyle = accentColor;
    ctx.font = "normal 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", width / 2, height / 2 - 530);
    ctx.fillText("S", width / 2, height / 2 + 340);
    ctx.fillText("W", width / 2 - 440, height / 2 - 95);
    ctx.fillText("E", width / 2 + 440, height / 2 - 95);

    // 4. Face image blended under stars if presents
    // Note: To draw base64 image onto canvas cleanly, we instantiate an image element helper
    const drawConstellationDetails = () => {
      // 5. Draw connections between stars
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 10;
      
      const styleMeta = STAR_STYLES[starStyle];
      ctx.shadowColor = styleMeta.glowColor;

      selectedMap.connections.forEach(([idA, idB]) => {
        const starA = selectedMap.starNodes.find(n => n.id === idA);
        const starB = selectedMap.starNodes.find(n => n.id === idB);

        if (starA && starB) {
          // Map original percentage coords to centered circle box dimensions (width 800, height 800 centered)
          // X: scale from 5-95 to 200-1000
          // Y: scale from 5-95 to height/2 - 500 to height/2 + 300
          const x1 = 200 + (starA.x / 100) * 800;
          const y1 = (height / 2 - 500) + (starA.y / 100) * 800;
          const x2 = 200 + (starB.x / 100) * 800;
          const y2 = (height / 2 - 500) + (starB.y / 100) * 800;

          // Glowing connection line
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Core aesthetic neon line
          ctx.strokeStyle = styleMeta.lineColor + "BF";
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      });
      ctx.shadowBlur = 0; // Reset shadow

      // 6. Draw Star Nodes
      selectedMap.starNodes.forEach((node) => {
        const x = 200 + (node.x / 100) * 800;
        const y = (height / 2 - 500) + (node.y / 100) * 800;
        const isMajor = node.type === "major";
        const starColor = getStarNodeColor(node.name, node.id, isMajor, starStyle);

        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(x, y, isMajor ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Neon Glow around stars
        ctx.strokeStyle = isMajor ? styleMeta.majorColor : styleMeta.glowColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, isMajor ? 12 : 9, 0, Math.PI * 2);
        ctx.stroke();

        // Tiny star coordinate label
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.font = "9px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`${node.x.toFixed(0)}X,${node.y.toFixed(0)}Y`, x + 12, y + 3);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "italic bold 10px sans-serif";
        ctx.fillText(node.name, x + 12, y - 6);
      });

      // 7. Outer Print Frame / Aesthetic border
      ctx.strokeStyle = borderLineColor;
      ctx.lineWidth = 24;
      ctx.strokeRect(12, 12, width - 24, height - 24);

      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // 8. Astro Readings & Text on Footer of poster
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold tracking-widest 32px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(selectedMap.constellationName.toUpperCase(), width / 2, height - 340);

      ctx.fillStyle = accentColor;
      ctx.font = "normal tracking-wider 14px monospace";
      ctx.fillText(`CORTEX LANDMARK GRAPH SYSTEM // ELEMENT: ${selectedMap.element.toUpperCase()}`, width / 2, height - 300);

      // Meta Stats line
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "12px monospace";
      ctx.fillText(
        `SUBJECT ID: ${selectedMap.userName?.toUpperCase() || "UNKNOWN"}  |  STELLAR MAP COORDINATE: ${selectedMap.id.slice(0, 10).toUpperCase()}  |  DATE RESOLVED: ${selectedMap.date}`, 
        width / 2, 
        height - 268
      );

      // Detailed celestial reading paragraph on the poster
      if (posterAstroText) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.font = "normal 14px/24px Georgia, serif";
        ctx.textAlign = "center";

        // Wrap paragraphs manually
        const text = selectedMap.celestialReading;
        const words = text.split(" ");
        let line = "";
        let lineY = height - 210;
        const maxLineWidth = 850;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxLineWidth && i > 0) {
            ctx.fillText(line, width / 2, lineY);
            line = words[i] + " ";
            lineY += 28;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, width / 2, lineY);
      }

      // 9. Tiny bottom credits
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("FRECKLES CONSTELLATION ASTROMETRY LABS. ALL MAPS RETRIEVED FROM BIOMETRIC SKIN INTERPOLATION.", width / 2, height - 60);

      // Trigger actual JPEG/PNG download URL
      const dataUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = `Poster_${selectedMap.constellationName.replace(/\s+/g, "_")}.png`;
      downloadLink.click();
    };

    if (selectedMap.image) {
      const img = new Image();
      img.onload = () => {
        // Draw centered dim circular mask of user portrait
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 100, 320, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.28; // dim look blending into the dark
        ctx.drawImage(img, width/2 - 320, height/2 - 420, 640, 640);
        ctx.restore();
        drawConstellationDetails();
      };
      img.src = selectedMap.image;
    } else {
      // Draw procedural starry gas background
      ctx.fillStyle = accentColor;
      for (let i = 0; i < 80; i++) {
        const sx = width / 2 + (Math.random() - 0.5) * 550;
        const sy = (height / 2 - 100) + (Math.random() - 0.5) * 550;
        const size = Math.random() * 2 + 0.5;
        ctx.fillStyle = "rgba(255,255,255," + Math.random() * 0.4 + ")";
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      drawConstellationDetails();
    }
  };

  const copyShareLink = () => {
    playSound("bell", 660);
    const mockLink = `https://freckles-constellations.astro/share/${selectedMap.id}`;
    navigator.clipboard.writeText(mockLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-[#050508] text-[#E0E0E6] flex flex-col font-sans select-none overflow-x-hidden antialiased">
      
      {/* GLOW ATMOSPHERE - TOP & CORNER LIGHTS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-950/15 rounded-full blur-[130px] pointer-events-none" />

      {/* FIXED HEADER WITH DESIGN SPEC TITLES */}
      <header className="h-16 shrink-0 border-b border-[#222230]/70 bg-[#0a0a14]/90 backdrop-blur-md flex items-center justify-between px-6 z-40 relative">
        <div className="flex items-center gap-3">
          {/* Logo matching spec design */}
          <div className="w-8 h-8 rounded-full border border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.45)]">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-light tracking-[0.4em] text-white uppercase font-sans">
              Freckles Constellations
            </h1>
            <p className="text-[9px] font-mono tracking-widest text-[#666680] uppercase -mt-0.5">
              Epidermal Astrometry Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            id="significance-guide-toggle-btn"
            onClick={() => { playSound("bell", 750); setShowSignificanceGuide(!showSignificanceGuide); }}
            className="flex text-xs items-center gap-1.5 font-mono px-3 py-1.5 rounded-lg border border-cyan-500/35 text-cyan-400 bg-cyan-950/25 hover:text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-950/45 transition cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)] animate-pulse"
          >
            <Sparkles size={13} className="text-cyan-400" />
            <span>Significance Guide</span>
          </button>

          <button
            id="guide-toggle-btn"
            onClick={() => { playSound("bell", 720); setShowGuide(!showGuide); }}
            className="hidden sm:flex text-xs items-center gap-1.5 font-mono px-3 py-1.5 rounded-lg border border-[#222230] text-[#9999AA] hover:text-cyan-400 hover:border-cyan-500/40 transition cursor-pointer"
          >
            <Info size={13} />
            <span>Guide</span>
          </button>

          <button
            id="synth-sound-toggle"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-[#9999AA] hover:text-white border border-[#222230] rounded-xl transition cursor-pointer"
            title={soundEnabled ? "Mute Celestial Audio Feedback" : "Enable Celestial Audio Feedback"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right font-mono">
                <span className="text-[10px] font-bold text-violet-300 tracking-wider truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split("@")[0]}
                </span>
                <span className="text-[8px] text-[#666680] uppercase tracking-widest">
                  Astrometrist
                </span>
              </div>
              <button
                id="auth-logout-btn"
                onClick={async () => {
                  playSound("bell", 400);
                  await logoutUser();
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 hover:border-rose-500/60 flex items-center justify-center text-xs font-bold text-white shadow-md transition duration-300 cursor-pointer shrink-0 uppercase"
                title={`${currentUser.displayName || currentUser.email} - Click to Logout`}
              >
                {currentUser.displayName ? currentUser.displayName.charAt(0) : (currentUser.email ? currentUser.email.charAt(0) : "U")}
              </button>
            </div>
          ) : (
            <button
              id="auth-login-btn"
              onClick={async () => {
                playSound("bell", 600);
                try {
                  await loginWithGoogle();
                } catch (err) {
                  console.error("Login error:", err);
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-pointer shadow-lg shrink-0"
            >
              <Shield size={12} className="text-black inline animate-pulse" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </header>

      {/* CORE FRAMEWORK GRID WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden overflow-y-auto relative">
        
        {/* ASIDE 1: MAP ARCHIVE LIBRARY BAR */}
        <aside
          style={{
            width: isDesktop ? `${leftWidth}px` : undefined,
            minWidth: isDesktop ? `${leftWidth}px` : undefined,
            maxWidth: isDesktop ? `${leftWidth}px` : undefined,
          }}
          className="w-full shrink-0 border-b lg:border-b-0 border-[#222230] bg-[#07070c]/90 flex flex-col p-5 max-h-[320px] lg:max-h-none overflow-y-auto flex-none"
        >
          
          {/* HIGHLY IDENTIFIABLE CALL-TO-ACTION AT THE VERY TOP */}
          <div className="mb-6 pb-2 shrink-0 border-b border-[#222230]/30">
            <button
              id="new-scan-trigger-btn"
              onClick={() => {
                playSound("bell", 640);
                setActiveTab("2d");
                setIsCapturing(true);
                setTimeout(() => {
                  const stageEl = document.getElementById("middle-cosmic-stage");
                  if (stageEl) {
                    stageEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.scrollTo({
                      top: stageEl.offsetTop - 70,
                      behavior: "smooth"
                    });
                  }
                }, 100);
              }}
              className="group relative w-full py-3.5 px-4 bg-slate-950/40 hover:bg-slate-950/20 active:scale-[0.98] text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 font-mono overflow-hidden border border-white/10 hover:border-white/20 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
            >
              {/* Shifting liquid crystal color plane underneath the glass */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff] via-[#ff00ef] via-[#8b5cf6] to-[#00ffff] opacity-25 group-hover:opacity-40 blur-[4px] mix-blend-screen transition-all duration-500 animate-liquid-prism pointer-events-none" />

              {/* Infinite diagonal liquid crystal glare sweeps */}
              <div className="absolute inset-0 w-full h-full animate-glass-shine bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" style={{ backgroundSize: "200% 100%" }} />

              {/* Inner bezel glass glow */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none" />

              {/* Elements on top */}
              <Plus size={15} className="text-cyan-200 animate-pulse relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="relative z-10 text-slate-100 font-extrabold tracking-widest drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">New Constellation</span>
            </button>
          </div>

          <div 
            className="flex items-center justify-between mb-4 cursor-pointer select-none group"
            onClick={() => {
              playSound("bell", 400);
              setIsArchiveCollapsed(!isArchiveCollapsed);
            }}
          >
            <div className="text-[10px] uppercase tracking-widest text-[#666680] font-mono flex items-center gap-1.5 group-hover:text-cyan-400 transition-colors">
              <ChevronRight size={12} className={`text-cyan-500/80 transition-transform duration-200 ${isArchiveCollapsed ? "" : "rotate-90"}`} />
              <span>Saved Constellations</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-slate-900 border border-[#222230] text-cyan-300">
              {maps.length} Saved
            </span>
          </div>

          {!isArchiveCollapsed && (
            <div className="space-y-1.5 flex-grow overflow-y-auto pr-1">
              {maps.map((m) => {
                const isSelected = m.id === selectedMapId;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSound("bell", 580);
                      setSelectedMapId(m.id);
                      setSelectedStarId(null);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(m);
                    }}
                    id={`map-card-${m.id}`}
                    className={`group relative cursor-pointer py-2 px-3 border rounded-lg transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.08)] text-white"
                        : "border-[#1e1e2f] bg-slate-950/30 hover:border-slate-800 hover:bg-[#0c0c16] text-[#9999AA]"
                    }`}
                  >
                    <div className="flex-grow min-w-0 pr-1">
                      <div className="flex items-center gap-2">
                        {editingMapId === m.id ? (
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={() => handleSaveRename(m.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(m.id);
                              if (e.key === "Escape") {
                                isCancelingRenameRef.current = true;
                                setEditingMapId(null);
                              }
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-white px-1.5 py-0.5 bg-slate-900 border border-cyan-500/80 rounded focus:outline-none w-full font-sans"
                          />
                        ) : (
                          <h3 
                            className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5 group/title"
                          >
                            <span className="truncate">{m.constellationName}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartRename(m);
                              }}
                              className="p-0.5 opacity-60 hover:opacity-100 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition shrink-0 cursor-pointer"
                              title="Rename"
                            >
                              <Edit size={10} />
                            </button>
                          </h3>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 mt-0.5 truncate">
                        <span className="text-violet-400 shrink-0">{m.element}</span>
                        <span className="text-slate-800">•</span>
                        <span className="text-cyan-400 font-medium shrink-0 flex items-center gap-0.5"><Star size={8} /> {m.starNodes.length}</span>
                        <span className="text-slate-800">•</span>
                        <span className="truncate max-w-[80px]" title={m.userName || "Untitled Aura"}>{m.userName || "Untitled Aura"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1 text-right">
                      <span className="text-[9px] font-mono text-slate-600 transition-colors group-hover:text-slate-500">{m.date}</span>
                      
                      {!m.id.startsWith("default-") && (
                        <button
                          id={`delete-map-btn-${m.id}`}
                          onClick={(e) => deleteMap(m.id, e)}
                          className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition opacity-50 group-hover:opacity-100 cursor-pointer -mr-1"
                          title="Delete Constellation"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {isDesktop && (
          <div
            className={`w-1 shrink-0 cursor-col-resize hover:bg-cyan-500/80 transition-all duration-150 z-50 flex items-center justify-center relative select-none border-r border-[#222230]/40 ${
              activeResizer === "left" ? "bg-cyan-500 border-cyan-400" : "bg-[#0b0b14]"
            }`}
            onMouseDown={() => setActiveResizer("left")}
          >
            {/* Splitter small line indicator */}
            <div className={`w-[1px] h-12 rounded ${activeResizer === "left" ? "bg-white animate-pulse" : "bg-slate-700/60"}`} />
          </div>
        )}

        {/* MIDDLE SECTION: INTERACTIVE EXPERIENTIAL COSMIC STAGE */}
        <section id="middle-cosmic-stage" className="flex-grow lg:flex-1 h-full min-h-[500px] relative bg-[radial-gradient(circle_at_50%_50%,_#111122_0%,_#050508_100%)] flex flex-col p-3 sm:p-4 md:p-6 items-center justify-start overflow-hidden">
          
          {/* Cosmic Grid Background Sheet */}
          <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 0.8px, transparent 0.8px)", backgroundSize: "44px 44px" }} />

          {/* Glowing planetary orbital circles aligned to center screen */}
          <div className="absolute w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] border border-cyan-500/5 rounded-full animate-spin-slow-reverse pointer-events-none" />
          <div className="absolute w-[350px] h-[350px] sm:w-[420px] sm:h-[420px] border border-violet-500/10 rounded-full animate-spin-slow pointer-events-none" />
          <div className="absolute w-[200px] h-[200px] border border-white/5 rounded-full pointer-events-none" />

          {/* STAGE HEADER METADATA DISPLAY */}
          <div className="absolute top-4 left-6 right-6 hidden md:flex justify-end items-center pointer-events-none z-10 font-mono text-[9px] text-[#666680] uppercase tracking-widest">
            <div className="bg-slate-950/70 border border-[#222230]/50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span>ACTIVE OBJECT: {selectedMap.constellationName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
            </div>
          </div>

          {/* EXPERIENTIAL TAB BAR FOR 2D CELESTIAL PORTAL VS 3D COSMIC CLUSTER (FIXED CENTER HEAD) */}
          <div className="w-full flex justify-center mb-4 z-20 shrink-0">
            <div className="flex gap-1.5 bg-[#030307]/90 p-1.5 rounded-2xl border border-[#222230]/75 shadow-[0_4px_30px_rgba(0,0,0,0.5)] max-w-xs w-full">
              <button
                id="portal-view-toggle-2d"
                onClick={() => { playSound("bell", 400); setActiveTab("2d"); }}
                className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "2d" 
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Compass size={12} />
                <span>2D Portal</span>
              </button>
              <button
                id="cluster-view-toggle-3d"
                onClick={() => { playSound("bell", 450); setActiveTab("3d"); }}
                className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "3d" 
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Globe size={12} />
                <span>3D Space</span>
              </button>
            </div>
          </div>

          {activeTab === "3d" ? (
            /* 3D COSMIC CLUSTER INTERACTIVE CANVAS WINDOW (DYNAMIC EXPANSION FILLING ALL SEC SPACE) */
            <div className="w-full max-w-5xl flex-1 min-h-[380px] sm:min-h-[540px] lg:min-h-[660px] flex flex-col">
              <CosmicCluster3D
                activeMapId={selectedMapId}
                allMaps={maps}
                onSelectMap={(id) => {
                  setSelectedMapId(id);
                  setSelectedStarId(null);
                }}
                soundEnabled={soundEnabled}
              />
            </div>
          ) : (
            /* MAIN INTERACTIVE PHOTO VIEWPORT AND COORDINATE NODE MAP (DYNAMIC EXPANSION FILLING ALL SEC SPACE) */
            <div className="relative w-full max-w-5xl flex-grow h-[65vh] lg:h-[72vh] min-h-[380px] sm:min-h-[540px] lg:min-h-[660px] border border-[#222230] rounded-3xl bg-[#030305]/60 backdrop-blur-sm shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in font-sans">
              <AnimatePresence mode="wait">
                {analysisLoading ? (
                  /* LOADING SCANNING VIEWPORT */
                  <motion.div
                    key="calibration-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950/90 z-20"
                  >
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className="absolute inset-0 border border-dashed border-cyan-500/40 rounded-full animate-spin-slow" />
                      <div className="absolute inset-4 border border-violet-500/30 rounded-full animate-spin-slow-reverse" />
                      <div className="absolute inset-8 border border-white/10 rounded-full flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-cyan-400 animate-bounce" />
                      </div>
                    </div>

                    <span className="mt-8 text-xs font-mono tracking-widest uppercase text-cyan-400 animate-pulse">
                      Astrosensing Portrayal Matrix
                    </span>
                    
                    <h3 className="text-sm font-sans text-white font-medium text-center mt-3 max-w-xs leading-relaxed">
                      {loadingStep}
                    </h3>

                    <div className="w-48 bg-slate-900 h-1 rounded-full overflow-hidden mt-6 border border-slate-800">
                      <motion.div 
                        key="progress-indicator-bar"
                        initial={{ width: "5%" }}
                        animate={{ width: "95%" }}
                        transition={{ duration: 11, ease: "easeInOut" }}
                        className="bg-cyan-500 h-full shadow-[0_0_10px_#22d3ee]"
                      />
                    </div>

                    <button
                      id="cancel-generation-btn"
                      onClick={cancelGeneration}
                      className="mt-8 text-xs font-mono font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 border border-rose-950 hover:border-rose-800 bg-[#160a0f] hover:bg-[#200e16] px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                    >
                      <ArrowLeft size={11} className="text-rose-400" />
                      <span>Cancel Calibration</span>
                    </button>
                  </motion.div>
                ) : isCapturing ? (
                  /* CAMERA ACTIVATE PORTAL overlay inline - scrolling enabled and elegant layout */
                  <motion.div
                    key="camera-view-stage"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="absolute inset-0 bg-[#07070c] p-3 sm:p-5 lg:overflow-hidden overflow-y-auto z-20 scrollbar-thin scrollbar-thumb-slate-800 flex flex-col justify-start items-center gap-4 sm:gap-6"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-[#222230]/75 w-full max-w-xl shrink-0">
                      <div className="flex items-center gap-2">
                        <Camera size={14} className="text-cyan-400" />
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Portrait Calibration</span>
                      </div>
                      <button 
                        id="close-camera-overlay-btn"
                        onClick={() => setIsCapturing(false)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-[#10101c] border border-[#222230] text-[#9999AA] hover:text-white hover:border-slate-600 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft size={12} />
                        <span>Cancel Calibration</span>
                      </button>
                    </div>

                    {/* Personalization metadata input zone */}
                    <div className="w-full max-w-xl text-left bg-[#0c0c16]/80 p-4 border border-[#222230]/70 rounded-2xl flex flex-col sm:flex-row gap-4 shrink-0">
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase tracking-widest font-mono text-cyan-400 mb-1.5 flex items-center gap-1.5">
                          <span>Constellation Name</span>
                          {!currentUser && <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded scale-90">Read-Only</span>}
                        </label>
                        <input
                          type="text"
                          value={scanName}
                          onChange={(e) => setScanName(e.target.value)}
                          placeholder="e.g. Aurelia Phoenix"
                          className="w-full px-3 py-1.5 text-xs bg-[#030307]/90 border border-[#222230] rounded-lg text-white focus:outline-none focus:border-cyan-500/85 transition font-sans"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase tracking-widest font-mono text-violet-400 mb-1.5">
                          Subject Reference / Participant Name
                        </label>
                        <input
                          type="text"
                          value={scanSubject}
                          onChange={(e) => setScanSubject(e.target.value)}
                          placeholder="e.g. Cassandra Vance"
                          className="w-full px-3 py-1.5 text-xs bg-[#030307]/90 border border-[#222230] rounded-lg text-white focus:outline-none focus:border-violet-500/85 transition font-sans"
                        />
                      </div>
                    </div>
                    
                    {/* Live camera module inside custom wrapping */}
                    <div className="w-full flex-grow flex items-center justify-center py-2">
                      <FacialCamera onPhotoSelected={handlePhotoCaptured} />
                    </div>
                  </motion.div>
                ) : (
                  /* THE CONSTELLATION MAP EXPOSITION STAGE */
                  <motion.div
                    key={`astronomy-map-scene-${selectedMap.id}`}
                    initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => {
                      if (selectedStarId) {
                        playSound("bell", 350);
                        setSelectedStarId(null);
                      }
                    }}
                    className="absolute inset-0 w-full h-full select-none"
                  >
                  {/* User original portrait backdrop underlay */}
                  {selectedMap.image ? (
                    <img 
                      src={selectedMap.image} 
                      alt="Cosmic Face Mapping Backdrop"
                      className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen transition-opacity duration-700 select-none pointer-events-none"
                    />
                  ) : (
                    /* Elegant nebulous placeholder when default selected */
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f26]/40 via-[#07070b]/90 to-[#020204]/90 flex items-center justify-center select-none pointer-events-none">
                      <div className="absolute w-64 h-64 bg-indigo-600/5 rounded-full blur-[90px] animate-pulse" />
                      <div className="absolute w-44 h-44 bg-cyan-600/5 rounded-full blur-[80px]" />
                    </div>
                  )}

                  {/* Sweep scanline animation overlaying active face */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-sweep pointer-events-none" />

                  {/* SVG CONNECTIVE PATH LINES RENDERER */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <linearGradient id="glowingLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="goldenLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#ea580c" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="classicLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                      </linearGradient>
                      <linearGradient id="emeraldLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#06b6d2" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="supernovaLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#d946ef" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="cosmicLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    {/* Render elegant vector coordinates paths */}
                    {selectedMap.connections.map(([idA, idB], index) => {
                      const nodeA = selectedMap.starNodes.find(n => n.id === idA);
                      const nodeB = selectedMap.starNodes.find(n => n.id === idB);

                      if (nodeA && nodeB) {
                        return (
                          <motion.line
                            key={`path-${idA}-${idB}-${index}`}
                            x1={`${nodeA.x}%`}
                            y1={`${nodeA.y}%`}
                            x2={`${nodeB.x}%`}
                            y2={`${nodeB.y}%`}
                            stroke={`url(#${STAR_STYLES[starStyle].lineGradient})`}
                            strokeWidth="1.2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.8 }}
                            transition={{ duration: 1.8, delay: index * 0.05, ease: "easeOut" }}
                          />
                        );
                      }
                      return null;
                    })}

                    {/* TRADITIONAL ZODIAC CONSTELLATION OVERLAY LINES */}
                    {showZodiacOverlay && ZODIAC_CONSTELLATIONS[selectedZodiacIndex].connections.map(([idxA, idxB], idx) => {
                      const starA = ZODIAC_CONSTELLATIONS[selectedZodiacIndex].nodes[idxA];
                      const starB = ZODIAC_CONSTELLATIONS[selectedZodiacIndex].nodes[idxB];
                      if (starA && starB) {
                        return (
                          <motion.line
                            key={`zodiac-overlay-line-${idx}`}
                            x1={`${starA.x}%`}
                            y1={`${starA.y}%`}
                            x2={`${starB.x}%`}
                            y2={`${starB.y}%`}
                            stroke="#f59e0b"
                            strokeWidth="1.2"
                            strokeDasharray="4 4"
                            style={{ opacity: zodiacOpacity }}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                          />
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {/* INDACTIVE STARS (STAR NODES) PLACEMENT AND EVENTS */}
                  {selectedMap.starNodes.map((star) => {
                    const isSelected = star.id === selectedStarId;
                    const isMajor = star.type === "major";
                    const starColor = getStarNodeColor(star.name, star.id, isMajor, starStyle);
                    const styleMeta = STAR_STYLES[starStyle];

                    return (
                      <div
                        key={star.id}
                        id={`viewport-star-${star.id}`}
                        style={{ left: `${star.x}%`, top: `${star.y}%` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound("bell", isMajor ? 880 : 540);
                          setSelectedStarId(star.id);
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                      >
                        {/* Interactive Pulsing Aura rings */}
                        <div 
                          className="absolute -inset-4 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: isSelected ? `${starColor}20` : "transparent",
                            border: isSelected 
                              ? `1px solid ${starColor}60` 
                              : `1px solid transparent`,
                            transform: isSelected ? "scale(1.25)" : "scale(1)"
                          }}
                        />

                        {/* Solid star center */}
                        <div 
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 relative"
                          style={{
                            backgroundColor: starColor,
                            boxShadow: `0 0 10px ${starColor}`
                          }}
                        >
                          {/* Inner core dot */}
                          <div 
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: isMajor ? styleMeta.lineColor : "#ffffff" }}
                          />
                          
                          {/* Pulsing ring */}
                          <span 
                            className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                            style={{ backgroundColor: starColor }}
                          />
                        </div>

                        {/* Tiny Star label on viewport */}
                        {isSelected ? (
                          <span className="absolute left-1/2 top-4 -translate-x-1/2 font-mono text-[8.5px] leading-relaxed whitespace-nowrap text-[#9999AA]/80 bg-[#030305]/75 px-1.5 py-0.5 rounded border border-[#222230]/40 tracking-wider pointer-events-none shadow-md z-30">
                            {star.name}
                          </span>
                        ) : (
                          <span className="absolute left-4 -top-1 font-mono text-[8px] whitespace-nowrap text-[#9999AA] bg-[#030305]/80 px-1 py-0.5 rounded border border-[#222230]/40 tracking-wider transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none shadow-md">
                            {star.name}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* TRADITIONAL ZODIAC CONSTELLATION OVERLAY STAR NODES */}
                  {showZodiacOverlay && ZODIAC_CONSTELLATIONS[selectedZodiacIndex].nodes.map((zNode, idx) => {
                    return (
                      <div
                        key={`zodiac-star-${idx}`}
                        style={{ left: `${zNode.x}%`, top: `${zNode.y}%`, opacity: zodiacOpacity }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                      >
                        {/* Glow ring */}
                        <div className="absolute -inset-2.5 rounded-full border border-amber-500/20 bg-amber-950/5 animate-pulse" />

                        {/* Traditional amber crosshair ring */}
                        <div className="w-4 h-4 rounded-full border border-dashed border-amber-500/50 animate-spin-slow flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full shadow-[0_0_8px_#f59e0b]" />
                        </div>

                        {/* Little label box next to Zodiac star */}
                        <span className="absolute left-4 -top-3.5 font-mono text-[8.5px] leading-none whitespace-nowrap text-amber-300 font-bold tracking-wide bg-[#0b0602]/95 border border-[#451a03]/40 px-1 py-0.5 rounded shadow-lg">
                          {zNode.name}
                        </span>
                      </div>
                    );
                  })}

                  {/* SUBORDINATE FLOATING DECORATIONS (TECHNICAL AESTHETIC REFS - HIDDEN DURING STAR FOCUS TO AVOID OVERLAPS) */}
                  {!selectedStarId && (
                    <>
                      <div className="absolute bottom-4 left-6 text-[9px] font-mono text-cyan-400/70 p-1 tracking-widest bg-slate-950/40 rounded border border-[#222230]/50 uppercase flex items-center gap-1.5 backdrop-blur-md">
                        <span>SYS_REF // SPATIAL_C72</span>
                        {zoomScale > 1 && (
                          <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded border border-cyan-800/40 font-bold text-[8px] animate-pulse">
                            Zoom: {zoomScale.toFixed(2)}x
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-4 right-6 text-[9px] font-mono text-violet-400/70 p-1 tracking-widest bg-slate-950/40 rounded border border-[#222230]/50 uppercase backdrop-blur-md">
                        MATRIX: {selectedMap.starNodes.length}P_LOCK
                      </div>
                    </>
                  )}

                  {/* INTERACTIVE COMPASS OVERLAY INDICATING FOCUS */}
                  {selectedStarId && (
                    <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 rounded-3xl flex items-center justify-center">
                      <div className="absolute w-[90%] h-[90%] rounded-full border border-dashed border-cyan-500/5 animate-spin-slow" />
                      <div className="absolute w-44 h-44 rounded-full border border-violet-500/10 flex items-center justify-center animate-spin-slow-reverse" />
                    </div>
                  )}

                  {/* BOTTOM HOVER CAP DETAILS DISPLAY FOR ACTIVE SELECT STAR */}
                  <AnimatePresence>
                    {selectedStarId && (() => {
                      const starObj = selectedMap.starNodes.find(s => s.id === selectedStarId);
                      if (!starObj) return null;
                      return (
                        <motion.div
                          key="floating-star-tooltip"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          id="star-interactive-overlay-card"
                          className="absolute bottom-3 left-3 right-3 p-4 bg-[#07070c]/95 border border-[#222230] rounded-2xl z-20 flex flex-col items-start gap-1 shadow-2xl backdrop-blur-md"
                        >
                          <h4 className="text-sm font-sans font-medium text-cyan-400">{starObj.name}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                            "{starObj.significance}"
                          </p>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>

                </motion.div>
              )}
            </AnimatePresence>
          </div>)}

          {/* ACTIVE MAP COMPASS STATS BAR */}
          <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mt-5 grid grid-cols-3 gap-3">
            <div className="p-3 bg-[#0a0a14]/60 border border-[#222230] rounded-2xl text-center backdrop-blur-md">
              <span className="text-[9px] uppercase tracking-widest text-[#666680] block font-mono">Elements</span>
              <p className="text-xs font-semibold text-cyan-400 mt-1 uppercase tracking-wider">{selectedMap.element}</p>
            </div>
            <div className="p-3 bg-[#0a0a14]/60 border border-[#222230] rounded-2xl text-center backdrop-blur-md">
              <span className="text-[9px] uppercase tracking-widest text-[#666680] block font-mono">Astrometric Nodes</span>
              <p className="text-sm font-light text-slate-100 mt-1">{selectedMap.starNodes.length} Detected</p>
            </div>
            <div className="p-3 bg-[#0a0a14]/60 border border-[#222230] rounded-2xl text-center backdrop-blur-md">
              <span className="text-[9px] uppercase tracking-widest text-[#666680] block font-mono">Coord Concordance</span>
              <p className="text-xs font-mono text-[#9999AA] mt-1">± ${(selectedMap.starNodes.length * 2.37).toFixed(2)}%</p>
            </div>
          </div>
        </section>

        {isDesktop && (
          <div
            className={`w-1 shrink-0 cursor-col-resize hover:bg-cyan-500/80 transition-all duration-150 z-50 flex items-center justify-center relative select-none border-l border-[#222230]/40 ${
              activeResizer === "right" ? "bg-cyan-500 border-cyan-400" : "bg-[#0b0b14]"
            }`}
            onMouseDown={() => setActiveResizer("right")}
          >
            {/* Splitter small line indicator */}
            <div className={`w-[1px] h-12 rounded ${activeResizer === "right" ? "bg-white animate-pulse" : "bg-slate-700/60"}`} />
          </div>
        )}

        {/* ASIDE 2: THE CELESTIAL ANALYSIS & SIGS DETAILS BAR */}
        <aside
          style={{
            width: isDesktop ? `${rightWidth}px` : undefined,
            minWidth: isDesktop ? `${rightWidth}px` : undefined,
            maxWidth: isDesktop ? `${rightWidth}px` : undefined,
            boxSizing: "border-box"
          }}
          className="w-full shrink-0 border-t lg:border-t-0 border-[#222230] bg-[#07070c]/95 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto overflow-x-hidden flex-none"
        >
          
          <div className="space-y-2 w-full min-w-0 overflow-hidden">
            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-mono block">
              Active Constellation Map
            </span>
            {editingMapId === selectedMap.id ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => handleSaveRename(selectedMap.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRename(selectedMap.id);
                  if (e.key === "Escape") {
                    isCancelingRenameRef.current = true;
                    setEditingMapId(null);
                  }
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                className="text-xl md:text-2xl font-serif italic text-white bg-slate-900 border border-cyan-500 rounded focus:outline-none w-full px-2 py-1 min-w-0"
              />
            ) : (
              <h2 
                onDoubleClick={() => {
                  handleStartRename(selectedMap);
                }}
                className="text-xl md:text-2xl font-serif italic text-white leading-tight flex items-start justify-between gap-2 group/header cursor-pointer select-none w-full min-w-0"
                title="Double-click to rename"
              >
                <span className="break-words min-w-0 flex-1 line-clamp-2 pr-1" style={{ wordBreak: 'break-word' }}>{selectedMap.constellationName}</span>
                <button
                  onClick={() => handleStartRename(selectedMap)}
                  className="p-1.5 opacity-70 hover:opacity-100 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200 cursor-pointer shrink-0 transform active:scale-95"
                  title="Rename Constellation"
                >
                  <Edit size={14} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                </button>
              </h2>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <User size={12} className="text-slate-600" />
              <span>Resolved and certified for </span>
              <span className="text-violet-400 font-medium">{selectedMap.userName || "Aura Mirror"}</span>
            </div>
          </div>

          {/* STAR STYLE SETTINGS CARD */}
          <div className="p-4 bg-slate-950/40 border border-[#222230] rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-[25px] pointer-events-none" />
            
            <div className="text-[10px] uppercase font-mono tracking-widest text-violet-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles size={11} className="text-violet-400" /> Star Node Style
              </span>
              <span className="text-[8px] font-mono opacity-80 bg-slate-900 text-slate-400 border border-[#222230] px-1.5 py-0.5 rounded uppercase">
                {starStyle}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[8px] uppercase font-mono text-[#888899] mb-1.5">Astrometric Color Palette</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(STAR_STYLES) as StarStyleType[]).map((styleId) => {
                    const styleMeta = STAR_STYLES[styleId];
                    const isSelected = starStyle === styleId;
                    return (
                      <button
                        key={styleId}
                        onClick={() => {
                          handleUpdateStarStyle(styleId);
                          playSound("bell", 550 + Math.random() * 200);
                        }}
                        className={`text-left p-2 rounded-xl border text-[10px] font-sans transition-all cursor-pointer relative ${
                          isSelected 
                            ? "bg-slate-900 border-violet-500/70 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)]" 
                            : "bg-slate-950/80 border-[#1e1e2d] hover:border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {/* 3 small pills representing the palette */}
                        <div className="flex gap-1 mb-1.5">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: styleMeta.majorColor }} />
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: styleMeta.minorColor }} />
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: styleMeta.lineColor }} />
                        </div>
                        <div className="font-medium text-[9px] leading-tight truncate">{styleMeta.name.split(" ")[0]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ZODIAC CONVERGENCE CARD */}
          <div className="p-4 bg-slate-950/20 border border-[#1e1e2d] rounded-2xl relative">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#666680] font-bold flex items-center gap-1.5">
                <Sparkles size={11} className="text-cyan-500" /> Zodiac Convergence
              </span>
              {showZodiacOverlay && (() => {
                const results = calculateZodiacSimilarity(
                  selectedMap.starNodes,
                  ZODIAC_CONSTELLATIONS[selectedZodiacIndex].nodes
                );
                return (
                  <span className="font-mono text-[10px] font-bold text-cyan-400">
                    {results.score}% Match
                  </span>
                );
              })()}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-grow">
                <select
                  id="zodiac-constellation-selection-dropdown"
                  value={selectedZodiacIndex}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setSelectedZodiacIndex(idx);
                    playSound("bell", 400 + idx * 40);
                  }}
                  className="w-full text-xs px-2.5 py-1.5 bg-[#0a0a14]/90 hover:bg-[#0c0c1a] border border-[#1e1e2d] focus:border-cyan-500/50 text-slate-100 font-mono cursor-pointer transition-all duration-300 rounded-xl outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
                >
                  {ZODIAC_CONSTELLATIONS.map((z, idx) => (
                    <option key={z.name} value={idx} className="bg-[#0b0b14] text-slate-100">
                      {z.symbol} {z.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Liquid Crystal style custom toggle slider */}
              <button
                id="zodiac-overlay-toggle-btn"
                onClick={() => {
                  playSound("pulse");
                  setShowZodiacOverlay(!showZodiacOverlay);
                }}
                className={`relative w-10 h-6 rounded-full border transition-all duration-300 cursor-pointer flex items-center p-[2px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.05)] ${
                  showZodiacOverlay 
                    ? "bg-blue-600 border-blue-400/50 shadow-[0_0_10px_rgba(37,99,235,0.45)]" 
                    : "bg-[#0a0a14] border-[#1e1e2d]"
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.6)] transition-transform duration-300 ${
                    showZodiacOverlay ? "translate-x-[16px] bg-white" : "translate-x-0 bg-slate-400"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* THE SIGNIFICANCE GUIDE PROMINENT FEATURE BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/20 via-indigo-950/25 to-slate-950/50 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)] relative overflow-hidden group/guide">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-[30px] pointer-events-none group-hover/guide:scale-125 transition-all duration-500" />
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-indigo-500/10 rounded-full blur-[25px] pointer-events-none" />
            
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-cyan-400 font-bold flex items-center gap-1.5 animate-pulse">
                  <Sparkles size={11} className="text-cyan-400" /> Recommended Reading
                </span>
                <span className="text-[8px] font-mono font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-full">
                  Aura Manual Live
                </span>
              </div>
              
              <div>
                <h3 className="text-xs font-semibold text-white tracking-wide font-sans flex items-center gap-1.5">
                  Explore Freckle Significance Guide
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Discover the sacred laws behind your dermal alignments, stellar regions, and face-birth archetypes.
                </p>
              </div>

              <button
                id="sidebar-significance-guide-launcher"
                onClick={() => {
                  playSound("bell", 750);
                  setShowSignificanceGuide(true);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-[#07070d] font-bold text-[10px] uppercase font-mono tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] cursor-pointer flex items-center justify-center gap-2 transform active:scale-95"
              >
                <BookOpen size={11} className="text-[#07070d]" />
                <span>Open Astrometry Manual</span>
              </button>
            </div>
          </div>

          {/* CHRONICLES CARDS */}
          <div className="space-y-4">
            
            {/* Primary reading box */}
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-[30px] pointer-events-none" />
              <div className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 mb-2 flex items-center gap-1.5">
                <Globe size={11} /> Celestial Core reading
              </div>
              <p className="text-xs md:text-sm text-[#9999AA] leading-relaxed Georgia, serif italic">
                "{selectedMap.celestialReading}"
              </p>
            </div>

            {/* In-depth details segment */}
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#666680]">
                Astrological Correspondence
              </div>

              {/* Personality traits */}
              <div className="p-3.5 bg-slate-950/60 border border-[#222230] rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-800/20 text-cyan-400 mt-0.5 shrink-0">
                  <User size={13} />
                </div>
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-300">Skin Personality Archetype</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {selectedMap.significanceDetail.personality}
                  </p>
                </div>
              </div>

              {/* Destiny Prophecy */}
              <div className="p-3.5 bg-slate-950/60 border border-[#222230] rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-violet-950/30 border border-violet-800/20 text-violet-400 mt-0.5 shrink-0">
                  <Moon size={13} />
                </div>
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-300">Cosmic Path / Destiny</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {selectedMap.significanceDetail.destiny}
                  </p>
                </div>
              </div>

              {/* Stellar Alignment Frequency */}
              <div className="p-3.5 bg-slate-950/60 border border-[#222230] rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-800/20 text-cyan-400 mt-0.5 shrink-0">
                  <Compass size={13} />
                </div>
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-300">Vibrational Celestial Cycle</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed text-cyan-200">
                    {selectedMap.significanceDetail.cosmicRhythm}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* CALL TO ACTIONS: HIGH-RES EXPORTER & SHARING */}
          <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-[#222230]/70">
            <button
              id="export-poster-modal-btn"
              onClick={() => { 
                if (!currentUser) {
                  playSound("bell", 300);
                  alert("Exporting high-resolution posters is dedicated to certified astrometrists. Please connect your Google account in the top right to download!");
                  return;
                }
                playSound("bell", 750); 
                setPosterModalVisible(true); 
              }}
              className="w-full py-4 bg-white hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_#22d3ee] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={14} />
              <span>Export Poster (Hi-Res)</span>
              {!currentUser && <Shield size={11} className="text-violet-600 inline animate-pulse shrink-0" />}
            </button>

            <button
              id="share-map-modal-btn"
              onClick={() => { playSound("bell", 600); setShareModalVisible(true); }}
              className="w-full py-3.5 border border-white/20 hover:border-white text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 size={13} />
              <span>Share Cosmic Map</span>
            </button>
          </div>

        </aside>

      </div>

      {/* FOOTER BAR WITH SPATIAL COMPASS METADATA */}
      <footer className="h-12 shrink-0 border-t border-[#222230] bg-[#050508]/95 flex items-center px-6 justify-between text-[10px] tracking-[0.2em] text-[#444455] uppercase font-mono z-10 relative">
        <div className="hidden sm:block">Spatial Coordinate System v4.3.0 // STABLE</div>
        <div className="sm:hidden">SCS v4.3.0</div>
        <div>&copy; 2026 Freckles Constellations Studio</div>
      </footer>

      {/* MODAL 1: POSTER THEME CUSTOMIZER & ACTUAL CANVAS EXPORTER */}
      <AnimatePresence>
        {posterModalVisible && (
          <motion.div
            key="poster-customizer-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Real off-screen rendering canvas */}
            <canvas ref={canvasRef} className="hidden" />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#09090f] border border-[#222230] rounded-3xl overflow-hidden p-6 shadow-2xl relative"
            >
              {/* Corner Glow decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-sans font-medium text-white tracking-wide flex items-center gap-2">
                    <Grid3X3 className="text-cyan-400" />
                    <span>Configure High-Resolution Art Poster</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Design a gorgeous typographic celestial chart printed with your custom facial nodes coordinates.
                  </p>
                </div>
                <button
                  id="close-poster-modal"
                  onClick={() => { playSound("bell", 400); setPosterModalVisible(false); }}
                  className="p-1 px-3 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-[#222230] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visualizer Preview mockup */}
                <div className="bg-[#030306] rounded-2xl border border-[#222230] p-4 flex flex-col justify-between aspect-[3/4] relative overflow-hidden shadow-inner">
                  
                  {/* Fake decorative poster borders resembling real exports */}
                  <div className="absolute inset-2 border border-slate-800/50 rounded-lg pointer-events-none" />
                  <div className="absolute inset-4 border border-dashed border-cyan-500/10 rounded-lg pointer-events-none" />

                  {/* Simulated colors */}
                  <div className="text-center z-10 pt-4">
                    <div className="text-[8px] uppercase tracking-widest text-[#666680] font-mono">STELLAR GRAPH CHART</div>
                    <div className="text-lg font-serif italic text-white mt-1 uppercase tracking-wider">{selectedMap.constellationName}</div>
                    <div className="text-[7px] text-cyan-400 font-mono tracking-widest mt-0.5 uppercase">ELEMENT: {selectedMap.element}</div>
                  </div>

                  {/* Procedural micro lines vector graphic mock */}
                  <div className="flex-grow flex items-center justify-center relative">
                    <div className="w-24 h-24 rounded-full border border-cyan-500/20 flex items-center justify-center animate-spin-slow">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className="absolute w-36 h-36 rounded-full border border-dashed border-violet-500/10" />
                  </div>

                  <div className="text-center pb-4 z-10 space-y-1">
                    <div className="text-[7px] text-slate-500 font-mono">
                      SUBJECT: {selectedMap.userName?.toUpperCase() || "UNSPECIFIED"} | MAP LOCK: {selectedMap.id.slice(0, 8).toUpperCase()}
                    </div>
                    {posterAstroText && (
                      <p className="text-[8px] text-slate-400 font-serif max-w-[200px] mx-auto truncate text-center">
                        "{selectedMap.celestialReading}"
                      </p>
                    )}
                  </div>

                  {/* Backdrop Color Preset Indicators */}
                  <div className={`absolute inset-0 z-0 opacity-15 pointer-events-none ${
                    posterTheme === "midnight" ? "bg-gradient-to-t from-cyan-950 via-slate-950 to-indigo-950" :
                    posterTheme === "dawn" ? "bg-gradient-to-t from-amber-950 via-slate-950 to-rose-950" :
                    posterTheme === "supernova" ? "bg-gradient-to-t from-pink-950 via-slate-920 to-fuchsia-950" :
                    "bg-gradient-to-t from-indigo-950 via-slate-900 to-emerald-950"
                  }`} />
                </div>

                {/* Configuration Option Controls */}
                <div className="space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    
                    {/* Theme Presets */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
                        Background Celestial Preset Theme
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id="poster-theme-midnight"
                          onClick={() => { playSound("bell", 550); setPosterTheme("midnight"); }}
                          className={`p-3 rounded-xl border text-xs text-left transition-all ${
                            posterTheme === "midnight" 
                              ? "border-cyan-400 bg-cyan-950/20 text-white shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                              : "border-[#222230] bg-slate-950/50 hover:border-slate-800 text-slate-400"
                          }`}
                        >
                          <div className="font-semibold">Midnight Teal</div>
                          <div className="text-[10px] text-slate-400 opacity-80 mt-0.5">Deep blues and auroras</div>
                        </button>
                        <button
                          id="poster-theme-dawn"
                          onClick={() => { playSound("bell", 580); setPosterTheme("dawn"); }}
                          className={`p-3 rounded-xl border text-xs text-left transition-all ${
                            posterTheme === "dawn" 
                              ? "border-amber-400 bg-amber-950/20 text-white shadow-[0_0_10px_rgba(251,191,36,0.1)]" 
                              : "border-[#222230] bg-slate-950/50 hover:border-slate-800 text-slate-400"
                          }`}
                        >
                          <div className="font-semibold">Stellar Dawn</div>
                          <div className="text-[10px] text-slate-400 opacity-80 mt-0.5">Amber, golds and bronze</div>
                        </button>
                        <button
                          id="poster-theme-supernova"
                          onClick={() => { playSound("bell", 610); setPosterTheme("supernova"); }}
                          className={`p-3 rounded-xl border text-xs text-left transition-all ${
                            posterTheme === "supernova" 
                              ? "border-pink-400 bg-pink-950/20 text-white shadow-[0_0_10px_rgba(244,63,94,0.1)]" 
                              : "border-[#222230] bg-slate-950/50 hover:border-slate-800 text-slate-400"
                          }`}
                        >
                          <div className="font-semibold">Supernova Glow</div>
                          <div className="text-[10px] text-slate-400 opacity-80 mt-0.5">Vibrant pinks & magentas</div>
                        </button>
                        <button
                          id="poster-theme-charcoal"
                          onClick={() => { playSound("bell", 640); setPosterTheme("charcoal"); }}
                          className={`p-3 rounded-xl border text-xs text-left transition-all ${
                            posterTheme === "charcoal" 
                              ? "border-emerald-400 bg-emerald-950/20 text-white shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                              : "border-[#222230] bg-slate-950/50 hover:border-slate-800 text-slate-400"
                          }`}
                        >
                          <div className="font-semibold">Deep Void</div>
                          <div className="text-[10px] text-slate-400 opacity-80 mt-0.5">Cosmic charcoal & emerald</div>
                        </button>
                      </div>
                    </div>

                    {/* Metadata display toggles */}
                    <div className="space-y-2.5">
                      <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
                        Astrological Details Decoration
                      </label>
                      
                      <label className="flex items-center gap-3 p-3 bg-slate-900/60 border border-[#222230] rounded-xl cursor-pointer hover:border-slate-800 transition">
                        <input
                          id="toggle-poster-grid"
                          type="checkbox"
                          checked={posterGrid}
                          onChange={(e) => { playSound("bell", 500); setPosterGrid(e.target.checked); }}
                          className="rounded border-[#222230] bg-slate-950 text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                        />
                        <div>
                          <div className="text-xs font-medium text-slate-200">Show Astronomical Grid lines</div>
                          <div className="text-[10px] text-slate-500">Includes precise declination & ascension coordinates</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-900/60 border border-[#222230] rounded-xl cursor-pointer hover:border-slate-800 transition">
                        <input
                          id="toggle-poster-astrotext"
                          type="checkbox"
                          checked={posterAstroText}
                          onChange={(e) => { playSound("bell", 520); setPosterAstroText(e.target.checked); }}
                          className="rounded border-[#222230] bg-slate-950 text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                        />
                        <div>
                          <div className="text-xs font-medium text-slate-200">Print Celestial Core Reading</div>
                          <div className="text-[10px] text-slate-500">Prints the full paragraph of spiritual prophecy</div>
                        </div>
                      </label>
                    </div>

                  </div>

                  {/* Print and Save action triggers */}
                  <div className="pt-4 border-t border-[#222230]/60 flex gap-3">
                    <button
                      id="poster-trigger-download-btn"
                      onClick={handleExportPoster}
                      className="flex-1 py-4.5 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl hover:from-cyan-300 hover:to-indigo-400 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(34,211,238,0.2)]"
                    >
                      <Download size={15} />
                      Render & Download PNG
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: AURA SHARING POPUP */}
      <AnimatePresence>
        {shareModalVisible && (
          <motion.div
            key="share-aura-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#09090f] border border-[#222230] rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-lg font-sans font-medium text-white flex items-center gap-2">
                    <Share2 className="text-cyan-400" size={18} />
                    <span>Share Constellation to the Cosmos</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transmit your unique epidermal star map coordinate to friends.
                  </p>
                </div>
                <button
                  id="close-share-modal"
                  onClick={() => { playSound("bell", 400); setShareModalVisible(false); }}
                  className="p-1 text-slate-500 hover:text-white transition text-xs font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Share card preview mockup */}
              <div className="bg-[#030306] rounded-2xl border border-[#222230] p-4 space-y-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-cyan-400/50 flex items-center justify-center bg-cyan-950/20">
                    <Compass size={14} className="text-cyan-400 animate-spin-slow" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-200">Freckles Alignment Map Result</h4>
                    <span className="text-[10px] text-cyan-400/80 font-mono">ID: {selectedMap.id.slice(0, 15)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-xs text-slate-400 space-y-2 leading-relaxed">
                  <p>
                    ✨ Traced my custom facial face freckles into the constellation 
                    <strong className="text-white block mt-0.5">🌌 {selectedMap.constellationName} ({selectedMap.constellationType})!</strong>
                  </p>
                  <p className="font-serif italic border-l-2 border-indigo-500/50 pl-2.5 text-[11px] text-slate-500">
                    "{selectedMap.celestialReading.slice(0, 110)}..."
                  </p>
                </div>
              </div>

              {/* Direct Link Copier */}
              <div className="space-y-2 mt-5">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                  Direct Astral Coordinate Link
                </label>
                <div className="flex gap-2">
                  <input
                    id="copyable-share-link-input"
                    type="text"
                    readOnly
                    value={`https://freckles-constellations.astro/share/${selectedMap.id}`}
                    className="flex-1 text-xs px-3 py-2 bg-slate-950 border border-[#222230] rounded-xl text-slate-400 select-all outline-none"
                  />
                  <button
                    id="copy-to-clipboard-btn"
                    onClick={copyShareLink}
                    className="px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-widest transition flex items-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={13} />}
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Social Channels mimics */}
              <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-[#222230]/60">
                <button
                  id="share-whatsapp-btn"
                  onClick={() => { playSound("bell", 660); alert("Channeling orbital message via WhatsApp!"); }}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-xs font-medium border border-[#222230] text-slate-300 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Copy size={12} /> WhatsApp Broadcast
                </button>
                <button
                  id="share-twitter-btn"
                  onClick={() => { playSound("bell", 680); alert("Broadcasting astronomical telemetry to Twitter!"); }}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-xs font-medium border border-[#222230] text-slate-300 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Globe size={12} /> Post to Twitter
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: INSTRUCTION / HELP GUIDE */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            key="astro-exploration-guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#09090f] border border-[#222230] rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-sans font-medium text-white flex items-center gap-2 uppercase tracking-wider">
                  <Compass className="text-cyan-400 animate-pulse" size={18} />
                  <span>Epidermal Astrometry Guide</span>
                </h3>
                <button
                  id="close-guide-modal"
                  onClick={() => { playSound("bell", 400); setShowGuide(false); }}
                  className="p-1 text-slate-500 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <div>
                  <h4 className="text-slate-200 font-semibold mb-1 uppercase tracking-wide">1. Landmark Coordinates Calibration</h4>
                  <p>
                    By uploading a portrait, the Gemini AI acts as an astrolabe, isolating either freckles or landmark highs of the face (eyes, nose, cheeks, chin) as luminous stargazing coordinates.
                  </p>
                </div>

                <div>
                  <h4 className="text-slate-200 font-semibold mb-1 uppercase tracking-wide">2. Reading & Significance</h4>
                  <p>
                    Each star node has a unique celestial energy assigned to it. Click the stars directly inside the center map stage to unlock their poetic names, coordinates, and properties.
                  </p>
                </div>

                <div>
                  <h4 className="text-slate-200 font-semibold mb-1 uppercase tracking-wide">3. High Resolution Print Poster Exporter</h4>
                  <p>
                    Configure print theme backgrounds, astronomical grid layouts, and custom titles. We generate authentic vector assets for physical posters that can be downloaded straight to your memory storage!
                  </p>
                </div>

                <div className="p-3 bg-violet-950/20 border border-violet-800/20 rounded-xl flex items-start gap-2.5 text-violet-300">
                  <Sparkles size={16} className="shrink-0 mt-0.5" />
                  <span>The application comes equipped with preloaded maps so you may start charts analysis immediately!</span>
                </div>
              </div>

              <button
                id="ack-guide-btn"
                onClick={() => { playSound("bell", 550); setShowGuide(false); }}
                className="w-full mt-5 py-3 bg-[#10101c] hover:bg-[#15152a] text-slate-300 hover:text-white font-semibold text-xs uppercase tracking-widest border border-[#222230] rounded-xl transition cursor-pointer"
              >
                Enter the Sky Map
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 4: FRECKLE SIGNIFICANCE CELESTIAL GUIDE */}
      <AnimatePresence>
        {showSignificanceGuide && (
          <motion.div
            key="freckle-significance-guide-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans"
            onClick={() => setShowSignificanceGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-[#07070d] border border-cyan-500/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col my-8 h-[90vh] md:h-[650px]"
            >
              {/* Starry Ambient glow header */}
              <div className="relative border-b border-[#1b1b2a] bg-gradient-to-r from-cyan-950/25 to-slate-950 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_left,_var(--tw-gradient-stops))] from-cyan-950/10 via-transparent to-transparent pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                    <span className="text-[10px] tracking-[0.25em] text-cyan-400 font-mono uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">Aura Interpretation Manual</span>
                  </div>
                  <h3 className="text-xl font-sans font-light tracking-[0.1em] text-white mt-1.5 flex items-center gap-2">
                    <Sparkles className="text-cyan-400 animate-spin-slow" size={18} />
                    <span>Freckle Significance Guide</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Poetic celestial translations of epidermal star map configurations
                  </p>
                </div>
                
                <button
                  id="close-significance-btn"
                  onClick={() => { playSound("bell", 400); setShowSignificanceGuide(false); }}
                  className="absolute top-4 right-4 sm:static p-2 text-slate-400 hover:text-white bg-slate-900 border border-[#222230] rounded-full transition cursor-pointer hover:border-cyan-500/40"
                >
                  ✕
                </button>
              </div>

              {/* Dynamic Celestial Tabs */}
              <div className="bg-[#030307] border-b border-[#141423] p-1 grid grid-cols-3 text-xs font-mono shrink-0">
                <button
                  id="tab-patterns-btn"
                  onClick={() => { playSound("pulse", 440); setSignificanceActiveTab("patterns"); }}
                  className={`py-3 text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                    significanceActiveTab === "patterns" 
                      ? "text-cyan-400 bg-[#0c0c16] border-b border-cyan-500/30 font-medium" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Sparkles size={12} />
                  <span>Constellation Patterns</span>
                </button>
                <button
                  id="tab-regions-btn"
                  onClick={() => { playSound("pulse", 494); setSignificanceActiveTab("regions"); }}
                  className={`py-3 text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                    significanceActiveTab === "regions" 
                      ? "text-cyan-400 bg-[#0c0c16] border-b border-cyan-500/30 font-medium" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Compass size={12} />
                  <span>Landmark Regions</span>
                </button>
                <button
                  id="tab-typologies-btn"
                  onClick={() => { playSound("pulse", 554); setSignificanceActiveTab("typologies"); }}
                  className={`py-3 text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                    significanceActiveTab === "typologies" 
                      ? "text-cyan-400 bg-[#0c0c16] border-b border-cyan-500/30 font-medium" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Star size={12} />
                  <span>Stellar Class</span>
                </button>
              </div>

              {/* Main Split Interface Area */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[#04040a]">
                
                {/* 1. Patterns Tab Content */}
                {significanceActiveTab === "patterns" && (
                  <>
                    {/* Left List Pane */}
                    <div className="w-full md:w-[280px] border-r border-[#141423] overflow-y-auto p-4 space-y-2 shrink-0">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 block mb-3">Geometric Formations</span>
                      {GEOMETRIC_PATTERNS.map((pattern) => {
                        const isSelected = selectedPatternId === pattern.id;
                        return (
                          <div
                            key={pattern.id}
                            id={`pattern-card-${pattern.id}`}
                            onClick={() => { playSound("sweep", isSelected ? 300 : 400); setSelectedPatternId(pattern.id); }}
                            className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#0b0c16]/80 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.08)]"
                                : "bg-slate-950/45 border-[#1b1b2a] hover:bg-[#07070e] hover:border-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-200">{pattern.name}</span>
                              <ChevronRight size={12} className={isSelected ? "text-cyan-400" : "text-slate-600"} />
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">{pattern.subtitle}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Interactive Detail Pane & Interactive Celestial Canvas Illustration */}
                    {(() => {
                      const p = GEOMETRIC_PATTERNS.find(x => x.id === selectedPatternId) || GEOMETRIC_PATTERNS[0];
                      return (
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col relative justify-between">
                          <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-700/5 rounded-full blur-3xl pointer-events-none" />
                          
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] font-mono tracking-widest text-[#666680] uppercase">Selected Configuration</span>
                              <h4 className="text-xl font-sans font-light text-white tracking-wide mt-1">{p.name}</h4>
                              <p className="text-xs italic text-cyan-400/80 font-mono mt-0.5">{p.subtitle}</p>
                            </div>

                            {/* Beautiful procedural constellation vector preview canvas */}
                            <div className="h-32 rounded-2xl bg-slate-950 border border-slate-900 flex items-center justify-center overflow-hidden relative shadow-inner">
                              <div className="absolute inset-0 bg-[#030307]/50" />
                              <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent top-1/2" />
                              <div className="absolute inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent left-1/2" />
                              
                              {/* Glowing vector graphics of the pattern */}
                              {p.id === "trine" && (
                                <svg className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" viewBox="0 0 100 100">
                                  <polygon points="50,15 15,75 85,75" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2" />
                                  <circle cx="50" cy="15" r="3" fill="currentColor" />
                                  <circle cx="15" cy="75" r="3" fill="currentColor" />
                                  <circle cx="85" cy="75" r="3" fill="currentColor" />
                                  <circle cx="50" cy="15" r="6" fill="cyan" fillOpacity="0.2" className="animate-pulse" />
                                  <circle cx="15" cy="75" r="6" fill="cyan" fillOpacity="0.2" className="animate-pulse" />
                                  <circle cx="85" cy="75" r="6" fill="cyan" fillOpacity="0.2" className="animate-pulse" />
                                </svg>
                              )}
                              {p.id === "stellar-line" && (
                                <svg className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" viewBox="0 0 100 100">
                                  <line x1="15" y1="20" x2="85" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="2" />
                                  <circle cx="15" cy="20" r="3" fill="currentColor" />
                                  <circle cx="50" cy="50" r="3" fill="currentColor" />
                                  <circle cx="85" cy="80" r="3" fill="currentColor" />
                                  <circle cx="50" cy="50" r="6" fill="cyan" fillOpacity="0.2" className="animate-pulse" />
                                </svg>
                              )}
                              {p.id === "nebulous-cluster" && (
                                <svg className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                                  <circle cx="50" cy="51" r="3.5" fill="currentColor" />
                                  <circle cx="42" cy="45" r="2" fill="currentColor" />
                                  <circle cx="58" cy="48" r="2" fill="currentColor" />
                                  <circle cx="48" cy="58" r="1.5" fill="currentColor" />
                                  <circle cx="55" cy="56" r="2" fill="currentColor" />
                                  <circle cx="40" cy="54" r="1" fill="currentColor" />
                                  {/* Line interconnectors of cluster */}
                                  <line x1="50" y1="51" x2="42" y2="45" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                                  <line x1="50" y1="51" x2="58" y2="48" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                                  <line x1="50" y1="51" x2="48" y2="58" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                                  <line x1="48" y1="58" x2="55" y2="56" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                                </svg>
                              )}
                              {p.id === "aegis-cross" && (
                                <svg className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" viewBox="0 0 100 100">
                                  <polygon points="50,15 85,50 50,85 15,50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2" />
                                  <line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                                  <line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                                  <circle cx="50" cy="15" r="3" fill="currentColor" />
                                  <circle cx="85" cy="50" r="3" fill="currentColor" />
                                  <circle cx="50" cy="85" r="3" fill="currentColor" />
                                  <circle cx="15" cy="50" r="3" fill="currentColor" />
                                </svg>
                              )}
                              {p.id === "scattered-nebula" && (
                                <svg className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" viewBox="0 0 100 100">
                                  <circle cx="15" cy="15" r="2.5" fill="currentColor" />
                                  <circle cx="80" cy="20" r="2" fill="currentColor" />
                                  <circle cx="25" cy="72" r="2.5" fill="currentColor" />
                                  <circle cx="75" cy="82" r="2.5" fill="currentColor" />
                                  <circle cx="50" cy="45" r="3.5" fill="currentColor" />
                                  <line x1="15" y1="15" x2="50" y2="45" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                                  <line x1="80" y1="20" x2="50" y2="45" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                                  <line x1="25" y1="72" x2="50" y2="45" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                                  <line x1="75" y1="82" x2="50" y2="45" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                                </svg>
                              )}
                              <span className="absolute bottom-2 right-3 text-[8.5px] font-mono tracking-widest text-[#444455] uppercase select-none">Vector Orbit Proj</span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-sans mt-3">
                              {p.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5 mt-4 pt-4 border-t border-[#1b1b2a]/60 font-mono">
                            <div className="bg-[#0b0b14] border border-cyan-500/10 rounded-xl p-3">
                              <span className="text-[8px] text-cyan-500 uppercase tracking-widest block">Resonance Field</span>
                              <span className="text-xs font-semibold text-slate-200 mt-1 block">{p.spiritualResonance}</span>
                            </div>
                            <div className="bg-[#0b0b14] border border-cyan-500/10 rounded-xl p-3">
                              <span className="text-[8px] text-cyan-500 uppercase tracking-widest block">Vibrational Pitch</span>
                              <span className="text-xs font-semibold text-slate-200 mt-1 block">{p.vibrationalLevel}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* 2. Regions Tab Content */}
                {significanceActiveTab === "regions" && (
                  <>
                    {/* Left List Pane */}
                    <div className="w-full md:w-[280px] border-r border-[#141423] overflow-y-auto p-4 space-y-2 shrink-0">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 block mb-3">Facial Astrolabe Sectors</span>
                      {EPIDERMAL_REGIONS.map((region) => {
                        const isSelected = selectedRegionId === region.id;
                        return (
                          <div
                            key={region.id}
                            id={`region-card-${region.id}`}
                            onClick={() => { playSound("sweep", isSelected ? 300 : 400); setSelectedRegionId(region.id); }}
                            className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#0b0c16]/80 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.08)]"
                                : "bg-slate-950/45 border-[#1b1b2a] hover:bg-[#07070e] hover:border-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-200">{region.name}</span>
                              <ChevronRight size={12} className={isSelected ? "text-cyan-400" : "text-slate-600"} />
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">{region.astralDomain}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Interactive Detail Pane & Interactive Facial Model Illustration */}
                    {(() => {
                      const r = EPIDERMAL_REGIONS.find(x => x.id === selectedRegionId) || EPIDERMAL_REGIONS[0];
                      return (
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col relative justify-between">
                          <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-700/5 rounded-full blur-3xl pointer-events-none" />
                          
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] font-mono tracking-widest text-[#666680] uppercase">Celestial Coordinates Domain</span>
                              <h4 className="text-xl font-sans font-light text-white tracking-wide mt-1">{r.name}</h4>
                              <p className="text-xs italic text-cyan-400/80 font-mono mt-0.5">Primary Ruler: {r.rulerStar}</p>
                            </div>

                            {/* Beautiful human face landmark geometry vector illustration */}
                            <div className="h-32 rounded-2xl bg-slate-950 border border-slate-900 flex items-center justify-center overflow-hidden relative shadow-inner">
                              <div className="absolute inset-0 bg-[#030307]/55" />
                              
                              {/* Glowing highlighted zone vectors */}
                              <svg className="w-16 h-24 text-slate-705" viewBox="0 0 100 150">
                                {/* Human Face outline */}
                                <path d="M50,15 C25,15 15,35 15,75 C15,115 28,135 50,135 C72,135 85,115 85,75 C85,35 75,15 50,15 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                                
                                {/* Forehead Sector */}
                                {r.id === "forehead" && (
                                  <path d="M50,15 C25,15 18,30 18,45 L82,45 C82,30 75,15 50,15 Z" fill="cyan" fillOpacity="0.2" stroke="cyan" strokeWidth="0.5" strokeDasharray="1.5" className="animate-pulse" />
                                )}
                                {/* Eyes Ridge */}
                                {r.id === "eyes" && (
                                  <rect x="18" y="47" width="64" height="24" rx="4" fill="cyan" fillOpacity="0.2" stroke="cyan" strokeWidth="0.5" strokeDasharray="1.5" className="animate-pulse" />
                                )}
                                {/* Cheek Fields */}
                                {r.id === "cheeks" && (
                                  <path d="M16,73 L38,73 L38,98 L18,98 Z M62,73 L84,73 L82,98 L62,98 Z" fill="cyan" fillOpacity="0.2" stroke="cyan" strokeWidth="0.5" strokeDasharray="1.5" className="animate-pulse" />
                                )}
                                {/* Nose Bridge */}
                                {r.id === "nose" && (
                                  <path d="M43,47 L57,47 L55,94 L45,94 Z" fill="cyan" fillOpacity="0.2" stroke="cyan" strokeWidth="0.5" strokeDasharray="1.5" className="animate-pulse" />
                                )}
                                {/* Chin Anchor */}
                                {r.id === "chin" && (
                                  <path d="M30,110 L70,110 C68,128 58,135 50,135 C42,135 32,128 30,110 Z" fill="cyan" fillOpacity="0.2" stroke="cyan" strokeWidth="0.5" strokeDasharray="1.5" className="animate-pulse" />
                                )}
                              </svg>

                              <div className="absolute right-4 bottom-2 text-right">
                                <span className="text-[7.5px] font-mono tracking-widest text-[#444455] block uppercase">Calibration Coordinate Gate</span>
                                <span className="text-[10px] font-mono text-cyan-400 font-semibold">{r.coordinates}</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-sans mt-3">
                              {r.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5 mt-4 pt-4 border-t border-[#1b1b2a]/60 font-mono">
                            <div className="bg-[#0b0b14] border border-cyan-500/10 rounded-xl p-3">
                              <span className="text-[8px] text-cyan-500 uppercase tracking-widest block">Core Celestial Resonance</span>
                              <span className="text-xs font-semibold text-slate-205 mt-1 block">{r.association}</span>
                            </div>
                            <div className="bg-[#0b0b14] border border-cyan-500/10 rounded-xl p-3">
                              <span className="text-[8px] text-cyan-500 uppercase tracking-widest block">Ruling Star Frequency</span>
                              <span className="text-xs font-semibold text-slate-200 mt-1 block font-mono">{r.rulerStar}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* 3. Typologies Tab Content */}
                {significanceActiveTab === "typologies" && (
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 block">Star Energy Magnitudes</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {STELLAR_TYPOLOGIES.map((type) => {
                        return (
                          <div
                            key={type.id}
                            className="p-5 rounded-2xl bg-[#090913] border border-cyan-500/10 hover:border-cyan-500/25 transition relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                            <div className="flex items-center gap-2.5 mb-3">
                              {type.id === "major" ? (
                                <div className="w-7 h-7 bg-cyan-950/40 border border-cyan-500/30 rounded-lg flex items-center justify-center text-cyan-400">
                                  <Sparkles size={14} className="animate-spin-slow" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 bg-slate-900 border border-[#222230] rounded-lg flex items-center justify-center text-slate-400">
                                  <Star size={14} />
                                </div>
                              )}
                              <h5 className="text-sm font-sans font-medium text-slate-100">{type.name}</h5>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed mb-4">
                              {type.description}
                            </p>

                            <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-2.5 inline-block text-[10px] uppercase tracking-wider font-mono text-cyan-400/80">
                              Resonance: <span className="font-semibold text-white">{type.frequency}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-cyan-950/15 border border-cyan-500/20 rounded-2xl text-xs text-slate-400 leading-relaxed flex items-start gap-3">
                      <Shield size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-205 block mb-0.5 font-mono text-[10px] uppercase tracking-wider">How to read your active Map</strong>
                        Your calculated star chart isolates both Major Anchors and Minor Accent stars, placing them in their designated facial domains to solve the geometric celestial connection mesh. Look close at your map to decipher how both nodes interconnect.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="border-t border-[#141423] p-4 bg-[#030307] text-center text-[10px] font-mono text-slate-500 shrink-0 select-none">
                <span>Traced coordinates calculated deterministically via Epidermal Astrometry Engine v1.8</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
