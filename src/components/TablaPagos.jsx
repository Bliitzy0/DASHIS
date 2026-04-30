import { useState } from 'react';
import { obtenerTextoEstatus } from '../utils/diccionarios';

export function TablaPagos({ datos, cargando, alHacerClicFila }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 100;

  if (cargando) return <div className="flex justify-center items-center h-64 font-bold text-[#00A4E4]">Cargando información...</div>;
  if (!Array.isArray(datos)) return <div className="p-6 border-l-4 border-red-500 bg-red-50">Error de Sistema</div>;
  if (datos.length === 0) return <div className="text-center text-gray-500 p-10 mt-6 border border-gray-200 bg-gray-50">No hay registros.</div>;

  const totalPaginas = Math.ceil(datos.length / filasPorPagina);
  const indiceUltimaFila = paginaActual * filasPorPagina;
  const indicePrimeraFila = indiceUltimaFila - filasPorPagina;
  const filasActuales = datos.slice(indicePrimeraFila, indiceUltimaFila);

  const formatoDinero = (monto) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto || 0);

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200">
      <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
          <thead className="text-[11px] text-gray-500 uppercase tracking-widest bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold">Folio RQ</th>
              <th className="px-6 py-4 font-bold">Fecha</th>
              <th className="px-6 py-4 font-bold">Cliente</th>
              <th className="px-6 py-4 font-bold text-right">Total</th>
              <th className="px-6 py-4 font-bold">Justificación</th>
              <th className="px-6 py-4 font-bold">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filasActuales.map((fila, index) => (
              <tr key={index} onClick={() => alHacerClicFila(fila)} className="bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-6 py-3 font-bold text-[#000638]">{fila.IDFOLIORQ}</td>
                <td className="px-6 py-3 text-gray-500">{fila.FECHARQ}</td>
                <td className="px-6 py-3 truncate max-w-[150px]" title={fila.NOMCLIENT}>{fila.NOMCLIENT}</td>
                <td className="px-6 py-3 text-right font-bold text-[#00A4E4]">{formatoDinero(fila.TOTAL)}</td>
                {/* 🚀 NUEVA COLUMNA: Justificación */}
                <td className="px-6 py-3 truncate max-w-[200px] text-gray-500" title={fila.JUSTIFICOMP}>{fila.JUSTIFICOMP || '-'}</td>
                {/* 🚀 NUEVO ESTATUS: Transformado a texto */}
                <td className="px-6 py-3">
                  <span className="bg-gray-200 text-[#000638] text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                    {obtenerTextoEstatus(fila.ESTATUS)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">
          {indicePrimeraFila + 1} - {Math.min(indiceUltimaFila, datos.length)} DE {datos.length}
        </span>
        <div className="flex gap-1">
          <button onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} className="px-3 py-1 border border-gray-300 bg-white text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-100 uppercase">Ant</button>
          <span className="px-3 py-1 text-xs font-bold bg-[#00A4E4] text-white uppercase">{paginaActual} / {totalPaginas}</span>
          <button onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="px-3 py-1 border border-gray-300 bg-white text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-100 uppercase">Sig</button>
        </div>
      </div>
    </div>
  );
}