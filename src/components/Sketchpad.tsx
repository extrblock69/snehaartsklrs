import { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Paintbrush, Eraser, Trash2, Download, Send, CheckCircle, Sparkles } from 'lucide-react';

interface ToolType {
  id: string;
  name: string;
  color: string;
  defaultSize: number;
  defaultOpacity: number;
  description: string;
}

const TOOLS: ToolType[] = [
  { id: '2h-pencil', name: '2H Pencil', color: '#9c9a96', defaultSize: 2, defaultOpacity: 0.45, description: 'Fine, hard graphite for initial proportion block-in' },
  { id: '2b-pencil', name: '2B Pencil', color: '#545351', defaultSize: 4, defaultOpacity: 0.8, description: 'Soft, standard graphite for initial structural shaded details' },
  { id: '6b-pencil', name: '6B Matte', color: '#2b2a29', defaultSize: 8, defaultOpacity: 0.95, description: 'Ultra-soft dark graphite for deep, organic texture shading' },
  { id: 'charcoal', name: 'Willow Charcoal', color: '#121211', defaultSize: 20, defaultOpacity: 0.7, description: 'Coarse vine charcoal stick for massing fast volumetric tones' },
  { id: 'sepia-ink', name: 'Sepia Ink', color: '#4a3020', defaultSize: 3, defaultOpacity: 1.0, description: 'Calligraphy steel pen nib with fluid iron gall ink' },
];

const TEACHER_COMMENTS = [
  "Remarkable effort! Your cross-contour lines are establishing a rich three-dimensional weight. Observe the specular highlights and ensure they match your light source vector.",
  "Excellent proportion block-in. To take this sketch to the next stage, grab the 6B matte pencil and establish deeper core values along the terminator shadow boundaries.",
  "Your negative spaces display excellent sensitivity! Watch for the tangent lines along the borders—let them fade into the background tissue layer to secure atmospheric depth.",
  "Beautiful mark-making. You are letting your hand trace the organic shape of the form with exquisite honesty. Try softening the transition edges with some willow shading!"
];

export default function Sketchpad() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Brush States
  const [selectedTool, setSelectedTool] = useState<ToolType>(TOOLS[1]); // DEFAULT 2B Pencil
  const [brushSize, setBrushSize] = useState<number>(4);
  const [brushOpacity, setBrushOpacity] = useState<number>(0.8);
  const [isEraserMode, setIsEraserMode] = useState(false);

  // Simulation Feedback states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use parent bounding box dimensions to prevent canvas resolution mismatch
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; // high DPI scale
    canvas.height = 420 * 2;
    canvas.style.width = '100%';
    canvas.style.height = '420px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Set natural textured paper base
    ctx.fillStyle = '#fbfaf8';
    ctx.fillRect(0, 0, rect.width, 420);

    // Subtle paper grain simulation
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * 420;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
      ctx.fillRect(x, y, 1, 1);
    }

    contextRef.current = ctx;
  }, []);

  // Update line properties whenever tool/brush details change
  useEffect(() => {
    if (!contextRef.current) return;
    
    if (isEraserMode) {
      contextRef.current.strokeStyle = '#fbfaf8'; // match paper background
    } else {
      contextRef.current.strokeStyle = selectedTool.color;
    }
    
    contextRef.current.lineWidth = brushSize;
    contextRef.current.globalAlpha = brushOpacity;
  }, [selectedTool, brushSize, brushOpacity, isEraserMode]);

  // Adjust brush specifications when changing tools
  const handleSelectTool = (tool: ToolType) => {
    setIsEraserMode(false);
    setSelectedTool(tool);
    setBrushSize(tool.defaultSize);
    setBrushOpacity(tool.defaultOpacity);
  };

  const handleSelectEraser = () => {
    setIsEraserMode(true);
    setBrushSize(16);
    setBrushOpacity(1.0);
  };

  // Draw Operations
  const startDrawing = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in event) {
      // Touch Event
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // Mouse Event
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    event.preventDefault();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  // Canvas Actions
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset background
    ctx.fillStyle = '#fbfaf8';
    ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);

    // Paper grain
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * (canvas.width / 2);
      const y = Math.random() * (canvas.height / 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
      ctx.fillRect(x, y, 1, 1);
    }

    setEvaluationFeedback(null);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'sneha_sketch_academy.png';
    link.href = dataURL;
    link.click();
  };

  const submitForEvaluation = () => {
    setIsEvaluating(true);
    setEvaluationFeedback(null);

    // Simulate high-craft pedagogical review
    setTimeout(() => {
      setIsEvaluating(false);
      const randomFeedback = TEACHER_COMMENTS[Math.floor(Math.random() * TEACHER_COMMENTS.length)];
      setEvaluationFeedback(randomFeedback);
      setShowSubmissionSuccess(true);
      setTimeout(() => setShowSubmissionSuccess(false), 3000);
    }, 1800);
  };

  return (
    <section
      id="sketchpad"
      className="py-24 bg-stone-100 dark:bg-stone-900 border-t border-stone-200/50 dark:border-stone-800/50 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Title details */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="font-mono text-xs text-wood font-semibold tracking-widest uppercase block">
            SKETCHPAD ACADEMY
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 dark:text-stone-100 tracking-tight">
            The Interactive Practice Board
          </h2>
          <div className="h-[1px] w-12 bg-wood mx-auto" />
          <p className="text-stone-500 dark:text-stone-400 font-light text-sm">
            Grab a digital instrument and experience Sneha's charcoal/graphite medium controls. 
            Sketch a simple object, adjust stroke values, and submit your artwork to Sneha for diagnostic evaluation!
          </p>
        </div>

        {/* Master drawing block board layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Controls Tool Drawer (4 cols) */}
          <div className="lg:col-span-4 bg-stone-50 dark:bg-stone-950 p-6 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-col justify-between text-left">
            <div className="space-y-6">
              <h3 className="font-mono text-xs tracking-wider uppercase text-stone-400 dark:text-stone-500 font-bold">
                SELECT MEDIUM INSTRUMENT
              </h3>

              {/* Tools row list */}
              <div className="space-y-3">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelectTool(tool)}
                    className={`w-full p-3 rounded border text-left flex items-center justify-between cursor-pointer transition-all ${
                      selectedTool.id === tool.id && !isEraserMode
                        ? 'bg-stone-150 dark:bg-stone-900 border-stone-950 dark:border-stone-50 font-semibold ring-1 ring-stone-950/10'
                        : 'bg-stone-100/50 dark:bg-stone-930 border-stone-200/80 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Graphite Swatch dot indicator */}
                      <span
                        className="w-4 h-4 rounded-full border border-stone-300 dark:border-stone-700"
                        style={{ backgroundColor: tool.color }}
                      />
                      <div>
                        <p className="text-sm text-stone-900 dark:text-stone-100 leading-none">
                          {tool.name}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1 uppercase font-mono tracking-wide">
                          {tool.id === 'charcoal' ? 'Soft Willow' : 'Fine Carbon'}
                        </p>
                      </div>
                    </div>
                    {/* Brush Size Indicator Badge */}
                    <span className="font-mono text-[10px] text-stone-450 dark:text-stone-500">
                      Ø {tool.defaultSize}px
                    </span>
                  </button>
                ))}

                {/* Eraser Button */}
                <button
                  onClick={handleSelectEraser}
                  className={`w-full p-3 rounded border text-left flex items-center justify-between cursor-pointer transition-all ${
                    isEraserMode
                      ? 'bg-stone-150 dark:bg-stone-900 border-stone-950 dark:border-stone-50 font-bold ring-1 ring-stone-950/10'
                      : 'bg-stone-100/50 dark:bg-stone-930 border-stone-200/80 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3 text-stone-900 dark:text-stone-100">
                    <Eraser className="w-4 h-4 text-stone-800 dark:text-stone-250" />
                    <div>
                      <p className="text-sm font-semibold leading-none">Kneaded Rubber</p>
                      <p className="text-[10px] text-stone-400 mt-1 uppercase font-mono tracking-wide">Lift Charcoal highlights</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-stone-450">Ø Eraser</span>
                </button>
              </div>

              {/* Sliders for details adjustment */}
              <div className="h-[1px] bg-stone-200 dark:bg-stone-850" />

              <div className="space-y-4">
                {/* Size slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-medium text-stone-500 tracking-wide uppercase">Stroke Weight</span>
                    <span className="font-mono text-stone-800 dark:text-stone-200">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-stone-950 dark:accent-stone-50 h-1 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Opacity slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-medium text-stone-500 tracking-wide uppercase">Medium Density</span>
                    <span className="font-mono text-stone-800 dark:text-stone-200">{Math.round(brushOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={brushOpacity * 100}
                    onChange={(e) => setBrushOpacity(parseInt(e.target.value) / 100)}
                    disabled={isEraserMode}
                    className="w-full accent-stone-950 dark:accent-stone-50 h-1 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-pointer disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* General Tool Explanation block */}
            <div className="mt-8 p-3 bg-stone-200/50 dark:bg-stone-900 border border-stone-250 dark:border-stone-850 rounded text-xs text-stone-500 dark:text-stone-400 space-y-1">
              <span className="font-sans font-bold text-stone-800 dark:text-stone-200 block uppercase text-[10px] tracking-wider">
                {isEraserMode ? 'Eraser Tool Selected' : `${selectedTool.name} Detail`}
              </span>
              <p className="italic leading-relaxed font-serif text-stone-650 dark:text-stone-400 text-xs">
                {isEraserMode ? 'Simulating the traditional artistic process of picking graphite fragments off raw wood pulp paper.' : selectedTool.description}
              </p>
            </div>
          </div>

          {/* Column 2: Drawing Canvas Frame (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="relative bg-stone-150 p-4 pb-8 rounded-lg border border-stone-250 shadow-inner group flex-grow flex flex-col">
              
              {/* Decorative paper tape on corners mimicking a real physical setup */}
              <div className="absolute top-2 left-2 w-14 h-4 bg-stone-200 opacity-80 border-b border-r border-stone-300 rotate-[-4deg] pointer-events-none shadow-sm z-10" />
              <div className="absolute top-2 right-2 w-14 h-4 bg-stone-200 opacity-80 border-b border-l border-stone-300 rotate-[3deg] pointer-events-none shadow-sm z-10" />
              <div className="absolute bottom-2 left-2 w-14 h-4 bg-stone-200 opacity-80 border-t border-r border-stone-300 rotate-[3deg] pointer-events-none shadow-sm z-10" />
              <div className="absolute bottom-2 right-2 w-14 h-4 bg-stone-200 opacity-80 border-t border-l border-stone-300 rotate-[-5deg] pointer-events-none shadow-sm z-10" />

              {/* Canvas header status */}
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 tracking-widest uppercase mb-2 px-1 relative z-10">
                <span>CANVAS DIMENSION: 100% COTTON PAPER STUDIOS</span>
                <span>STATE: ACTIVE DRAFT</span>
              </div>

              {/* The Actual HTML5 Drawing Canvas element */}
              <div className="relative border border-stone-250 bg-stone-50 overflow-hidden rounded shadow flex-grow flex items-stretch">
                <canvas
                  id="drawing-canvas"
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair block"
                />
              </div>

              {/* Action Toolbar directly underneath canvas */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 relative z-10 px-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearCanvas}
                    className="p-2 border border-stone-300 hover:border-red-400 bg-stone-50 dark:bg-stone-900 text-stone-600 hover:text-red-500 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Paper</span>
                  </button>
                  <button
                    onClick={downloadDrawing}
                    className="p-2 border border-stone-300 hover:border-stone-500 bg-stone-50 dark:bg-stone-900 text-stone-600 hover:text-stone-900 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={submitForEvaluation}
                    disabled={isEvaluating}
                    className="px-4 py-2 bg-stone-950 hover:bg-stone-900 disabled:bg-stone-800 text-white dark:text-stone-950 dark:bg-stone-50 dark:hover:bg-white text-xs font-mono font-bold tracking-widest uppercase rounded-lg flex items-center gap-2 transition-all duration-300 shadow cursor-pointer text-center"
                  >
                    {isEvaluating ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Sneha Is Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit for Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Diagnostic Evaluation panel overlay */}
            <AnimatePresence>
              {(evaluationFeedback || isEvaluating) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-350 dark:border-stone-700 bg-stone-150 flex-shrink-0 mt-0.5">
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
                        alt="Sneha Avatar"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-stone-900 dark:text-stone-50 text-sm">
                          Sneha &bull; <span className="font-mono font-light text-xs text-stone-400">INSTRUCTOR CORRECTION</span>
                        </span>
                        
                        {showSubmissionSuccess && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-650 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 px-2.5 py-0.5 rounded font-mono font-medium flex items-center gap-1 uppercase">
                            <CheckCircle className="w-3 h-3" /> Submitted
                          </span>
                        )}
                      </div>

                      {isEvaluating ? (
                        <div className="space-y-2">
                          <div className="h-3.5 w-11/12 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                          <div className="h-3.5 w-8/12 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                        </div>
                      ) : (
                        <p className="text-stone-650 dark:text-stone-300 text-sm italic font-serif leading-relaxed pr-2">
                          "{evaluationFeedback}"
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </section>
  );
}
