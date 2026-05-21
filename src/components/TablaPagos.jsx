import { useState } from 'react';
import { obtenerTextoEstatus, formatoDineroMoneda, convertirAMXN } from '../utils/diccionarios';

export function TablaPagos({ datos, cargando, alHacerClicFila, estadisticasClientes, tasasCambio }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 100;

  if (cargando) return (
    <div className="flex flex-col justify-center items-center h-72 bg-white/40 border border-slate-200/50 backdrop-blur-md relative overflow-hidden rounded-2xl">
      {/* Luz sutil de carga de fondo */}
      <div className="absolute w-40 h-40 bg-[#0088ff]/4 blur-2xl rounded-full animate-pulse"></div>
      
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0088ff] z-10 relative"></div>
        <div className="absolute inset-0 bg-[#0088ff]/10 blur-md rounded-full"></div>
      </div>
      <span className="text-[#0088ff] font-bold font-tech uppercase tracking-widest text-[10px] neon-text-cyan z-10">
        Escaneando Base de Datos...
      </span>
    </div>
  );

  if (!Array.isArray(datos)) return (
    <div className="p-6 border-l-4 border-rose-500 bg-rose-50 text-rose-700 font-title rounded-2xl">
      <span className="font-bold font-tech text-xs tracking-wider block mb-1">FALLO CRÍTICO DEL SISTEMA:</span> Error de Estructura de Datos de Telemetría.
    </div>
  );

  if (datos.length === 0) return (
    <div className="flex flex-col items-center justify-center p-16 border border-slate-200/50 bg-white/40 backdrop-blur-sm rounded-2xl">
      <div className="relative mb-4">
        <svg className="w-12 h-12 text-[#0088ff]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="absolute inset-0 bg-[#0088ff]/4 blur-md rounded-full"></div>
      </div>
      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] font-tech">
        No se encontraron registros de telemetría
      </span>
      <p className="text-slate-400/60 text-[10px] mt-1.5 font-title">
        Modifica los parámetros de búsqueda en la consola de filtros.
      </p>
    </div>
  );

  const totalPaginas = Math.ceil(datos.length / filasPorPagina);
  const indiceUltimaFila = paginaActual * filasPorPagina;
  const indicePrimeraFila = indiceUltimaFila - filasPorPagina;
  const filasActuales = datos.slice(indicePrimeraFila, indiceUltimaFila);

  const soloFecha = (fechaCompleta) => {
    if (!fechaCompleta) return '-';
    return fechaCompleta.split('T')[0].split(' ')[0];
  };

  return (
    <div className="flex flex-col h-full bg-white/40 border border-slate-200/50 backdrop-blur-md rounded-2xl">
      <div className="overflow-x-auto overflow-y-auto custom-scrollbar rounded-t-2xl">
        <table className="w-full table-fixed text-left text-xs text-slate-700 whitespace-nowrap">
          <thead className="text-[9px] text-slate-500 uppercase tracking-widest bg-slate-50/80 sticky top-0 z-10 border-b border-slate-200/80 font-tech font-bold">
            <tr>
              <th className="w-28 px-6 py-4">Folio RQ</th>
              <th className="w-32 px-6 py-4">Fecha Registro</th>
              <th className="w-64 px-6 py-4">Cliente / Entidad</th>
              <th className="w-40 px-6 py-4 text-right">Monto Total</th>
              <th className="w-80 px-6 py-4">Justificación Operativa</th>
              <th className="w-64 px-6 py-4">Estatus Operativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-title">
            {filasActuales.map((fila, index) => {
              let desviacionPorcentaje = 0;
              let promedioComparativo = 0;
              let tieneSuficientesDatos = false;

              if (fila.es_anomalia && estadisticasClientes) {
                const cliente = fila.NOMCLIENT;
                const montoActualMXN = convertirAMXN(fila.TOTAL, fila.MONERA, tasasCambio);
                tieneSuficientesDatos = cliente && estadisticasClientes.conteos[cliente] > 1;
                promedioComparativo = tieneSuficientesDatos 
                  ? estadisticasClientes.promedios[cliente]
                  : estadisticasClientes.promedioGeneral;
                  
                desviacionPorcentaje = promedioComparativo > 0 
                  ? ((montoActualMXN - promedioComparativo) / promedioComparativo) * 100 
                  : 0;
              }

              return (
                <tr key={index} onClick={() => alHacerClicFila(fila)} 
                    className={`cursor-pointer transition-all duration-200 group ${
                      fila.es_anomalia 
                        ? 'bg-rose-50/60 hover:bg-rose-100/60 border-l-[3px] border-rose-500' 
                        : 'bg-transparent hover:bg-slate-50/50'
                    }`}>
                  
                  {/* Folio */}
                  <td className="px-6 py-3.5 font-bold font-tech text-[#0088ff] group-hover:text-[#0a192f] transition-colors flex items-center gap-1.5">
                    {fila.es_anomalia && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" title={`Alerta de Anomalía IA: Desviación de Monto (${desviacionPorcentaje > 0 ? `+${desviacionPorcentaje.toFixed(0)}%` : 'Atípico'})`}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <span>{fila.IDFOLIORQ}</span>
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-3.5 text-slate-400 font-tech">
                    {soloFecha(fila.FECHARQ)}
                  </td>

                  {/* Cliente */}
                  <td className="px-6 py-3.5 truncate max-w-[250px] font-semibold text-slate-800" title={fila.NOMCLIENT}>
                    {fila.NOMCLIENT}
                  </td>

                  {/* Monto */}
                  <td className={`px-6 py-3.5 text-right font-bold font-tech ${fila.es_anomalia ? 'text-rose-600 font-extrabold' : 'text-[#0088ff]'}`}>
                    <div className="flex items-center justify-end gap-1.5">
                      {fila.es_anomalia && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-rose-500 cyber-pulse-red mr-1.5" title={`Anomalía de Monto IA: excede el promedio por +${desviacionPorcentaje.toFixed(0)}%`}></span>
                          {desviacionPorcentaje > 0 && (
                            <span 
                              className="text-[9px] bg-rose-100 text-rose-700 font-extrabold font-tech px-2 py-0.5 rounded-full mr-1.5 border border-rose-200/50 hover:bg-rose-200 transition-colors select-none" 
                              title={`Este monto excede el promedio ${tieneSuficientesDatos ? 'de este cliente' : 'general'} por un ${desviacionPorcentaje.toFixed(1)}%.`}
                            >
                              +{desviacionPorcentaje.toFixed(0)}%
                            </span>
                          )}
                        </>
                      )}
                      <span>{formatoDineroMoneda(fila.TOTAL, fila.MONERA)}</span>
                      <span className="text-[9px] text-slate-400 font-semibold ml-1">{fila.MONERA}</span>
                    </div>
                  </td>

                  {/* Justificación */}
                  <td className="px-6 py-3.5 whitespace-normal text-slate-500 text-[11px] leading-relaxed max-w-[320px]" title={fila.JUSTIFICOMP}>
                    <div className="line-clamp-2">{fila.JUSTIFICOMP || 'Sin registro técnico.'}</div>
                  </td>

                  {/* Estatus */}
                  <td className="px-6 py-3.5">
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full tracking-wider font-tech uppercase border ${
                      fila.es_anomalia 
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:border-slate-300 group-hover:text-slate-800 transition-colors duration-200'
                    }`}>
                      {obtenerTextoEstatus(fila.ESTATUS)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center p-4 bg-slate-50 border-t border-slate-200/80 rounded-b-2xl">
        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold font-tech">
          Muestras {indicePrimeraFila + 1} - {Math.min(indiceUltimaFila, datos.length)} de {datos.length}
        </span>
        <div className="flex gap-1.5 font-title">
          <button 
            onClick={() => setPaginaActual(paginaActual - 1)} 
            disabled={paginaActual === 1} 
            className="px-4 py-1.5 border border-slate-200 hover:border-slate-300 bg-white text-[9px] font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none uppercase transition-all duration-300 rounded-full cursor-pointer">
            Previo
          </button>
          <span className="px-5 py-1.5 text-[9px] font-extrabold font-tech bg-[#0a192f] text-white uppercase rounded-full shadow-sm tracking-wider">
            {paginaActual} / {totalPaginas}
          </span>
          <button 
            onClick={() => setPaginaActual(paginaActual + 1)} 
            disabled={paginaActual === totalPaginas} 
            className="px-4 py-1.5 border border-slate-200 hover:border-slate-300 bg-white text-[9px] font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none uppercase transition-all duration-300 rounded-full cursor-pointer">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}