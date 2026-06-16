import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, Upload, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { synth } from "./CelestialSynth";

interface FacialCameraProps {
  onPhotoSelected: (base64Image: string) => void;
}

export const FacialCamera: React.FC<FacialCameraProps> = ({ onPhotoSelected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Initialize and clean up camera stream
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [cameraActive, isFrontCamera]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stopCamera();
      }

      const facingMode = isFrontCamera ? "user" : "environment";
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 640 },
          aspectRatio: 1
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera activation failed:", err);
      setCameraError(
        "Could not access camera. Make sure the app has camera permissions or use the upload panel below."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleCameraFacing = () => {
    synth.playStarBell(660, 0.4);
    setIsFrontCamera(!isFrontCamera);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Draw square frame
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = 640;
        canvas.height = 640;

        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;

        // Draw and mirror front camera if needed
        ctx.save();
        if (isFrontCamera) {
          ctx.translate(640, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, startX, startY, size, size, 0, 0, 640, 640);
        ctx.restore();

        // Convert canvas image to base64 representation
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        synth.playCosmicPulse();
        stopCamera();
        setCameraActive(false);
        onPhotoSelected(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        synth.playCosmicPulse();
        onPhotoSelected(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerUploadClick = () => {
    synth.playStarBell(520, 0.4);
    fileInputRef.current?.click();
  };

  return (
    <div id="facial-camera-container" className="w-full max-w-3xl md:max-w-4xl mx-auto">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Container */}
      <div className="relative border border-slate-800/85 rounded-3xl bg-slate-950/80 backdrop-blur-md p-3 md:p-4 shadow-[0_0_50px_rgba(30,41,59,0.5)] overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-stretch gap-4 md:gap-6 justify-between">
          
          {/* LEFT COLUMN: INTERACTIVE CAMERA STAGE */}
          <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner group">
              <AnimatePresence mode="wait">
                {cameraActive ? (
                  /* LIVE VIDEO STREAM */
                  <motion.div
                    key="video-stage"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Star Alignment Grid Layer */}
                    <div className="absolute inset-0 border-[2px] border-dashed border-cyan-500/20 pointer-events-none flex items-center justify-center">
                      <div className="w-4/5 h-4/5 rounded-full border-2 border-dashed border-violet-500/30 animate-spin-slow pointer-events-none" />
                      <div className="absolute w-2/3 h-2/3 rounded-full border border-cyan-500/40 flex items-center justify-center">
                        <div className="w-4 h-4 border-l border-t border-cyan-400 -translate-x-12 -translate-y-12" />
                        <div className="w-4 h-4 border-r border-t border-cyan-400 translate-x-12 -translate-y-12" />
                        <div className="w-4 h-4 border-l border-b border-cyan-400 -translate-x-12 translate-y-12" />
                        <div className="w-4 h-4 border-r border-b border-cyan-400 translate-x-12 translate-y-12" />
                      </div>
                    </div>

                    {/* Sweep scanline effect */}
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#06b6d4] animate-sweep pointer-events-none" />

                    {/* Camera overlays */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                      <button
                        id="capture-shutter-btn"
                        onClick={capturePhoto}
                        className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_#06b6d4] hover:shadow-[0_0_30px_#06b6d4] transition duration-300 transform active:scale-95 cursor-pointer"
                      >
                        <Sparkles size={24} className="animate-pulse" />
                      </button>
                      <button
                        id="flip-camera-btn"
                        onClick={toggleCameraFacing}
                        className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/50 flex items-center justify-center transition cursor-pointer"
                        title="Flip Camera"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* LANDING METEORIC ZONE */
                  <motion.div
                    key="upload-landing-stage"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="p-3.5 rounded-full bg-slate-950/60 border border-slate-800 mb-3 group-hover:scale-105 transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                      <ImageIcon className="w-8 h-8 text-violet-400/80 animate-pulse" />
                    </div>
                    <h3 className="font-sans font-medium text-slate-200 text-sm tracking-wide">
                      Matrix Lens Offline
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                      Initialize the live web alignment lens, or supply a file.
                    </p>

                    <button
                      id="initiate-camera-btn"
                      onClick={() => {
                        synth.playStarBell(660, 0.4);
                        setCameraActive(true);
                      }}
                      className="mt-4 px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-slate-100 text-xs tracking-wider font-medium border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.3)] transition cursor-pointer flex items-center gap-2"
                    >
                      <Camera size={14} /> Enable Camera
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COLUMN: TITLES, UPLOAD MATRIX, AND FEEDBACK */}
          <div className="flex-1 flex flex-col justify-between gap-4 w-full md:w-auto">
            {/* Header */}
            <div className="text-center md:text-left">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 uppercase inline-block mb-1.5">
                Celestial Mirror
              </span>
              <h2 className="text-lg md:text-xl font-sans font-medium tracking-tight text-slate-100">
                Provide Your Portrait
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
                Upload a clear photo or position your face under the alignment matrix to calibrate your node coordinates.
              </p>
            </div>

            {/* DRAG AND DROP ZONE */}
            <div
              id="drag-and-drop-portal"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerUploadClick}
              className={`w-full border-2 border-dashed ${
                dragActive
                  ? "border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] text-cyan-200"
                  : "border-slate-800 bg-slate-950/40 hover:bg-slate-900/40 hover:border-slate-700 hover:shadow-[0_0_10px_rgba(255,255,255,0.01)] text-slate-400"
              } rounded-2xl p-3 md:p-3.5 transition duration-350 cursor-pointer flex flex-col items-center justify-center text-center`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Upload size={18} className="text-cyan-500/70 mb-1.5 pointer-events-none group-hover:scale-110 transition" />
              <p className="text-xs font-sans tracking-wide pointer-events-none">
                <span className="text-cyan-400 font-semibold">Click to upload</span> or drag and drop your photo
              </p>
              <span className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-widest pointer-events-none">
                JPG, PNG, WebP up to 15MB
              </span>
            </div>

            {/* Help guidelines & error blocks */}
            <div className="space-y-2 mt-auto font-sans">
              {cameraError && (
                <div className="w-full flex items-start gap-2 bg-rose-950/30 border border-rose-900/50 rounded-xl p-2.5 text-[10px] text-rose-300">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              <div className="flex items-center justify-center md:justify-start gap-2 text-[9px] text-slate-500 tracking-wider uppercase">
                <Sparkles size={9} className="text-amber-500 shrink-0" />
                <span>Highest accuracy is achieved with direct, well-lit frontal portraits.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
