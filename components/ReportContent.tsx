
import React from 'react';
import { ReportData } from '../types';
import { Target, TrendingUp, Calendar, MapPin, Award, Image as ImageIcon, Sparkles } from 'lucide-react';

interface Props {
  data: ReportData;
}

const ReportContent: React.FC<Props> = ({ data }) => {
  const theme = data.themeColor || '#4f46e5';
  
  const formattedDate = new Date(data.programDate).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const secondaryText = '#475569'; 
  const primaryText = '#1e293b';

  const imageCount = data.images.length;
  const displayImages = data.images.slice(0, 6);
  
  let gridCols = 'grid-cols-2';
  let imgHeight = 'h-56';

  if (data.layoutType === 'horizontal') {
    if (imageCount <= 2) {
      gridCols = 'grid-cols-2';
      imgHeight = 'h-80'; 
    } else if (imageCount === 3) {
      gridCols = 'grid-cols-3';
      imgHeight = 'h-64'; 
    } else if (imageCount === 4) {
      gridCols = 'grid-cols-2';
      imgHeight = 'h-56'; 
    } else {
      gridCols = 'grid-cols-3';
      imgHeight = 'h-48'; 
    }
  } else {
    gridCols = 'grid-cols-1 max-w-md mx-auto';
    imgHeight = imageCount > 3 ? 'h-48' : 'h-72'; 
  }

  return (
    <div 
      className="h-[297mm] w-[210mm] flex flex-col p-6 rounded-sm shadow-inner relative overflow-hidden bg-white"
      style={{ 
        background: `linear-gradient(135deg, ${theme}10 0%, #ffffff 50%, ${theme}05 100%)`,
        color: primaryText,
      }}
    >
      <div 
        className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-[0.1]"
        style={{ backgroundColor: theme }}
      ></div>

      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        <header className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold tracking-tighter text-slate-900 leading-tight">SK ALL SAINTS</h2>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5" style={{ color: secondaryText }}>
              <MapPin size={10} style={{ color: theme }} /> Kamunting, Perak
            </p>
          </div>
          <div className="bg-white p-1.5 rounded-xl border border-slate-50 shadow-sm">
            <Award style={{ color: theme }} size={20} />
          </div>
        </header>

        <div className="mb-6 text-center shrink-0">
          <h1 className="text-4xl font-black leading-tight mb-2 uppercase italic tracking-tighter" style={{ color: primaryText }}>
            {data.title || "TAJUK PROGRAM"}
          </h1>
          <div 
            className="inline-flex items-center gap-2 bg-white border border-slate-100 px-4 py-1 rounded-full font-bold text-[10px] shadow-sm"
            style={{ color: secondaryText }}
          >
            <Calendar size={12} style={{ color: theme }} />
            {formattedDate}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 shrink-0">
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-[1.5rem] border border-slate-50 flex flex-col justify-center shadow-sm">
            <h3 className="font-black text-[8px] uppercase tracking-[0.3em] mb-2" style={{ color: theme }}>Ringkasan Eksekutif</h3>
            <p className="text-base leading-snug font-medium italic text-slate-700">
              "{data.description}"
            </p>
          </div>

          <div className="space-y-3 flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border bg-white border-slate-50 shadow-sm">
                <Target style={{ color: theme }} size={18} />
              </div>
              <div>
                <h4 className="font-black text-[8px] uppercase tracking-widest text-slate-400">Objektif Utama</h4>
                <p className="font-bold text-sm" style={{ color: primaryText }}>{data.objective}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border bg-white border-slate-50 shadow-sm">
                <TrendingUp className="text-emerald-500" size={18} />
              </div>
              <div>
                <h4 className="font-black text-[8px] uppercase tracking-widest text-slate-400">Impak Utama</h4>
                <p className="font-bold text-sm" style={{ color: primaryText }}>{data.impact}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-100"></div>
            <h3 className="text-[8px] font-black uppercase tracking-[0.4em] whitespace-nowrap" style={{ color: secondaryText }}>Galeri Fokus AI</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-100"></div>
          </div>
          
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            {displayImages.length === 0 ? (
              <div className="w-full h-full max-h-64 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300">
                <ImageIcon size={32} className="mb-2 opacity-50" style={{ color: theme }} />
                <p className="text-[10px] font-black uppercase tracking-widest">Sila muat naik foto</p>
              </div>
            ) : (
              <div className={`w-full grid gap-4 ${gridCols}`}>
                {displayImages.map((img, idx) => {
                  const x = img.focalPoint?.x ?? 50;
                  const y = img.focalPoint?.y ?? 50;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`relative overflow-hidden rounded-2xl shadow-md border border-slate-50 transition-all ${imgHeight}`}
                    >
                      <img 
                        src={img.url} 
                        className="w-full h-full object-cover transition-transform duration-1000" 
                        style={{ 
                          objectPosition: `${x}% ${y}%`,
                          transform: 'scale(1.2)' 
                        }}
                        alt={`Gallery item ${idx + 1}`} 
                      />
                      <div className="absolute top-2 left-2 bg-white/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[7px] font-bold uppercase tracking-tighter shadow-sm flex items-center gap-1">
                        <Sparkles size={8} className="text-indigo-600" /> AI-Focus {idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <footer className="mt-auto pt-4 border-t border-slate-100 shrink-0">
          <div className="flex justify-between items-end">
            <div className="max-w-xs">
              <p className="text-[8px] font-black uppercase mb-4 tracking-[0.2em]" style={{ color: secondaryText }}>Disediakan Oleh</p>
              <div className="h-0.5 w-24 bg-slate-900/10 mb-1.5"></div>
              <p className="text-xs font-black" style={{ color: primaryText }}>PENYELARAS PROGRAM</p>
              <p className="text-[8px] font-bold uppercase opacity-60" style={{ color: secondaryText }}>SK All Saints · Perak</p>
            </div>
            <div className="text-right">
              <p className="text-[7px] font-medium italic opacity-30">Laporan dijana secara digital &copy; 2024</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReportContent;
