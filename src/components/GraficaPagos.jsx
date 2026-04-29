import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficaPagos({ datos }) {
  // Si no hay datos, no dibujamos nada
  if (!datos || datos.length === 0) return null;

  // 🧮 MOTOR DE AGRUPACIÓN: Suma el TOTAL dependiendo del ESTATUS
  const agrupados = datos.reduce((acc, fila) => {
    const estatus = fila.ESTATUS || 'SIN ESTATUS';
    if (!acc[estatus]) acc[estatus] = { nombre: estatus, total: 0 };
    acc[estatus].total += (fila.TOTAL || 0);
    return acc;
  }, {});

  // Convertimos el diccionario a una lista y la ordenamos de mayor a menor
  const dataGrafica = Object.values(agrupados).sort((a, b) => b.total - a.total);

  const formatoDinero = (monto) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);

  // Un tooltip personalizado para que se vea elegante al pasar el ratón
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-bold text-[#000638] mb-1">{label}</p>
          <p className="text-[#00A4E4] font-black text-lg">{formatoDinero(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">
        Distribución de Gasto por Estatus
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dataGrafica} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="nombre" 
            tick={{fontSize: 12, fill: '#6b7280', fontWeight: 'bold'}} 
            tickMargin={10}
          />
          <YAxis 
            tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} 
            tick={{fontSize: 12, fill: '#6b7280'}} 
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#f3f4f6'}} />
          
          {/* Usamos el azul oscuro de tu paleta */}
          <Bar dataKey="total" fill="#000638" radius={[6, 6, 0, 0]} barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}