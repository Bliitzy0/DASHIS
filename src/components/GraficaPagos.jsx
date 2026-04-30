import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { obtenerTextoEstatus } from '../utils/diccionarios';

export function GraficaPagos({ datos }) {
  if (!datos || datos.length === 0) return null;

  const agrupados = datos.reduce((acc, fila) => {
    const estatus = fila.ESTATUS !== null ? fila.ESTATUS : 'N/A';
    if (!acc[estatus]) acc[estatus] = { nombre: estatus, total: 0 };
    acc[estatus].total += (fila.TOTAL || 0);
    return acc;
  }, {});

  const dataGrafica = Object.values(agrupados).sort((a, b) => b.total - a.total);
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
            <Bar dataKey="total" fill="#000638" radius={[0, 0, 0, 0]} barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🚀 NUEVA LEYENDA DINÁMICA */}
      <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
        {dataGrafica.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-5 h-5 bg-[#00A4E4] text-white text-[10px] font-bold flex justify-center items-center rounded-sm shadow-sm">
              {item.nombre}
            </span>
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              {obtenerTextoEstatus(item.nombre)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}