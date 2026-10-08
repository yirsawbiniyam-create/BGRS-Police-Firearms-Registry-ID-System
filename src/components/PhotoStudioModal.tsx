import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sliders, Check, X, RefreshCw } from 'lucide-react';

interface PhotoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelected: (dataUrl: string) => void;
  currentPhoto?: string;
}

export const PhotoStudioModal: React.FC<PhotoStudioModalProps> = ({
  isOpen,
  onClose,
  onPhotoSelected,
  currentPhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [previewSrc, setPreviewSrc] = useState<string>(currentPhoto || '');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentPhoto) {
      setPreviewSrc(currentPhoto);
    }
  }, [currentPhoto]);

  // Clean up camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 853 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.error('Camera error', err);
      setCameraError('ካሜራ መክፈት አልተቻለም፡፡ እባክዎ የካሜራ ፈቃድ ይስጡ ወይም ፎቶ ይጫኑ፡፡');
      setIsCameraActive(false);
    }
  };

  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    // Ensure 3x4 ratio: e.g. 600 x 800
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crop center 3:4 from video
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    const targetRatio = 3 / 4;
    let sWidth = videoWidth;
    let sHeight = videoWidth / targetRatio;

    if (sHeight > videoHeight) {
      sHeight = videoHeight;
      sWidth = videoHeight * targetRatio;
    }

    const sx = (videoWidth - sWidth) / 2;
    const sy = (videoHeight - sHeight) / 2;

    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, 600, 800);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPreviewSrc(dataUrl);
    stopCamera();
    setActiveTab('upload');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Automatically crop to standard 3:4 passport ratio
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetRatio = 3 / 4;
        let sWidth = img.width;
        let sHeight = img.width / targetRatio;

        if (sHeight > img.height) {
          sHeight = img.height;
          sWidth = img.height * targetRatio;
        }

        const sx = (img.width - sWidth) / 2;
        const sy = (img.height - sHeight) / 2;

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 600, 800);
        setPreviewSrc(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyAdjustmentsAndSave = () => {
    if (!previewSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply brightness & contrast filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0, 600, 800);

      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onPhotoSelected(finalDataUrl);
      onClose();
    };
    img.src = previewSrc;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-amber-400">
              የባለመሳሪያው ጉርድ ፎቶ (3x4 Passport Photo)
            </h3>
            <p className="text-xs text-slate-400">
              ፎቶ ከጋለሪ ይጫኑ ወይም በካሜራ ያንሱ (ብሩህነትና ንፅፅርን በራስ-ሰር ያስተካክላል)
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="mt-4 flex gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
              activeTab === 'upload'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Upload className="h-4 w-4" />
            ከፋይል / ጋለሪ ጫን
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
              activeTab === 'camera'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Camera className="h-4 w-4" />
            በካሜራ አንሳ
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 flex flex-col items-center">
          {activeTab === 'camera' ? (
            <div className="relative w-full overflow-hidden rounded-xl bg-black">
              {cameraError ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-rose-400">
                  <p className="text-sm font-medium">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                  >
                    <RefreshCw className="h-4 w-4" /> እንደገና ሞክር
                  </button>
                </div>
              ) : (
                <div className="relative flex flex-col items-center">
                  <div className="relative h-72 w-54 overflow-hidden rounded-lg border-2 border-dashed border-amber-400/80">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-44 w-34 rounded-full border border-amber-400/40"></div>
                    </div>
                  </div>
                  <button
                    onClick={handleCaptureFromCamera}
                    className="mt-4 mb-2 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950 shadow-lg hover:bg-amber-400"
                  >
                    <Camera className="h-5 w-5" /> ፎቶ አንሳ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex w-full flex-col items-center">
              {previewSrc ? (
                <div className="flex flex-col items-center">
                  <div className="relative h-64 w-48 overflow-hidden rounded-lg border-2 border-amber-500/80 bg-slate-800 shadow-xl">
                    <img
                      src={previewSrc}
                      alt="Preview"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      }}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                      3x4 ምጥጥን
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 text-xs text-amber-400 underline hover:text-amber-300"
                  >
                    ሌላ ፎቶ ምረጥ
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 p-6 transition hover:border-amber-500 hover:bg-slate-800"
                >
                  <Upload className="mb-2 h-10 w-10 text-amber-400" />
                  <p className="text-sm font-semibold text-slate-200">
                    ፎቶ ለመጫን እዚህ ይጫኑ
                  </p>
                  <p className="text-xs text-slate-400">JPG, PNG ወይም WEBP ቅርጸት</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Adjustments: Brightness & Contrast */}
              {previewSrc && (
                <div className="mt-4 w-full rounded-xl bg-slate-800/80 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
                    <Sliders className="h-3.5 w-3.5" />
                    የፎቶ ጥራት ማስተካከያ (Brightness & Contrast)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>ብሩህነት (Brightness)</span>
                        <span>{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="160"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>ንፅፅር (Contrast)</span>
                        <span>{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="160"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ሰርዝ
          </button>
          <button
            type="button"
            disabled={!previewSrc}
            onClick={applyAdjustmentsAndSave}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-40"
          >
            <Check className="h-4 w-4" /> ፎቶውን አጽድቅ
          </button>
        </div>
      </div>
    </div>
  );
};
