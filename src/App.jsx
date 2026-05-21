import { useState, useEffect, useMemo } from 'react';
import { DockFiltros } from './components/DockFiltros';
import { TablaPagos } from './components/TablaPagos';
import { GraficaPagos } from './components/GraficaPagos';
import { obtenerTextoEstatus, convertirAMXN, formatoDinero } from './utils/diccionarios';

function App() {
  // ESTADO PARA GUARDAR LOS TIPOS DE CAMBIO
  const [tasasCambio, setTasasCambio] = useState({ USD: 17.50, EUR: 19.00 });

  // DESCARGAR EL PRECIO REAL AL ABRIR LA PÁGINA
  useEffect(() => {
    const obtenerDivisas = async () => {
      try {
        const respuesta = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const datos = await respuesta.json();

        const valorDolar = datos.rates.MXN;
        const valorEuro = datos.rates.MXN / datos.rates.EUR;

        setTasasCambio({ USD: valorDolar, EUR: valorEuro });
        console.log(`Tipos de cambio actualizados de forma remota: 1 USD = $${valorDolar} MXN`);
      } catch (error) {
        console.warn("No se pudo obtener el tipo de cambio remoto. Usando tasas de respaldo.");
      }
    };

    obtenerDivisas();
  }, []);

  const [datosReporte, setDatosReporte] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [rqSeleccionado, setRqSeleccionado] = useState(null);
  const [errorApi, setErrorApi] = useState(null);

  const generarReporte = async (filtros) => {
    setCargando(true);
    setErrorApi(null);
    try {
      const params = new URLSearchParams();
      params.append("anio", filtros.anio);
      if (filtros.meses) filtros.meses.forEach(m => params.append("meses", m.value));
      if (filtros.clientes) filtros.clientes.forEach(c => params.append("clientes", c.value));
      if (filtros.compradores) filtros.compradores.forEach(c => params.append("compradores", c.value));
      if (filtros.estatus) filtros.estatus.forEach(e => params.append("estatus", e.value));

      const res = await fetch(`http://10.52.14.80:8000/api/reporte?${params.toString()}`);
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data = await res.json();
      setDatosReporte(data.registros);
    } catch (error) {
      console.error("Error al generar reporte:", error);
      setErrorApi("Fallo en la comunicación telemétrica con el servidor. Revisa que el backend esté encendido.");
    }
    setCargando(false);
  };

  // SUMA TODO CONVERTIDO A MXN
  const costoTotal = useMemo(() => {
    return datosReporte.reduce((acc, fila) => {
      return acc + convertirAMXN(fila.TOTAL, fila.MONERA, tasasCambio);
    }, 0);
  }, [datosReporte, tasasCambio]);

  return (
    <div className="flex h-screen cyber-grid overflow-hidden font-title text-slate-800 relative">
      {/* Luces radiales difusas tenues estilo Apple */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#0088ff]/2 blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-slate-200/40 blur-[140px] pointer-events-none z-0"></div>

      <div className="w-full h-full p-10 pb-28 overflow-y-auto custom-scrollbar flex flex-col gap-8 z-10 relative">
        
        {/* Cabecera / Dashboard Title */}
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-6">
          <div className="flex items-center gap-4.5">
            <img 
              src="/ISSL_dark.png" 
              alt="Logo ISS" 
              className="h-10 w-auto object-contain select-none"
            />
            <div className="w-[1px] h-8 bg-slate-200/80"></div>
            <div>
              <h1 className="text-3xl font-extralight text-slate-900 tracking-wide font-title uppercase">
                Pagos <span className="font-extrabold text-[#0a192f]">ISS</span>
              </h1>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-1.5 font-tech">
                Solicitudes de requisiciones // ISS pagos
              </p>
            </div>
          </div>

          {/* Sistema de Estatus en Vivo */}
          <div className="flex items-center gap-4 bg-white/70 border border-slate-200/60 px-4 py-2 rounded-full backdrop-blur-md shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-tech">Conexion DB:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0088ff] cyber-pulse-cyan"></span>
              <span className="text-[11px] font-bold text-[#0088ff] font-tech uppercase tracking-wide">Online</span>
            </div>
          </div>
        </div>

        {/* Notificaciones de Error */}
        {errorApi && (
          <div className="bg-rose-50 border border-rose-100 p-4 shadow-sm rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 cyber-pulse-red"></span>
              <p className="text-xs text-rose-800 font-bold uppercase tracking-widest font-tech">{errorApi}</p>
            </div>
          </div>
        )}

        {/* Tarjetas de Métricas Clave */}
        {datosReporte.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Costo Acumulado */}
            <div className="glass-panel p-8 relative overflow-hidden neon-border-cyan neon-glow-cyan-hover">
              {/* Línea decorativa degradada */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0088ff] via-slate-300 to-transparent"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2 font-title">
                    Inversión Acumulada
                  </h3>
                  <p className="text-3xl font-extrabold text-slate-900 font-tech tracking-tight">
                    {formatoDinero(costoTotal)}
                  </p>
                </div>
                <div className="text-[9px] text-[#0088ff] font-tech font-bold uppercase bg-[#0088ff]/8 border border-[#0088ff]/15 px-2.5 py-0.5 rounded-full tracking-wider">
                  Conversión MXN
                </div>
              </div>
            </div>

            {/* Total Solicitudes */}
            <div className="glass-panel p-8 relative overflow-hidden border border-white/80 neon-glow-cyan-hover">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-slate-200 to-transparent"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2 font-title">
                    Registros en Consulta
                  </h3>
                  <p className="text-3xl font-extrabold text-slate-900 font-tech tracking-tight">
                    {datosReporte.length} <span className="text-xs text-slate-400 font-light font-title uppercase tracking-widest">Requisiciones</span>
                  </p>
                </div>
                <div className="text-[9px] text-slate-500 font-tech font-bold uppercase bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full tracking-wider">
                  Flujo Operativo
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Panel de Gráficas */}
        {datosReporte.length > 0 && (
          <div className="glass-panel p-8 border border-white/80 hover:border-slate-300/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300">
            <GraficaPagos datos={datosReporte} tasas={tasasCambio} />
          </div>
        )}

        {/* Panel de Tabla de Requisiciones */}
        <div className="glass-panel border border-white/80 hover:border-slate-300/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300">
          <TablaPagos datos={datosReporte} cargando={cargando} alHacerClicFila={(fila) => setRqSeleccionado(fila)} />
        </div>

      </div>

      {/* MODAL HOLOGRÁFICO DE DETALLE OPERATIVO */}
      {rqSeleccionado && (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4 animate-backdrop-in">
          
          <div className="glass-panel-heavy w-full max-w-3xl rounded-[28px] shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-in">
            
            {/* Cabecera del Modal */}
            <div className="bg-slate-50/90 px-8 py-6 flex justify-between items-center border-b border-slate-200/80 rounded-t-[28px]">
              <div>
                <span className="text-[#0088ff] text-[9px] uppercase tracking-widest font-extrabold block mb-1 font-tech">
                  Análisis Operativo Telemétrico
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-title">
                  Requisición <span className="font-extrabold text-[#0a192f] font-tech">{rqSeleccionado.IDFOLIORQ}</span>
                </h3>
              </div>
              <button 
                onClick={() => setRqSeleccionado(null)} 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full w-8 h-8 flex items-center justify-center font-light text-xl transition-all duration-200 cursor-pointer p-0 hover:scale-110"
              >
                ✕
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-8 overflow-y-auto text-xs text-slate-600 grid grid-cols-2 gap-x-8 gap-y-6 custom-scrollbar bg-white/50">
              
              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Fecha de Registro
                </span> 
                <span className="font-tech text-slate-800 font-semibold">{rqSeleccionado.FECHARQ}</span>
              </div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Estatus Operativo
                </span>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-extrabold font-tech px-2.5 py-0.5 rounded-full">
                    {rqSeleccionado.ESTATUS}
                  </span>
                  <span className="text-slate-800 font-bold">{obtenerTextoEstatus(rqSeleccionado.ESTATUS)}</span>
                </div>
              </div>

              <div className="col-span-2 h-[1px] bg-slate-100 my-1"></div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Clasificación RQ
                </span> 
                <span className="text-slate-800 font-semibold">{rqSeleccionado.TIPORQ || '-'}</span>
              </div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Tipo de Compra
                </span> 
                <span className="text-slate-800 font-semibold">{rqSeleccionado.TIPOCOMPRA || '-'}</span>
              </div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Entidad Cliente
                </span> 
                <span className="text-slate-900 font-extrabold">{rqSeleccionado.NOMCLIENT}</span>
              </div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Comprador Asignado
                </span> 
                <span className="text-slate-800 font-semibold">{rqSeleccionado.CTACORREO}</span>
              </div>
              
              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Solicitante
                </span> 
                <span className="text-slate-800 font-semibold">{rqSeleccionado.SOLICITANTE || '-'}</span>
              </div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Correo Solicitante
                </span> 
                <span className="text-slate-800 font-semibold">{rqSeleccionado.CORREOSOLIC || '-'}</span>
              </div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  JOB CODE
                </span> 
                <span className="font-tech font-extrabold text-sm text-slate-850">{rqSeleccionado.JOB || '-'}</span>
              </div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  JOB TASK
                </span> 
                <span className="font-tech font-extrabold text-sm text-slate-850">{rqSeleccionado.JOBTASK || '-'}</span>
              </div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Cuenta Contable (NAV)
                </span> 
                <span className="font-tech text-slate-800">{rqSeleccionado.CTANAV || '-'}</span>
              </div>

              <div>
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Registro Activo Fijo
                </span> 
                <span className="font-tech text-slate-800">{rqSeleccionado.ACTFIJO || '-'}</span>
              </div>

              <div className="col-span-2">
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-1.5">
                  Destino de Entrega
                </span> 
                <span className="text-slate-800 font-semibold">{rqSeleccionado.DIRENTREGA || '-'}</span>
              </div>

              {/* Caja de Monto Total */}
              <div className={`col-span-2 border p-6 mt-2 flex justify-between items-center rounded-2xl ${
                rqSeleccionado.es_anomalia 
                  ? 'bg-rose-50/75 border-rose-200 shadow-sm' 
                  : 'bg-slate-50 border-slate-200/80 shadow-sm'
              }`}>
                <div>
                  <span className={`font-bold text-[9px] uppercase tracking-widest font-title block ${rqSeleccionado.es_anomalia ? 'text-rose-600' : 'text-slate-500'}`}>
                    Costo Estimado Neto (Sin IVA)
                  </span>
                  {rqSeleccionado.es_anomalia && (
                    <span className="text-[9px] text-rose-600 font-extrabold font-tech flex items-center gap-1.5 mt-2 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 cyber-pulse-red"></span>
                      ALERTA DE ANOMALÍA ML DETECTADA
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className={`font-tech font-extrabold text-3xl ${rqSeleccionado.es_anomalia ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatoDinero(rqSeleccionado.TOTAL)}
                  </span>
                  <span className="font-tech font-bold text-xs text-slate-400 ml-2">{rqSeleccionado.MONERA}</span>
                </div>
              </div>

              <div className="col-span-2">
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-2">
                  Justificación Técnica
                </span> 
                <p className="bg-slate-50/60 border border-slate-100 p-4 text-slate-700 font-medium leading-relaxed rounded-2xl">
                  {rqSeleccionado.JUSTIFICOMP || 'Sin registro técnico registrado en la base de datos.'}
                </p>
              </div>

              <div className="col-span-2">
                <span className="font-bold block text-[9px] text-slate-400 uppercase tracking-widest font-title mb-2">
                  Observaciones Adicionales
                </span> 
                <p className="bg-slate-50/60 border border-slate-100 p-4 text-slate-700 font-medium leading-relaxed rounded-2xl">
                  {rqSeleccionado.OBSERVA1 || 'Sin comentarios adicionales.'}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DOCK FLOTANTE DE FILTROS MAC STYLE */}
      <DockFiltros onGenerarReporte={generarReporte} />
    </div>
  );
}

export default App;