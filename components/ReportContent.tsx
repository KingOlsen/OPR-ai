
import React from 'react';
import { ReportData } from '../types';
import { Target, TrendingUp, Calendar, MapPin, Award, Image as ImageIcon } from 'lucide-react';

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
  
  // Dynamic grid columns based on layout and image count
  let gridCols = 'grid-cols-2';
  if (data.layoutType === 'horizontal') {
    if (imageCount === 3 || imageCount >= 5) {
      gridCols = 'grid-cols-3';
    } else {
      gridCols = 'grid-cols-2';
    }
  } else {
    gridCols = 'grid-cols-1 max-w-md mx-auto';
  }

  // If there are more images, we might need more rows, but we must keep it to 1 page.
  // We use h-full and flex-1 to ensure the gallery container is exactly the remaining space.
  const gridRows = displayImages.length > 3 && data.layoutType === 'horizontal' ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <div 
      className="h-[297mm] w-[210mm] flex flex-col p-10 rounded-sm relative overflow-hidden bg-white shadow-inner"
      style={{ 
        background: `linear-gradient(135deg, ${theme}08 0%, #ffffff 50%, ${theme}03 100%)`,
        color: primaryText,
      }}
    >
      {/* Decorative background element */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] opacity-[0.1]"
        style={{ backgroundColor: theme }}
      ></div>

      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header - Fixed Height */}
        <header className="flex justify-between items-center pb-5 border-b-2 border-slate-100 mb-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 leading-tight">SK ALL SAINTS</h2>
            <p className="text-xs font-bold uppercase tracking-[0.25em] flex items-center gap-2" style={{ color: secondaryText }}>
              <MapPin size={14} style={{ color: theme }} /> Kamunting, Perak
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
            <Award style={{ color: theme }} size={28} />
          </div>
        </header>

        {/* Program Title and Date - Fixed Height */}
        <div className="mb-6 text-center flex-shrink-0">
          <h1 className="text-4xl font-black leading-tight mb-3 uppercase tracking-tighter break-words" style={{ color: primaryText }}>
            {data.title || "TAJUK PROGRAM"}
          </h1>
          <div 
            className="inline-flex items-center gap-2 bg-slate-50/80 border border-slate-100 px-5 py-1.5 rounded-full font-bold text-xs"
            style={{ color: secondaryText }}
          >
            <Calendar size={14} style={{ color: theme }} />
            {formattedDate}
          </div>
        </div>

        {/* Infographic Section - Flex-shrink-0 to ensure all text is visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 flex-shrink-0">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-center shadow-sm h-full">
            <h3 className="font-black text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: theme }}>Ringkasan Eksekutif</h3>
            <p className="text-base leading-relaxed font-semibold text-slate-700 italic whitespace-pre-wrap">
              "{data.description}"
            </p>
          </div>

          <div className="space-y-4 flex flex-col justify-center">
            <div className="flex items-start gap-4 bg-white/50 p-3 rounded-2xl border border-transparent">
              <div className="p-2.5 rounded-xl bg-white shadow-sm flex-shrink-0">
                <Target style={{ color: theme }} size={22} />
              </div>
              <div>
                <h4 className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1">Objektif Utama</h4>
                <p className="font-bold text-sm leading-tight break-words" style={{ color: primaryText }}>{data.objective}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/50 p-3 rounded-2xl border border-transparent">
              <div className="p-2.5 rounded-xl bg-white shadow-sm flex-shrink-0">
                <TrendingUp className="text-emerald-500" size={22} />
              </div>
              <div>
                <h4 className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-1">Impak Utama</h4>
                <p className="font-bold text-sm leading-tight break-words" style={{ color: primaryText }}>{data.impact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Divider */}
        <div className="flex items-center gap-4 mb-5 flex-shrink-0">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] whitespace-nowrap" style={{ color: secondaryText }}>Visual Dokumentasi</h3>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-slate-200 to-transparent"></div>
        </div>
        
        {/* Main Gallery Section - Flex-1 and Min-h-0 allows it to absorb all remaining space */}
        <div className="flex-1 min-h-0 mb-6 overflow-hidden">
          {displayImages.length === 0 ? (
            <div className="w-full h-full bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
              <ImageIcon size={64} className="mb-4 opacity-50" style={{ color: theme }} />
              <p className="text-sm font-black uppercase tracking-[0.2em]">Muat Naik Foto Untuk Melengkapkan Laporan</p>
            </div>
          ) : (
            <div className={`w-full h-full grid gap-5 ${gridCols} ${gridRows}`}>
              {displayImages.map((img, idx) => {
                const x = img.focalPoint?.x ?? 50;
                const y = img.focalPoint?.y ?? 50;
                
                return (
                  <div 
                    key={idx} 
                    className="relative overflow-hidden rounded-[2rem] shadow-xl border-4 border-white transition-all bg-slate-100 h-full"
                  >
                    <img 
                      src={img.url} 
                      className="w-full h-full object-cover" 
                      style={{ 
                        objectPosition: `${x}% ${y}%`,
                      }}
                      alt={`Gallery item ${idx + 1}`} 
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Fixed Height */}
        <footer className="pt-6 border-t-2 border-slate-100 flex-shrink-0">
          <div className="flex justify-between items-end">
            <div className="max-w-xs">
              <p className="text-[9px] font-black uppercase mb-5 tracking-[0.3em]" style={{ color: secondaryText }}>Pengesahan Penyelaras</p>
              <div className="h-0.5 w-32 bg-slate-900 mb-2"></div>
              <p className="text-sm font-black tracking-tight" style={{ color: primaryText }}>UNIT KOKURIKULUM</p>
              <p className="text-[10px] font-bold uppercase opacity-60 tracking-wider" style={{ color: secondaryText }}>SK All Saints, Perak</p>
            </div>
            <div className="text-right pb-1">
              <p className="text-[9px] font-bold italic opacity-40 uppercase tracking-widest">Digital OPR System &bull; 2024</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReportContent;
