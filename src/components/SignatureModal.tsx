import React, { useRef, useState, useEffect } from 'react';
import { Edit3, Upload, Trash2, Check, X } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureSaved: (dataUrl: string) => void;
  title?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSignatureSaved,
  title = 'የባለመሳሪያው ዲጂታል ፊርማ (Digital Signature)',
}) => {
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedSrc, setUploadedSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mode === 'draw') {
      const timer = setTimeout(() => {
        initCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0F2864'; // Official dark blue ink
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasDrawn(false);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureSaved(dataUrl);
      onClose();
    } else if (mode === 'upload' && uploadedSrc) {
      onSignatureSaved(uploadedSrc);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-amber-400">{title}</h3>
            <p className="text-xs text-slate-400">
              በስክሪኑ ላይ ይፈርሙ ወይም የፊርማ ምስል ይጫኑ
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="mt-4 flex gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
              mode === 'draw'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Edit3 className="h-4 w-4" /> በእጅ/በጣት ፈርም
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
              mode === 'upload'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Upload className="h-4 w-4" /> የፊርማ ምስል ጫን
          </button>
        </div>

        {/* Canvas / Upload Area */}
        <div className="mt-4 flex flex-col items-center">
          {mode === 'draw' ? (
            <div className="w-full">
              <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/80 bg-white shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={180}
                  className="h-44 w-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-semibold text-slate-400">
                  የፊርማ መስመር ____________________
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">
                  ጣትን ወይም ማውዝን በመጠቀም እዚህ ሳጥን ውስጥ ይፈርሙ
                </span>
                <button
                  type="button"
                  onClick={initCanvas}
                  className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" /> አጥፋ
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {uploadedSrc ? (
                <div className="flex flex-col items-center">
                  <div className="h-44 w-full overflow-hidden rounded-xl border-2 border-amber-500/80 bg-white p-2 flex items-center justify-center">
                    <img
                      src={uploadedSrc}
                      alt="Uploaded Signature"
                      className="max-h-full max-w-full object-contain"
                    />
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
                    className="mt-2 text-xs text-amber-400 underline hover:text-amber-300"
                  >
                    ሌላ ፊርማ ምረጥ
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 p-6 transition hover:border-amber-500 hover:bg-slate-800"
                >
                  <Upload className="mb-2 h-8 w-8 text-amber-400" />
                  <p className="text-xs font-semibold text-slate-200">
                    የተፈረመበትን ወረቀት ፎቶ ወይም ስካን ይጫኑ
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ሰርዝ
          </button>
          <button
            type="button"
            disabled={mode === 'draw' ? !hasDrawn : !uploadedSrc}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-40"
          >
            <Check className="h-4 w-4" /> ፊርማውን መዝግብ
          </button>
        </div>
      </div>
    </div>
  );
};
