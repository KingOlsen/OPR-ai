
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
import { enhanceReportContent, detectFocalPoint } from './services/geminiService';
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
      const padding = 64; // Horizontal padding
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
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const newEntry: ImageEntry = { url: dataUrl, focalPoint: { x: 50, y: 50 }, isProcessing: true };
        const newIndex = report.images.length;

        setReport(prev => ({ ...prev, images: [...prev.images, newEntry] }));
        
        const focalPoint = await detectFocalPoint(dataUrl, file.type);
        setReport(prev => ({
          ...prev,
          images: prev.images.map((img, idx) => 
            idx === newIndex ? { ...img, focalPoint: focalPoint || { x: 50, y: 50 }, isProcessing: false } : img
          )
        }));
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

  const handleEnhance = async () => {
    if (!report.title || !report.description) return;
    setIsEnhancing(true);
    const result = await enhanceReportContent(report.title, report.description);
    if (result) {
      setReport(prev => ({ ...prev, ...result }));
    }
    setIsEnhancing(false);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    const element = reportRef.current;
    
    // Total A4 is 210mm x 297mm.
    // Setting margins to shift slightly left (e.g. 3mm left margin instead of 5mm+)
    const margins = [10, 3, 10, 7]; // [top, left, bottom, right] in mm
    const targetWidthMm = 210 - margins[1] - margins[3]; // 200mm width content
    const targetHeightMm = 297 - margins[0] - margins[2]; // 277mm height content

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
        windowHeight: heightPx
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: ['avoid-all'] }
    };

    try {
      const originalStyle = element.style.cssText;
      // Lock dimensions for capture to fit the calculated printable area
      element.style.width = `${targetWidthMm}mm`;
      element.style.height = `${targetHeightMm}mm`;
      element.style.position = 'relative';
      element.style.top = '0';
      element.style.left = '0';
      element.style.margin = '0';

      await window.html2pdf().set(opt).from(element).toPdf().save();
      
      element.style.cssText = originalStyle;
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Control Panel */}
      <div className="w-full md:w-[380px] bg-white border-r border-slate-200 p-6 overflow-y-auto no-print shadow-xl z-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: report.themeColor }}>
              <FileText className="text-white" size={24} />
            </div>
            <h1 className="text-lg font-black text-black tracking-tight uppercase">OPR GEN</h1>
          </div>
          <button onClick={randomizeColor} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <RefreshCw size={18} className="text-black" />
          </button>
        </div>

        <div className="space-y-5">
          <section>
            <label className="text-xs font-black uppercase tracking-wider text-black mb-2 block">Program</label>
            <input 
              type="text" 
              value={report.title}
              onChange={(e) => setReport({...report, title: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-black"
            />
          </section>

          <section>
            <label className="text-xs font-black uppercase tracking-wider text-black mb-2 block">Tarikh</label>
            <input 
              type="date" 
              value={report.programDate}
              onChange={(e) => setReport({...report, programDate: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-black font-bold"
            />
          </section>

          <section>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-black">Info</label>
              <button onClick={handleEnhance} disabled={isEnhancing} className="flex items-center gap-1 text-[10px] font-black" style={{ color: report.themeColor }}>
                <Sparkles size={12} /> {isEnhancing ? 'PENYUNTINGAN...' : 'MURNI AI'}
              </button>
            </div>
            <textarea 
              rows={3}
              value={report.description}
              onChange={(e) => setReport({...report, description: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none text-black font-bold"
            />
          </section>

          <section>
             <label className="text-xs font-black uppercase tracking-wider text-black mb-2 block">Media ({report.images.length})</label>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all"
             >
               <ImageIcon className="text-black mb-2" size={24} />
               <p className="text-[10px] text-black font-black uppercase">Tambah Gambar</p>
               <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
             </div>
             
             {report.images.length > 0 && (
               <div className="grid grid-cols-4 gap-2 mt-3">
                 {report.images.map((img, idx) => (
                   <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100 bg-slate-100">
                     <img 
                       src={img.url} 
                       className="w-full h-full object-cover" 
                       style={{ 
                        objectPosition: `${img.focalPoint?.x ?? 50}% ${img.focalPoint?.y ?? 50}%`,
                      }}
                     />
                     {img.isProcessing && (
                       <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                         <Loader2 className="animate-spin text-indigo-600" size={14} />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => openFocalPointEditor(idx)} 
                         className="p-1.5 bg-white text-black rounded-lg hover:bg-slate-100 shadow-lg"
                         title="Set Focal Point"
                       >
                         <Target size={14} />
                       </button>
                       <button 
                         onClick={() => removeImage(idx)} 
                         className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
                         title="Hapus"
                       >
                         <Trash2 size={14} />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </section>

          <section>
            <label className="text-xs font-black uppercase tracking-wider text-black mb-2 block">Layout</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setReport({...report, layoutType: 'horizontal'})}
                className={`flex-1 p-2 rounded-lg border text-xs font-black transition-all ${report.layoutType === 'horizontal' ? 'bg-black text-white' : 'bg-white text-black border-slate-200'}`}
              >
                MELINTANG
              </button>
              <button 
                onClick={() => setReport({...report, layoutType: 'vertical'})}
                className={`flex-1 p-2 rounded-lg border text-xs font-black transition-all ${report.layoutType === 'vertical' ? 'bg-black text-white' : 'bg-white text-black border-slate-200'}`}
              >
                MENEGAK
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-2 pt-4">
            <button 
              onClick={() => window.print()}
              className="w-full bg-slate-100 text-black p-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"
            >
              <Printer size={18} /> CETAK A4
            </button>
            
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="w-full text-white p-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: report.themeColor }}
            >
              {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              EXPORT PDF (A4)
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div 
        ref={containerRef}
        className="flex-1 p-4 md:p-8 overflow-auto flex justify-center bg-slate-200 items-start relative"
      >
        <div 
          className="bg-white shadow-2xl origin-top transition-transform duration-300 print:transform-none" 
          style={{ 
            width: '210mm', 
            height: '297mm', 
            minWidth: '210mm',
            transform: `scale(${previewScale})`,
            marginTop: previewScale < 1 ? '0' : '20px'
          }}
        >
          <div ref={reportRef} className="h-full w-full overflow-hidden">
            <ReportContent data={report} />
          </div>
        </div>

        {/* Focal Point Editor Modal */}
        {editingFocalPointIdx !== null && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-black">LARAS TITIK FOKUS</h3>
                <button onClick={() => setEditingFocalPointIdx(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                Klik pada gambar untuk menetapkan pusat perhatian
              </p>

              <div 
                ref={focalPointEditorRef}
                onClick={handleFocalPointClick}
                className="relative cursor-crosshair rounded-xl overflow-hidden bg-slate-200 aspect-video mb-6 border border-slate-100 group"
              >
                <img 
                  src={report.images[editingFocalPointIdx].url} 
                  className="w-full h-full object-contain pointer-events-none"
                  alt="Editor"
                />
                {tempFocalPoint && (
                  <div 
                    className="absolute w-10 h-10 border-2 border-white rounded-full flex items-center justify-center shadow-2xl -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none"
                    style={{ 
                      left: `${tempFocalPoint.x}%`, 
                      top: `${tempFocalPoint.y}%`,
                      backgroundColor: `${report.themeColor}40`
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                    <Target size={24} className="text-white absolute opacity-50" />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingFocalPointIdx(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  BATAL
                </button>
                <button 
                  onClick={saveFocalPoint}
                  className="flex-1 py-3 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all"
                  style={{ backgroundColor: report.themeColor }}
                >
                  <Check size={20} /> TETAPKAN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
