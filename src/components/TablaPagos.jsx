import { useState } from 'react';
import { obtenerTextoEstatus, formatoDineroMoneda } from '../utils/diccionarios';

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

  // 🚀 NUEVA FUNCIÓN: Corta el texto para quedarse solo con YYYY-MM-DD
  const soloFecha = (fechaCompleta) => {
    if (!fechaCompleta) return '-';
    // Corta por la "T" (si es formato ISO) o por el espacio (si es formato SQL)
    return fechaCompleta.split('T')[0].split(' ')[0]; 
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200">
      <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
          <thead className="text-[11px] text-gray-500 uppercase tracking-widest bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold">Folio RQ</th>
              <th className="px-6 py-4 font-bold">Fecha</th>
              {/* 🚀 Aumentamos el espacio mínimo de la cabecera */}
              <th className="px-6 py-4 font-bold min-w-[250px]">Cliente</th>
              <th className="px-6 py-4 font-bold text-right">Total</th>
              {/* 🚀 Le damos mucho más espacio a la justificación */}
              <th className="px-6 py-4 font-bold min-w-[350px]">Justificación</th>
              <th className="px-6 py-4 font-bold">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filasActuales.map((fila, index) => (
              <tr key={index} onClick={() => alHacerClicFila(fila)} className="bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-6 py-3 font-bold text-[#000638]">{fila.IDFOLIORQ}</td>
                
                {/* 🚀 Aplicamos la función para ocultar la hora */}
                <td className="px-6 py-3 text-gray-500">{soloFecha(fila.FECHARQ)}</td>
                
                {/* 🚀 Subimos el límite a 250px para ver más del nombre */}
                <td className="px-6 py-3 truncate max-w-[250px]" title={fila.NOMCLIENT}>{fila.NOMCLIENT}</td>
                
                <td className="px-6 py-3 text-right font-bold text-[#00A4E4]">
                  {formatoDineroMoneda(fila.TOTAL, fila.MONERA)} 
                  <span className="text-[9px] text-gray-400 ml-1">{fila.MONERA}</span>
                </td>
                
                {/* 🚀 Quitamos el "truncate", aplicamos "whitespace-normal" para que permita saltos de línea y aumentamos el ancho a 450px */}
                <td className="px-6 py-3 min-w-[350px] max-w-[450px] whitespace-normal text-gray-500 text-xs leading-relaxed" title={fila.JUSTIFICOMP}>
                  {fila.JUSTIFICOMP || '-'}
                </td>
                
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