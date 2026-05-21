import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { obtenerTextoEstatus, convertirAMXN, formatoDinero } from '../utils/diccionarios';
import { useMemo } from 'react';

export function GraficaPagos({ datos, tasas }) {
  if (!datos || datos.length === 0) return null;

  const dataGrafica = useMemo(() => {
    const agrupados = datos.reduce((acc, fila) => {
      const estatus = fila.ESTATUS !== null ? fila.ESTATUS : 'N/A';
      if (!acc[estatus]) acc[estatus] = { nombre: estatus, total: 0 };

      // Pasamos las tasas de cambio
      acc[estatus].total += convertirAMXN(fila.TOTAL, fila.MONERA, tasas);

      return acc;
    }, {});

    return Object.values(agrupados).sort((a, b) => b.total - a.total);
  }, [datos, tasas]);

  const formatoEjeY = (valor) => {
    if (valor >= 1000000) return `$${(valor / 1000000).toFixed(1)}M`;
    if (valor >= 1000) return `$${(valor / 1000).toFixed(0)}K`;
    return `$${valor}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] rounded-xl font-title z-50 font-tech">
          <p className="font-extrabold text-[9px] text-[#0088ff] uppercase tracking-widest mb-1.5 neon-text-cyan">
            ESTATUS {label}
          </p>
          <p className="text-slate-700 text-xs font-semibold mb-2 max-w-[200px] truncate">
            {obtenerTextoEstatus(label)}
          </p>
          <div className="h-[1px] bg-slate-100 mb-2"></div>
          <p className="text-slate-900 font-tech font-bold text-lg">
            {formatoDinero(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col font-title relative">
      <div className="flex justify-between items-center mb-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#0088ff] rounded-full cyber-pulse-cyan"></div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Distribución de Inversión por Estado Operativo
          </h3>
        </div>
        <span className="text-[9px] font-bold text-[#0088ff] bg-[#0088ff]/5 border border-[#0088ff]/15 px-2.5 py-0.5 rounded-full uppercase font-tech tracking-wide">
          Valores en MXN
        </span>
      </div>

      <div className="h-80 w-full z-10">
        <ResponsiveContainer width="100%" height="100%" debounce={300}>
          <BarChart data={dataGrafica} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <defs>
              {/* Gradiente Azul Rey Apple */}
              <linearGradient id="appleBlueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0088ff" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#0088ff" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15, 23, 42, 0.04)" />
            <XAxis 
              dataKey="nombre" 
              tick={{ fontSize: 9, fill: 'rgba(15, 23, 42, 0.5)', fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }} 
              tickMargin={10}
              axisLine={{ stroke: 'rgba(15, 23, 42, 0.08)' }}
            />
            <YAxis 
              tickFormatter={formatoEjeY} 
              tick={{ fontSize: 9, fill: 'rgba(15, 23, 42, 0.5)', fontFamily: 'Inter, sans-serif' }} 
              width={70}
              axisLine={{ stroke: 'rgba(15, 23, 42, 0.08)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 136, 255, 0.03)' }} />
            <Bar 
              dataKey="total" 
              fill="url(#appleBlueGrad)" 
              radius={[8, 8, 0, 0]} 
              barSize={40} 
              activeBar={{ fill: '#0088ff', stroke: '#ffffff', strokeWidth: 1.5 }} 
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}