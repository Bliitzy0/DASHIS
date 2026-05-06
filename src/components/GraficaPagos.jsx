import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { obtenerTextoEstatus, convertirAMXN } from '../utils/diccionarios';
import { useMemo } from 'react';

export function GraficaPagos({ datos, tasas }) {
  if (!datos || datos.length === 0) return null;

  const dataGrafica = useMemo(() => {
    const agrupados = datos.reduce((acc, fila) => {
      const estatus = fila.ESTATUS !== null ? fila.ESTATUS : 'N/A';
      if (!acc[estatus]) acc[estatus] = { nombre: estatus, total: 0 };
      
      // 🚀 LE PASAMOS LAS TASAS REALES DE INTERNET A LA CALCULADORA
      acc[estatus].total += convertirAMXN(fila.TOTAL, fila.MONERA, tasas); 
      
      return acc;
    }, {});

    return Object.values(agrupados).sort((a, b) => b.total - a.total);
  }, [datos, tasas]);

  const formatoDinero = (monto) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);
  const formatoEjeY = (valor) => valor >= 1000000 ? `$${(valor / 1000000).toFixed(1)}M` : valor >= 1000 ? `$${(valor / 1000).toFixed(0)}K` : `$${valor}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-sm rounded-sm">
          {/* 🚀 Muestra Número - Texto en el flotante */}
          <p className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">
            ESTATUS {label} - {obtenerTextoEstatus(label)}
          </p>
          <p className="text-[#00A4E4] font-light text-xl">{formatoDinero(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col">
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">
        Distribución de Inversión por Estado Operativo
      </h3>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataGrafica} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="nombre" tick={{fontSize: 10, fill: '#6b7280', fontWeight: 'bold'}} tickMargin={10}/>
            <YAxis tickFormatter={formatoEjeY} tick={{fontSize: 10, fill: '#6b7280'}} width={80}/>
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f9fafb'}} />
            <Bar dataKey="total" fill="#000638" radius={[0, 0, 0, 0]} barSize={50} activeBar={{ fill: '#00A4E4' }} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}