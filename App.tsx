
import React, { useState, useCallback, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Layout, 
  Sparkles, 
  Printer, 
  Trash2, 
  PlusCircle, 
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { ReportData } from './types';
import { enhanceReportContent } from './services/geminiService';
import ReportContent from './components/ReportContent';

const App: React.FC = () => {
  const [report, setReport] = useState<ReportData>({
    title: 'Hari Sukan Sekolah 2024',
    programDate: new Date().toISOString().split('T')[0],
    description: 'Hari kecemerlangan olahraga dan semangat sekolah di SK All Saints.',
    objective: 'Untuk mempromosikan kesihatan fizikal dan kerja berpasukan dalam kalangan pelajar.',
    impact: 'Peningkatan penyertaan pelajar dalam aktiviti luar.',
    images: [],
    layoutType: 'horizontal',
    themeColor: '#4f46e5' // Default indigo
  });

  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const randomizeColor = () => {
    // Generate a random vibrant but "lite" compatible color
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 70%, 50%)`;
    
    // Convert HSL to Hex (simple approximation for UI)
    const ctx = document.createElement('canvas').getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      setReport(prev => ({ ...prev, themeColor: ctx.fillStyle }));
    }
  };

  const extractColor = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('#4f46e5');
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        resolve(hex);
      };
      img.src = dataUrl;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        
        let newThemeColor = report.themeColor;
        if (report.images.length === 0) {
          newThemeColor = await extractColor(dataUrl);
        }

        setReport(prev => ({
          ...prev,
          images: [...prev.images, dataUrl],
          themeColor: newThemeColor
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReport(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        themeColor: newImages.length === 0 ? '#4f46e5' : prev.themeColor
      };
    });
  };

  const handleEnhance = async () => {
    if (!report.title || !report.description) return;
    setIsEnhancing(true);
    const result = await enhanceReportContent(report.title, report.description);
    if (result) {
      setReport(prev => ({
        ...prev,
        title: result.title,
        description: result.description,
        objective: result.objective,
        impact: result.impact
      }));
    }
    setIsEnhancing(false);
    return result;
  };

  const handlePrint = async () => {
    if (report.title && report.description) {
      setIsEnhancing(true);
      const result = await enhanceReportContent(report.title, report.description);
      if (result) {
        setReport(prev => ({
          ...prev,
          title: result.title,
          description: result.description,
          objective: result.objective,
          impact: result.impact
        }));
      }
      setIsEnhancing(false);
    }
    
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Editor Sidebar */}
      <div className="w-full md:w-1/3 bg-white border-r border-slate-200 p-6 overflow-y-auto no-print">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg" style={{ backgroundColor: report.themeColor }}>
              <FileText className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Pembina Laporan</h1>
          </div>
          <button 
            onClick={randomizeColor}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600"
            title="Warna Rawak"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tajuk Program</label>
            <input 
              type="text" 
              value={report.title}
              onChange={(e) => setReport({...report, title: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder="Masukkan tajuk program..."
            />
          </section>

          <section>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tarikh Program</label>
            <input 
              type="date" 
              value={report.programDate}
              onChange={(e) => setReport({...report, programDate: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </section>

          <section>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">Maklumat Program</label>
              <button 
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex items-center gap-1 text-xs font-bold hover:opacity-80 disabled:opacity-50"
                style={{ color: report.themeColor }}
              >
                <Sparkles size={14} />
                {isEnhancing ? 'MENAMBAH BAIK...' : 'GILAP AI'}
              </button>
            </div>
            <textarea 
              rows={4}
              value={report.description}
              onChange={(e) => setReport({...report, description: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
              placeholder="Huraikan secara ringkas mengenai program..."
            />
          </section>

          <section>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Gambar ({report.images.length})</label>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all"
               style={{ borderColor: report.images.length > 0 ? report.themeColor : undefined }}
             >
               <ImageIcon className="text-slate-400 mb-2" size={32} />
               <p className="text-sm text-slate-500 font-medium">Klik untuk muat naik 3+ foto</p>
               <input 
                 type="file" 
                 multiple 
                 accept="image/*" 
                 ref={fileInputRef} 
                 onChange={handleImageUpload} 
                 className="hidden" 
               />
             </div>
             
             {report.images.length > 0 && (
               <div className="grid grid-cols-4 gap-2 mt-4">
                 {report.images.map((img, idx) => (
                   <div key={idx} className="relative group aspect-square rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                     <img src={img} className="w-full h-full object-cover" />
                     <button 
                       onClick={() => removeImage(idx)}
                       className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <Trash2 className="text-white" size={16} />
                     </button>
                   </div>
                 ))}
               </div>
             )}
          </section>

          <section>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Susun Atur Gambar</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setReport({...report, layoutType: 'horizontal'})}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${report.layoutType === 'horizontal' ? 'text-white shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                style={report.layoutType === 'horizontal' ? { backgroundColor: report.themeColor, borderColor: report.themeColor } : {}}
              >
                <Layout size={18} />
                <span className="text-sm font-bold">Melintang</span>
              </button>
              <button 
                onClick={() => setReport({...report, layoutType: 'vertical'})}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${report.layoutType === 'vertical' ? 'text-white shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                style={report.layoutType === 'vertical' ? { backgroundColor: report.themeColor, borderColor: report.themeColor } : {}}
              >
                <div className="rotate-90"><Layout size={18} /></div>
                <span className="text-sm font-bold">Menegak</span>
              </button>
            </div>
          </section>

          <button 
            onClick={handlePrint}
            disabled={isEnhancing}
            className="w-full bg-slate-800 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isEnhancing ? (
              <>
                <Sparkles className="animate-pulse" size={20} />
                MEMURNIKAN KANDUNGAN...
              </>
            ) : (
              <>
                <Printer size={20} />
                CETAK LAPORAN
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-100 p-4 md:p-12 overflow-y-auto">
        <div className="mx-auto bg-white shadow-2xl overflow-hidden print:shadow-none" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>
          <ReportContent data={report} />
        </div>
      </div>
    </div>
  );
};

export default App;
