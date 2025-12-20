
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

  const secondaryText = '#000000'; 
  const primaryText = '#000000';

  const imageCount = data.images.length;
  const displayImages = data.images.slice(0, 6);
  
  let gridCols = 'grid-cols-2';
  if (data.layoutType === 'horizontal') {
    if (imageCount === 3 || imageCount >= 5) {
      gridCols = 'grid-cols-3';
    } else {
      gridCols = 'grid-cols-2';
    }
  } else {
    gridCols = 'grid-cols-1 max-w-[140mm] mx-auto';
  }

  const gridRows = displayImages.length > 3 && data.layoutType === 'horizontal' ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <div 
      className="h-full w-full flex flex-col p-8 md:p-12 relative overflow-hidden bg-white box-border"
      style={{ 
        background: `linear-gradient(135deg, ${theme}08 0%, #ffffff 50%, ${theme}03 100%)`,
        color: primaryText,
      }}
    >
      {/* Background Decor */}
      <div 
        className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-[0.1]"
        style={{ backgroundColor: theme }}
      ></div>

      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header Section */}
        <header className="flex justify-between items-center pb-4 md:pb-6 border-b-2 border-slate-100 mb-6 md:mb-8 flex-shrink-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-black leading-none mb-1 uppercase">SK ALL SAINTS</h2>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: secondaryText }}>
              <MapPin size={12} style={{ color: theme }} /> Kamunting, Taiping, Perak
            </p>
          </div>
          <div className="bg-white p-2 md:p-3 rounded-2xl border border-slate-100 shadow-sm">
            <Award style={{ color: theme }} size={28} />
          </div>
        </header>

        {/* Title Section */}
        <div className="mb-6 md:mb-8 text-center flex-shrink-0">
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 uppercase tracking-tighter" style={{ color: primaryText }}>
            {data.title || "LAPORAN PROGRAM"}
          </h1>
          <div 
            className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 md:px-6 py-2 rounded-full font-black text-[10px] md:text-xs uppercase"
            style={{ color: secondaryText }}
          >
            <Calendar size={14} style={{ color: theme }} />
            {formattedDate}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10 flex-shrink-0">
          <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 flex flex-col justify-center shadow-sm">
            <h3 className="font-black text-[9px] uppercase tracking-[0.5em] mb-4" style={{ color: theme }}>Ringkasan Eksekutif</h3>
            <p className="text-base md:text-lg leading-relaxed font-bold text-black italic">
              "{data.description}"
            </p>
          </div>

          <div className="space-y-4 md:space-y-5 flex flex-col justify-center">
            <div className="flex items-start gap-4 md:gap-5 bg-white/40 p-3 md:p-4 rounded-2xl border border-transparent">
              <div className="p-2 md:p-3 rounded-xl bg-white shadow-sm flex-shrink-0">
                <Target style={{ color: theme }} size={24} />
              </div>
              <div>
                <h4 className="font-black text-[9px] uppercase tracking-widest text-black mb-1">Objektif</h4>
                <p className="font-bold text-sm md:text-base leading-tight" style={{ color: primaryText }}>{data.objective}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 md:gap-5 bg-white/40 p-3 md:p-4 rounded-2xl border border-transparent">
              <div className="p-2 md:p-3 rounded-xl bg-white shadow-sm flex-shrink-0">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <div>
                <h4 className="font-black text-[9px] uppercase tracking-widest text-black mb-1">Impak</h4>
                <p className="font-bold text-sm md:text-base leading-tight" style={{ color: primaryText }}>{data.impact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Divider */}
        <div className="flex items-center gap-4 md:gap-5 mb-5 md:mb-6 flex-shrink-0">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.6em] whitespace-nowrap" style={{ color: secondaryText }}>Dokumentasi Visual</h3>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-slate-200 to-transparent"></div>
        </div>
        
        {/* Main Image Gallery */}
        <div className="flex-1 min-h-0 mb-6 md:mb-8 overflow-hidden">
          {displayImages.length === 0 ? (
            <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center justify-center text-black">
              <ImageIcon size={48} className="mb-4 opacity-50" style={{ color: theme }} />
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Sila Lampirkan Foto Program</p>
            </div>
          ) : (
            <div className={`w-full h-full grid gap-4 md:gap-6 ${gridCols} ${gridRows}`}>
              {displayImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-4 border-white bg-slate-100 h-full"
                >
                  <img 
                    src={img.url} 
                    className="w-full h-full object-cover" 
                    style={{ 
                      objectPosition: `${img.focalPoint?.x ?? 50}% ${img.focalPoint?.y ?? 50}%`,
                    }}
                    alt="" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* A4 Footer */}
        <footer className="pt-6 md:pt-8 border-t-2 border-slate-100 flex-shrink-0">
          <div className="flex justify-between items-end">
            <div className="max-w-xs">
              <p className="text-[8px] md:text-[9px] font-black uppercase mb-4 md:mb-6 tracking-[0.4em]" style={{ color: secondaryText }}>Disediakan Oleh</p>
              <div className="h-0.5 w-32 md:w-40 bg-black mb-2"></div>
              <p className="text-sm md:text-base font-black tracking-tight" style={{ color: primaryText }}>PENGURUSAN KOKURIKULUM</p>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest" style={{ color: secondaryText }}>SK All Saints, Taiping</p>
            </div>
            <div className="text-right pb-1">
              <p className="text-[8px] md:text-[10px] font-black italic opacity-60 uppercase tracking-[0.2em]">Sistem Laporan Digital OPR &bull; v2.5</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReportContent;
