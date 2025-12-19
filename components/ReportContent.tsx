
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

  // Calculate dynamic "lite" colors
  const accentText = theme;
  const secondaryText = '#475569'; // slate-600
  const primaryText = '#1e293b'; // slate-800

  return (
    <div 
      className="h-full flex flex-col p-4 rounded-sm shadow-inner relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${theme}15 0%, #ffffff 50%, ${theme}08 100%)`,
        color: primaryText
      }}
    >
      {/* Decorative background elements using theme color (very light) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] opacity-[0.15]"
        style={{ backgroundColor: theme }}
      ></div>
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-[0.1]"
        style={{ backgroundColor: theme }}
      ></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="flex justify-between items-center pb-8 border-b border-slate-200 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tighter text-slate-900">SK ALL SAINTS</h2>
            <p className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: secondaryText }}>
              <MapPin size={14} style={{ color: theme }} /> Kamunting, Perak
            </p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <Award style={{ color: theme }} size={32} />
          </div>
        </header>

        {/* Hero Title */}
        <div className="mb-10 text-center">
          <h1 className="text-6xl font-black leading-[1.1] mb-6 uppercase italic tracking-tighter" style={{ color: primaryText }}>
            {data.title || "TAJUK PROGRAM"}
          </h1>
          <div 
            className="inline-flex items-center gap-3 bg-white border border-slate-100 px-6 py-2.5 rounded-full font-bold text-sm shadow-sm"
            style={{ color: secondaryText }}
          >
            <Calendar size={16} style={{ color: theme }} />
            {formattedDate}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-[0.4em] mb-4" style={{ color: theme }}>Ringkasan Eksekutif</h3>
            <p className="text-xl leading-relaxed font-medium italic text-slate-700">
              "{data.description}"
            </p>
          </div>

          <div className="space-y-6 flex flex-col justify-center">
            <div className="flex items-center gap-5 group">
              <div 
                className="p-3 rounded-2xl border transition-colors bg-white border-slate-100 shadow-sm"
              >
                <Target style={{ color: theme }} size={24} />
              </div>
              <div>
                <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Objektif Utama</h4>
                <p className="font-bold text-xl" style={{ color: primaryText }}>{data.objective}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 group">
              <div 
                className="p-3 rounded-2xl border transition-colors bg-white border-slate-100 shadow-sm"
              >
                <TrendingUp className="text-emerald-500" size={24} />
              </div>
              <div>
                <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Impak Utama</h4>
                <p className="font-bold text-xl" style={{ color: primaryText }}>{data.impact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Showcase - Center Piece */}
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="flex items-center gap-4 mb-8 w-full">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-200"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.5em] whitespace-nowrap" style={{ color: secondaryText }}>Galeri Acara</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200"></div>
          </div>
          
          {data.images.length === 0 ? (
            <div className="w-full h-96 bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                 <ImageIcon size={40} style={{ color: theme }} />
              </div>
              <p className="font-black uppercase tracking-widest">Menunggu Gambar</p>
              <p className="text-[10px] uppercase tracking-[0.2em] mt-2">Diperlukan: 3+ Foto Beresolusi Tinggi</p>
            </div>
          ) : (
            <div 
              className={`w-full grid gap-6 ${
                data.layoutType === 'horizontal' 
                  ? 'grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 max-w-lg'
              }`}
            >
              {data.images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`relative group overflow-hidden rounded-[2rem] shadow-lg transition-all hover:scale-[1.03] duration-500 border border-slate-100 ${
                    data.layoutType === 'vertical' ? 'h-72' : 'aspect-[4/3]'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end p-5">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/90">Rekod Visual #{idx + 1}</span>
                  </div>
                  <img src={img} className="w-full h-full object-cover transition-all duration-700" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-12">
          <div className="relative max-w-xs">
            <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: `linear-gradient(to right, ${theme}, transparent)` }}></div>
            <div className="pt-6">
              <p className="text-[10px] font-black uppercase mb-10 tracking-[0.3em]" style={{ color: secondaryText }}>Disediakan Oleh</p>
              <div className="h-0.5 w-40 bg-slate-900/10 mb-2"></div>
              <p className="text-sm font-black" style={{ color: primaryText }}>PENYELARAS PROGRAM</p>
              <p className="text-[10px] font-bold uppercase opacity-60" style={{ color: secondaryText }}>SK All Saints · Perak</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReportContent;
