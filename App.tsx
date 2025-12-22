
import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Layout, 
  Sparkles, 
  Printer, 
  Trash2, 
  RefreshCw,
  Loader2,
  Download,
  Target,
  Check,
  X
} from 'lucide-react';
import { ReportData, ImageEntry } from './types';
import { enhanceReportContent } from './services/geminiService';
import ReportContent from './components/ReportContent';

declare global {
  interface Window {
    html2pdf: any;
  }
}

const App: React.FC = () => {
  const [report, setReport] = useState<ReportData>({
    title: 'Hari Sukan Sekolah 2024',
    programDate: new Date().toISOString().split('T')[0],
    description: 'Hari kecemerlangan olahraga dan semangat sekolah di SK All Saints.',
    objective: 'Untuk mempromosikan kesihatan fizikal dan kerja berpasukan dalam kalangan pelajar.',
    impact: 'Peningkatan penyertaan pelajar dalam aktiviti luar.',
    images: [],
    layoutType: 'horizontal',
    themeColor: '#4f46e5'
  });

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [editingFocalPointIdx, setEditingFocalPointIdx] = useState<number | null>(null);
  const [tempFocalPoint, setTempFocalPoint] = useState<{x: number, y: number} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const focalPointEditorRef = useRef<HTMLDivElement>(null);

  // Responsive scaling for the preview
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const targetWidth = 210 * 3.78; // 210mm in pixels roughly at 96dpi
      const padding = 48; // Horizontal padding
      if (containerWidth < targetWidth + padding) {
        setPreviewScale((containerWidth - padding) / targetWidth);
      } else {
        setPreviewScale(1);
      }
    };

    window.addEventListener('resize', updateScale);
    updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const randomizeColor = () => {
    const hue = Math.floor(Math.random() * 360);
    setReport(prev => ({ ...prev, themeColor: `hsl(${hue}, 70%, 50%)` }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const newEntry: ImageEntry = { 
          url: dataUrl, 
          focalPoint: { x: 50, y: 50 }, 
          isProcessing: false 
        };
        setReport(prev => ({ ...prev, images: [...prev.images, newEntry] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReport(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const openFocalPointEditor = (index: number) => {
    setEditingFocalPointIdx(index);
    setTempFocalPoint(report.images[index].focalPoint || { x: 50, y: 50 });
  };

  const handleFocalPointClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!focalPointEditorRef.current) return;
    const rect = focalPointEditorRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTempFocalPoint({ x, y });
  };

  const saveFocalPoint = () => {
    if (editingFocalPointIdx !== null && tempFocalPoint) {
      const newImages = [...report.images];
      newImages[editingFocalPointIdx] = {
        ...newImages[editingFocalPointIdx],
        focalPoint: tempFocalPoint
      };
      setReport({ ...report, images: newImages });
    }
    setEditingFocalPointIdx(null);
    setTempFocalPoint(null);
  };

  const performAIContentEnhancement = async () => {
    if (!report.title || !report.description) return false;
    setIsEnhancing(true);
    const result = await enhanceReportContent(report.title, report.description);
    if (result) {
      setReport(prev => ({ ...prev, ...result }));
      setIsEnhancing(false);
      return true;
    }
    setIsEnhancing(false);
    return false;
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    // Murni AI function is now disabled for automatic triggers as requested
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    // Murni AI function is now disabled for automatic triggers as requested
    
    const element = reportRef.current;
    const margins = [10, 3, 10, 7]; // [top, left, bottom, right] in mm
    const targetWidthMm = 210 - margins[1] - margins[3]; 
    const targetHeightMm = 297 - margins[0] - margins[2]; 

    const widthPx = Math.floor(targetWidthMm * 3.7795);
    const heightPx = Math.floor(targetHeightMm * 3.7795);

    const opt = {
      margin: margins,
      filename: `Laporan_A4_SK_ALL_SAINTS_${report.title.replace(/\s+/g, '_') || 'Digital'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2.0, 
        useCORS: true,
        letterRendering: true,
        width: widthPx,
        height: heightPx, 
        scrollY: 0,
        scrollX: 0,
        windowWidth: widthPx,
        windowHeight: heightPx,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: 'avoid-all' }
    };

    try {
      const originalStyle = element.style.cssText;
      element.style.width = `${targetWidthMm}mm`;
      element.style.height = `${targetHeightMm}mm`;
      element.style.maxHeight = `${targetHeightMm}mm`;
      element.style.minHeight = `${targetHeightMm}mm`;
      element.style.position = 'relative';
      element.style.top = '0';
      element.style.left = '0';
      element.style.margin = '0';
      element.style.overflow = 'hidden'; 
      element.style.boxSizing = 'border-box';

      const worker = window.html2pdf().set(opt).from(element).toPdf();
      await worker.save();
      
      element.style.cssText = originalStyle;
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 p-0 md:p-4">
      {/* App Container - Tablet Sized (1024px) */}
      <div className="w-full max-w-[1024px] h-screen md:h-[90vh] flex flex-col md:flex-row bg-white shadow-2xl overflow-hidden md:rounded-[2.5rem] border border-slate-300">
        
        {/* Control Panel (Sidebar) */}
        <div className="w-full md:w-[320px] bg-white border-r border-slate-100 p-6 overflow-y-auto no-print flex-shrink-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl" style={{ backgroundColor: report.themeColor }}>
                <FileText className="text-white" size={20} />
              </div>
              <h1 className="text-base font-black text-black tracking-tight uppercase">OPR GEN</h1>
            </div>
            <button onClick={randomizeColor} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <RefreshCw size={16} className="text-black" />
            </button>
          </div>

          <div className="space-y-4">
            <section>
              <label className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1.5 block">Program</label>
              <input 
                type="text" 
                value={report.title}
                onChange={(e) => setReport({...report, title: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-black text-sm"
              />
            </section>

            <section>
              <label className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1.5 block">Tarikh</label>
              <input 
                type="date" 
                value={report.programDate}
                onChange={(e) => setReport({...report, programDate: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-black font-bold text-sm"
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-black/40">Info</label>
                <button 
                  onClick={performAIContentEnhancement} 
                  disabled={isEnhancing} 
                  className="flex items-center gap-1 text-[10px] font-black hover:opacity-80 transition-opacity" 
                  style={{ color: report.themeColor }}
                >
                  <Sparkles size={12} /> {isEnhancing ? 'PENYUNTINGAN...' : 'MURNI AI'}
                </button>
              </div>
              <textarea 
                rows={3}
                value={report.description}
                onChange={(e) => setReport({...report, description: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none text-black font-bold leading-relaxed"
              />
            </section>

            <section>
               <label className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1.5 block">Media ({report.images.length})</label>
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all bg-slate-50/50"
               >
                 <ImageIcon className="text-black mb-1.5" size={20} />
                 <p className="text-[9px] text-black font-black uppercase">Tambah Gambar</p>
                 <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
               </div>
               
               {report.images.length > 0 && (
                 <div className="grid grid-cols-4 gap-2 mt-3">
                   {report.images.map((img, idx) => (
                     <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100 bg-slate-100 shadow-sm">
                       <img 
                         src={img.url} 
                         className="w-full h-full object-cover" 
                         style={{ 
                          objectPosition: `${img.focalPoint?.x ?? 50}% ${img.focalPoint?.y ?? 50}%`,
                        }}
                       />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openFocalPointEditor(idx)} className="p-1 bg-white text-black rounded-md shadow-lg"><Target size={12} /></button>
                         <button onClick={() => removeImage(idx)} className="p-1 bg-red-500 text-white rounded-md shadow-lg"><Trash2 size={12} /></button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </section>

            <section>
              <label className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1.5 block">Layout</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setReport({...report, layoutType: 'horizontal'})}
                  className={`flex-1 py-2 px-1 rounded-lg border text-[9px] font-black transition-all ${report.layoutType === 'horizontal' ? 'bg-black text-white border-black' : 'bg-white text-black border-slate-200'}`}
                >
                  MELINTANG
                </button>
                <button 
                  onClick={() => setReport({...report, layoutType: 'vertical'})}
                  className={`flex-1 py-2 px-1 rounded-lg border text-[9px] font-black transition-all ${report.layoutType === 'vertical' ? 'bg-black text-white border-black' : 'bg-white text-black border-slate-200'}`}
                >
                  MENEGAK
                </button>
              </div>
            </section>

            <div className="flex flex-col gap-2 pt-4">
              <button 
                onClick={handlePrint}
                disabled={isPrinting || isEnhancing}
                className="w-full bg-slate-100 text-black p-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200 disabled:opacity-50"
              >
                {isPrinting ? <Loader2 className="animate-spin" size={16} /> : <Printer size={16} />}
                JANA OPR
              </button>
              
              <button 
                onClick={handleExportPDF}
                disabled={isExporting || isEnhancing}
                className="w-full text-white p-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: report.themeColor }}
              >
                {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                EXPORT PDF (A4)
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area (Tablet Content View) */}
        <div 
          ref={containerRef}
          className="flex-1 p-4 md:p-6 overflow-auto flex justify-center bg-slate-50 items-start relative border-l border-slate-50"
        >
          <div 
            className="bg-white shadow-xl origin-top transition-transform duration-300 print:transform-none border border-slate-100" 
            style={{ 
              width: '210mm', 
              height: '297mm', 
              minWidth: '210mm',
              transform: `scale(${previewScale})`,
            }}
          >
            <div ref={reportRef} className="h-full w-full overflow-hidden">
              <ReportContent data={report} />
            </div>
          </div>

          {/* Focal Point Editor Modal */}
          {editingFocalPointIdx !== null && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-black text-black">LARAS TITIK FOKUS</h3>
                  <button onClick={() => setEditingFocalPointIdx(null)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>
                
                <div 
                  ref={focalPointEditorRef}
                  onClick={handleFocalPointClick}
                  className="relative cursor-crosshair rounded-2xl overflow-hidden bg-slate-100 aspect-video mb-6 border border-slate-200 group"
                >
                  <img 
                    src={report.images[editingFocalPointIdx].url} 
                    className="w-full h-full object-contain pointer-events-none"
                    alt="Editor"
                  />
                  {tempFocalPoint && (
                    <div 
                      className="absolute w-8 h-8 border-2 border-white rounded-full flex items-center justify-center shadow-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ 
                        left: `${tempFocalPoint.x}%`, 
                        top: `${tempFocalPoint.y}%`,
                        backgroundColor: `${report.themeColor}60`
                      }}
                    >
                      <div className="w-1 h-1 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingFocalPointIdx(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                  >
                    BATAL
                  </button>
                  <button 
                    onClick={saveFocalPoint}
                    className="flex-1 py-3 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                    style={{ backgroundColor: report.themeColor }}
                  >
                    <Check size={16} /> TETAPKAN
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
