import { useState } from 'react';
import { obtenerTextoEstatus, formatoDineroMoneda } from '../utils/diccionarios';

export function TablaPagos({ datos, cargando, alHacerClicFila }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 100;

  if (cargando) return (
    <div className="flex flex-col justify-center items-center h-64 bg-white border border-gray-200 shadow-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#00A4E4] mb-4"></div>
      <span className="text-[#00A4E4] font-bold uppercase tracking-widest text-xs">Cargando información...</span>
    </div>
  );
  if (!Array.isArray(datos)) return <div className="p-6 border-l-4 border-red-500 bg-red-50">Error de Sistema</div>;
  if (datos.length === 0) return (
    <div className="flex flex-col items-center justify-center p-16 mt-6 border border-gray-200 bg-white shadow-sm">
      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-[#000638] font-bold uppercase tracking-widest text-sm">No hay registros</span>
      <p className="text-gray-400 text-xs mt-2">Ajusta los filtros para encontrar información.</p>
    </div>
  );

  const totalPaginas = Math.ceil(datos.length / filasPorPagina);
  const indiceUltimaFila = paginaActual * filasPorPagina;
  const indicePrimeraFila = indiceUltimaFila - filasPorPagina;
  const filasActuales = datos.slice(indicePrimeraFila, indiceUltimaFila);

  // Corta el texto para quedarse solo con YYYY-MM-DD
  const soloFecha = (fechaCompleta) => {
    if (!fechaCompleta) return '-';
    // Corta por la "T" (si es formato ISO) o por el espacio (si es formato SQL)
    return fechaCompleta.split('T')[0].split(' ')[0];
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200">
      <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full table-fixed text-left text-sm text-gray-700 whitespace-nowrap">
          <thead className="text-[11px] text-gray-500 uppercase tracking-widest bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
            <tr>
              <th className="w-24 px-6 py-4 font-bold max-w-15">Folio RQ</th>
              <th className="w-28 px-6 py-4 font-bold max-w-20">Fecha</th>
              <th className="w-64 px-6 py-4 font-bold max-w-60 ">Cliente</th>
              <th className="w-32 px-6 py-4 font-bold text-right max-w-25">Total</th>
              <th className="w-64 px-6 py-4 font-bold max-w-40">Justificación</th>
              <th className="w-64 px-6 py-4 font-bold">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filasActuales.map((fila, index) => (
              <tr key={index} onClick={() => alHacerClicFila(fila)} className="bg-white hover:bg-[#f0f9ff] cursor-pointer transition-all duration-300 group">
                <td className="px-6 py-3 font-bold text-[#000638] group-hover:text-[#00A4E4] transition-colors">{fila.IDFOLIORQ}</td>

                {/* Aplicamos la función para ocultar la hora */}
                <td className="px-6 py-3 text-gray-500">{soloFecha(fila.FECHARQ)}</td>

                {/* Subimos el límite a 250px para ver más del nombre */}
                <td className="px-6 py-3 truncate max-w-[250px]" title={fila.NOMCLIENT}>{fila.NOMCLIENT}</td>

                <td className="px-6 py-3 text-right font-bold text-[#00A4E4]">
                  {formatoDineroMoneda(fila.TOTAL, fila.MONERA)}
                  <span className="text-[9px] text-gray-400 ml-1">{fila.MONERA}</span>
                </td>

                {/* Dejamos que table-fixed controle el ancho, pero permitimos saltos de línea con line-clamp para no hacer la fila gigante */}
                <td className="px-6 py-3 whitespace-normal text-gray-500 text-xs leading-relaxed" title={fila.JUSTIFICOMP}>
                  <div className="line-clamp-2">{fila.JUSTIFICOMP || '-'}</div>
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