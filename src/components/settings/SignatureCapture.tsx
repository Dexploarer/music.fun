import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Save, Trash, Upload, Check, X } from 'lucide-react';

interface SignatureCaptureProps {
  value: string | null;
  onChange: (signature: string | null) => void;
  height?: number;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({ 
  value, 
  onChange,
  height = 200
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up canvas width based on container size
  useEffect(() => {
    if (containerRef.current) {
      const updateWidth = () => {
        if (containerRef.current) {
          setCanvasWidth(containerRef.current.offsetWidth);
        }
      };
      
      updateWidth();
      window.addEventListener('resize', updateWidth);
      
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, []);
  
  // Load saved signature if provided
  useEffect(() => {
    if (value && sigCanvas.current) {
      const image = new Image();
      image.onload = () => {
        if (sigCanvas.current) {
          const ctx = sigCanvas.current.getCanvas().getContext('2d');
          if (ctx) {
            ctx.drawImage(image, 0, 0);
            setIsEmpty(false);
          }
        }
      };
      image.src = value;
    }
  }, [value, canvasWidth]);

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
      onChange(null);
    }
  };

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL('image/png');
      onChange(dataURL);
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  };
  
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      if (result && sigCanvas.current) {
        const image = new Image();
        image.onload = () => {
          if (sigCanvas.current) {
            sigCanvas.current.clear();
            const canvas = sigCanvas.current.getCanvas();
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(
                image, 
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height
              );
              save();
            }
          }
        };
        image.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button 
            type="button"
            onClick={clear}
            className="rounded-lg bg-zinc-800 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700 focus:outline-none"
            title="Clear signature"
            disabled={isEmpty}
          >
            <Trash size={14} className="text-red-400" />
          </button>
          
          <label className="cursor-pointer rounded-lg bg-zinc-800 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700 focus:outline-none">
            <Upload size={14} className="text-amber-400" />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleUpload}
            />
          </label>
        </div>
        
        {!isEmpty && (
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Check size={12} className="text-green-500" />
            <span>Signature saved</span>
          </div>
        )}
      </div>
      
      <div className={`rounded-md border ${isEmpty ? 'border-zinc-700' : 'border-amber-600'} bg-white`}>
        {canvasWidth > 0 && (
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: canvasWidth,
              height: height,
              className: "signature-canvas"
            }}
            onEnd={() => save()}
          />
        )}
      </div>
      
      <p className="text-xs text-gray-400">
        Sign above using your mouse or touch screen, or upload an image of your signature.
      </p>
    </div>
  );
};

export default SignatureCapture;