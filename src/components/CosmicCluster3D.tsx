import React, { useRef, useEffect, useState } from "react";
import { Star, Compass, User, Globe, Sparkles, Move } from "lucide-react";
import { ConstellationMap } from "../types";
import { synth } from "./CelestialSynth";

interface CosmicCluster3DProps {
  activeMapId: string;
  allMaps: ConstellationMap[];
  onSelectMap: (id: string) => void;
  soundEnabled: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Camera {
  pitch: number; // angle around X
  yaw: number;   // angle around Y
  zoom: number;  // distance scale factor
  target: Point3D;
  currentRotateSpeed: number;
}

export function CosmicCluster3D({
  activeMapId,
  allMaps,
  onSelectMap,
  soundEnabled
}: CosmicCluster3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const yawOffsetRef = useRef<number>(0);

  // Camera Settings
  const [camera, setCamera] = useState<Camera>({
    pitch: 0.4,
    yaw: 0.6,
    zoom: 1.0,
    target: { x: 0, y: 0, z: 0 },
    currentRotateSpeed: 0.003
  });

  const [hoveredMapId, setHoveredMapId] = useState<string | null>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [pointerStart, setPointerStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const [autoRotate, setAutoRotate] = useState(true);

  // Play audio sound safely
  const triggerSound = (type: "bell" | "pulse" | "sweep", pitch = 880) => {
    if (!soundEnabled) return;
    if (type === "bell") synth.playStarBell(pitch, 1.2);
    if (type === "pulse") synth.playCosmicPulse();
    if (type === "sweep") synth.playScanningSweep(1.5);
  };

  // Resize handler using standard ResizeObserver directly inside useEffect
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(300, Math.floor(width)),
          height: Math.max(300, Math.floor(height))
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Make sure we have coordinates for each constellation
  const processedMaps = allMaps.map((map, index) => {
    // If the map doesn't have a 3D position, we generate one systematically
    const pos3d = (map as any).pos3d || (() => {
      const scale = 180;
      // Derive a reliable seed from the map's id string
      const idSum = map.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), index * 10);
      const phi = (idSum * 137.5 * Math.PI) / 180; // beautiful spiral spacing
      const theta = Math.acos(2 * ((idSum % 23) / 23) - 1);
      return {
        x: Math.sin(theta) * Math.cos(phi) * scale,
        y: Math.sin(theta) * Math.sin(phi) * scale * 0.7, // flatter layout
        z: Math.cos(theta) * scale
      };
    })();

    return {
      ...map,
      pos3d
    };
  });

  // Handle Drag & Orbit
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPointerDown(true);
    setAutoRotate(false);
    
    // Transfer accumulated yawOffset to state so there is no visual jump
    if (yawOffsetRef.current !== 0) {
      setCamera(prev => ({
        ...prev,
        yaw: prev.yaw + yawOffsetRef.current
      }));
      yawOffsetRef.current = 0;
    }

    setPointerStart({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown) {
      // Direct Canvas Hover Detection
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Find if we are hovering a node's 2D projection
      const projectedNodes = (canvas as any)._projectedInfo || [];
      let found: string | null = null;
      for (const item of projectedNodes) {
        const dx = item.projX - mouseX;
        const dy = item.projY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 28) {
          found = item.id;
          break;
        }
      }
      if (found !== hoveredMapId) {
        setHoveredMapId(found);
        if (found) {
          triggerSound("bell", 750);
        }
      }
      return;
    }

    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;

    setCamera((prev) => ({
      ...prev,
      yaw: prev.yaw + dx * 0.007,
      pitch: Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, prev.pitch + dy * 0.007))
    }));

    setPointerStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPointerDown(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // If click (little movement), select the hovered constellation map
    if (hoveredMapId) {
      onSelectMap(hoveredMapId);
      triggerSound("pulse");
      
      // Center camera on target smoothly
      const targetMap = processedMaps.find(m => m.id === hoveredMapId);
      if (targetMap) {
        setCamera(prev => ({
          ...prev,
          target: { ...targetMap.pos3d }
        }));
      }
    }
  };

  // Native non-passive Wheel listener to handle smooth zoom and prevent page scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      setAutoRotate(false);
      // Determine zooming direction: scroll up is zoom in, scroll down is zoom out
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      setCamera((prev) => ({
        ...prev,
        zoom: Math.max(0.4, Math.min(3.2, prev.zoom * factor))
      }));
    };

    canvas.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleNativeWheel);
    };
  }, []);

  // Core Math projection loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Space background stars (static underlay coordinate points)
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      for (let i = 0; i < 40; i++) {
        // Star seeding
        const x = (Math.sin(i * 921.2) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 381.5) * 0.5 + 0.5) * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update Auto-rotation
      if (autoRotate && !isPointerDown) {
        yawOffsetRef.current += camera.currentRotateSpeed;
      }
      const currentYaw = camera.yaw + yawOffsetRef.current;

      // Projection Math
      const cosY = Math.cos(currentYaw);
      const sinY = Math.sin(currentYaw);
      const cosP = Math.cos(camera.pitch);
      const sinP = Math.sin(camera.pitch);

      const cx = canvas.width / 2;
      const isMobile = canvas.width < 768;
      const cy = isMobile ? canvas.height / 2.7 : canvas.height / 2;
      const fovDistance = 450; // Camera perspective focal point

      // Project 3D nodes into 2D screenspace coordinates
      const projects = processedMaps.map((map) => {
        // Offset relative to camera coordinate target (for centering)
        const rx = map.pos3d.x - camera.target.x;
        const ry = map.pos3d.y - camera.target.y;
        const rz = map.pos3d.z - camera.target.z;

        // Yaw Rotation (Y-axis)
        const x1 = rx * cosY - rz * sinY;
        const z1 = rx * sinY + rz * cosY;

        // Pitch Rotation (X-axis)
        const y2 = ry * cosP - z1 * sinP;
        const z2 = ry * sinP + z1 * cosP;

        // Apply scale & zoom
        const finalDistance = z2 + 500 / camera.zoom;

        if (finalDistance <= 10) {
          return { ...map, projX: -9999, projY: -9999, depth: -9999, visible: false, scaleProj: 0 };
        }

        const scaleProj = fovDistance / finalDistance;
        const projX = cx + x1 * scaleProj;
        const projY = cy + y2 * scaleProj;

        return {
          ...map,
          projX,
          projY,
          depth: finalDistance,
          visible: true,
          scaleProj
        };
      });

      // Save projection logs on canvas for interactive pointer hover calculations
      (canvas as any)._projectedInfo = projects.map(p => ({ id: p.id, projX: p.projX, projY: p.projY }));

      // 2. Draw Distance Proximity Grid Rings
      ctx.strokeStyle = "rgba(34, 211, 238, 0.03)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 140 * camera.zoom, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(139, 92, 246, 0.02)";
      ctx.beginPath();
      ctx.arc(cx, cy, 220 * camera.zoom, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Draw inter-constellation neighborhood links (Proximity Alignment Lines)
      ctx.strokeStyle = "rgba(34, 211, 238, 0.08)";
      ctx.setLineDash([2, 5]);
      ctx.lineWidth = 1;

      for (let i = 0; i < projects.length; i++) {
        for (let j = i + 1; j < projects.length; j++) {
          const pi = projects[i];
          const pj = projects[j];

          if (pi.visible && pj.visible) {
            // Distance in exact 3D units
            const dx = pi.pos3d.x - pj.pos3d.x;
            const dy = pi.pos3d.y - pj.pos3d.y;
            const dz = pi.pos3d.z - pj.pos3d.z;
            const dist3d = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Connect constellations that are close together in the cosmos
            if (dist3d < 280) {
              ctx.strokeStyle = `rgba(139, 92, 246, ${Math.max(0.01, 0.16 * (1 - dist3d / 280))})`;
              ctx.beginPath();
              ctx.moveTo(pi.projX, pi.projY);
              ctx.lineTo(pj.projX, pj.projY);
              ctx.stroke();
            }
          }
        }
      }
      ctx.setLineDash([]); // clear dash

      // Sort projects by depth (painter's algorithm) to render back-to-front
      const sortedProjects = [...projects].sort((a, b) => b.depth - a.depth);

      // 4. Draw Constellations
      sortedProjects.forEach((proj) => {
        if (!proj.visible) return;

        const isActive = proj.id === activeMapId;
        const isHovered = proj.id === hoveredMapId;

        // Custom theme space-related color based on constellation's style status
        let elemColor = "#38bdf8"; // default nebulous cyan-blue
        const mainStyle = proj.starStyle || (() => {
          // Systematic fallback based on element or name so each has a different color
          const elementLower = (proj.element || "").toLowerCase();
          if (elementLower.includes("void") || elementLower.includes("dark")) return "cosmic";
          if (elementLower.includes("fire") || elementLower.includes("supernova")) return "supernova";
          if (elementLower.includes("earth") || elementLower.includes("stardust") || elementLower.includes("gold")) return "golden";
          if (elementLower.includes("emerald") || elementLower.includes("nebula")) return "emerald";
          if (elementLower.includes("aether")) return "neon";
          
          // Or hash based
          const sum = proj.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const stylesList: ("neon" | "golden" | "classic" | "emerald" | "supernova" | "cosmic")[] = ["neon", "golden", "classic", "emerald", "supernova", "cosmic"];
          return stylesList[sum % stylesList.length];
        })();

        if (mainStyle === "neon") elemColor = "#22d3ee"; // Neon Aurora Cyan
        else if (mainStyle === "golden") elemColor = "#f59e0b"; // Solar Yellow Gold
        else if (mainStyle === "classic") elemColor = "#e2e8f0"; // Hyper-neutron White
        else if (mainStyle === "emerald") elemColor = "#10b981"; // Emerald Void Pulsar
        else if (mainStyle === "supernova") elemColor = "#ef4444"; // Supernova Plasma Rose
        else if (mainStyle === "cosmic") elemColor = "#a855f7"; // Deep Cosmic Purple

        // Size proportional to depth
        const radius = Math.max(2.5, (12 * proj.scaleProj));

        // Draw glowing aura for hovered or active constellation
        if (isHovered || isActive) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = elemColor;
          ctx.fillStyle = isHovered ? "rgba(255, 255, 255, 0.12)" : "rgba(34, 211, 238, 0.08)";
          ctx.beginPath();
          ctx.arc(proj.projX, proj.projY, radius * (isHovered ? 2.5 : 1.8), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }

        // Draw mini-constellation line structure inside the 3D space
        ctx.strokeStyle = isActive ? "rgba(255, 255, 255, 0.2)" : `${elemColor}22`;
        ctx.lineWidth = 0.8;
        proj.connections.forEach(([idA, idB]) => {
          const starA = proj.starNodes.find(s => s.id === idA);
          const starB = proj.starNodes.find(s => s.id === idB);
          if (starA && starB) {
            // Mini scale translation of nodes around the cluster center
            const x1 = proj.projX + (starA.x - 50) * 0.40 * proj.scaleProj;
            const y1 = proj.projY + (starA.y - 50) * 0.40 * proj.scaleProj;
            const x2 = proj.projX + (starB.x - 50) * 0.40 * proj.scaleProj;
            const y2 = proj.projY + (starB.y - 50) * 0.40 * proj.scaleProj;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        });

        // Draw actual constellation center node
        ctx.fillStyle = isActive ? "#ffffff" : elemColor;
        ctx.beginPath();
        ctx.arc(proj.projX, proj.projY, Math.max(3, radius * 0.6), 0, Math.PI * 2);
        ctx.fill();

        // Trace subtle wireframe boundaries around nodes
        ctx.strokeStyle = isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(proj.projX, proj.projY, Math.max(6, radius * 1.1), 0, Math.PI * 2);
        ctx.stroke();

        // Draw labeling text next to nodes
        const isFocus = isActive || isHovered;
        ctx.fillStyle = isFocus ? "#ffffff" : "rgba(153, 153, 170, 0.8)";
        ctx.font = isFocus ? "bold 11px sans-serif" : "9px monospace";
        ctx.textAlign = "left";
        
        const labelText = proj.constellationName;
        ctx.fillText(labelText, proj.projX + 14, proj.projY + 3);

        if (isFocus) {
          ctx.fillStyle = elemColor;
          ctx.font = "8px monospace";
          ctx.fillText(`By ${proj.userName || "Aura Scanner"}`, proj.projX + 14, proj.projY + 12);
        }
      });

      // Target lock crosshairs for Camera focus target
      ctx.strokeStyle = "rgba(34, 211, 238, 0.15)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Small cross in the center
      ctx.moveTo(cx - 15, cy);
      ctx.lineTo(cx + 15, cy);
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx, cy + 15);
      ctx.stroke();

      // Outer targeting brackets
      ctx.strokeStyle = "rgba(139, 92, 246, 0.1)";
      ctx.strokeRect(cx - 50, cy - 50, 100, 100);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [camera, processedMaps, hoveredMapId, activeMapId, autoRotate, isPointerDown, dimensions]);

  // Selected details card
  const activeFocusMap = processedMaps.find(m => m.id === (hoveredMapId || activeMapId));

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-[#020205] border border-[#222230] rounded-3xl overflow-hidden flex flex-col items-center justify-center select-none shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]"
    >
      {/* Visual background atmospheric lights */}
      <div className="absolute top-10 left-10 w-44 h-44 bg-cyan-950/20 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-44 h-44 bg-purple-950/20 rounded-full blur-[60px] pointer-events-none" />

      {/* 3D Space Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none z-10"
      />

      {/* TOP LEFT INTERACTIVE TELEMETRY INFOBAR */}
      <div className="absolute top-4 left-5 pointer-events-none z-20 font-mono text-[9px] text-slate-500 space-y-1 bg-[#040409]/80 border border-[#222230]/40 p-2.5 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Compass size={11} className="animate-spin-slow" />
          <span>CELESTIAL 3D CLUSTER MATRIX</span>
        </div>
        <div>PITCH: {camera.pitch.toFixed(2)}RAD | YAW: {camera.yaw.toFixed(2)}RAD</div>
        <div>CAM ZOOM: {(camera.zoom * 100).toFixed(0)}%</div>
        <div>TOTAL BODIES: {processedMaps.length} REGISTERED</div>
      </div>

      {/* TOP RIGHT ROTATION CONTROL PANELS */}
      <div className="absolute top-4 right-5 z-20 flex items-center gap-1.5 bg-[#030305]/90 border border-[#222230]/50 p-1 rounded-xl backdrop-blur-md">
        <button
          onClick={() => {
            triggerSound("bell", 550);
            setAutoRotate(!autoRotate);
          }}
          className={`px-2 py-1.5 rounded-lg border text-[10px] font-mono tracking-widest uppercase transition-all cursor-pointer bg-[#05050c]/90 ${
            autoRotate 
              ? "border-cyan-500/50 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.25)]" 
              : "border-[#222230] text-slate-400 hover:text-white"
          }`}
        >
          {autoRotate ? "● Orbit" : "◌ Orbit"}
        </button>

        <button
          onClick={() => {
            triggerSound("sweep");
            yawOffsetRef.current = 0;
            setCamera(prev => ({
              ...prev,
              pitch: 0.4,
              yaw: 0.6,
              zoom: 1.0,
              target: { x: 0, y: 0, z: 0 }
            }));
          }}
          className="px-2.5 py-1.5 rounded-lg border border-[#222230] text-[10px] font-mono tracking-widest uppercase text-slate-400 hover:text-white bg-[#05050c]/90 hover:border-slate-700 transition cursor-pointer"
          title="Reset Camera View"
        >
          Reset
        </button>

        <div className="w-px h-5 bg-[#222230] mx-0.5" />

        <button
          onClick={() => {
            triggerSound("bell", 600);
            setAutoRotate(false);
            setCamera(prev => ({
              ...prev,
              zoom: Math.min(3.2, prev.zoom + 0.2)
            }));
          }}
          className="w-7 h-7 rounded-lg border border-[#222230] hover:border-cyan-500/50 text-sm text-slate-400 hover:text-cyan-400 bg-[#05050c]/90 flex items-center justify-center font-bold font-mono transition cursor-pointer"
          title="Zoom In"
        >
          +
        </button>

        <button
          onClick={() => {
            triggerSound("bell", 500);
            setAutoRotate(false);
            setCamera(prev => ({
              ...prev,
              zoom: Math.max(0.4, prev.zoom - 0.2)
            }));
          }}
          className="w-7 h-7 rounded-lg border border-[#222230] hover:border-cyan-500/50 text-sm text-slate-400 hover:text-cyan-400 bg-[#05050c]/90 flex items-center justify-center font-bold font-mono transition cursor-pointer"
          title="Zoom Out"
        >
          -
        </button>
      </div>

      {/* FLOATING ACTION HUD / TOOLTIP AT BOTTOM OUTLINING TARGET COORDINATES */}
      {activeFocusMap && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 bg-[#04040a]/95 border border-[#222230]/85 rounded-xl sm:rounded-2xl z-20 flex flex-col md:flex-row justify-between gap-2.5 sm:gap-3 items-start md:items-center backdrop-blur-md shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
                {activeFocusMap.element}
              </span>
              <span className="text-[9px] font-mono text-violet-400 tracking-wider">
                COORDS: X:{activeFocusMap.pos3d.x.toFixed(0)} Y:{activeFocusMap.pos3d.y.toFixed(0)} Z:{activeFocusMap.pos3d.z.toFixed(0)}
              </span>
            </div>
            
            <h4 className="text-sm font-sans font-medium text-white tracking-wide flex items-center gap-1.5">
              <Star size={13} className="text-cyan-400" />
              <span>{activeFocusMap.constellationName}</span>
              <span className="text-xs text-[#9999AA] font-normal leading-normal font-serif italic">({activeFocusMap.constellationType})</span>
            </h4>
            
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <User size={11} className="text-slate-600" />
              <span>Resolved for <strong>{activeFocusMap.userName || "Aura Mirror"}</strong> on {activeFocusMap.date}</span>
            </p>
          </div>


        </div>
      )}

      {/* CENTER HUD EXPOSITION FOR ROTATION MECHANICS */}
      <div className="absolute bottom-20 right-4 pointer-events-none z-20 hidden lg:flex items-center gap-2 text-[10px] font-mono text-slate-600">
        <Move size={12} />
        <span>Drag to Rotate | Wheel to Zoom</span>
      </div>
    </div>
  );
}
