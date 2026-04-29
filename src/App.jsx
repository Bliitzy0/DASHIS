import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TablaPagos } from './components/TablaPagos';
import { GraficaPagos } from './components/GraficaPagos';

function App() {
  const [datosReporte, setDatosReporte] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [rqSeleccionado, setRqSeleccionado] = useState(null); 

  const generarReporte = async (filtros) => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      params.append("anio", filtros.anio);
      if (filtros.meses) filtros.meses.forEach(m => params.append("meses", m.value));
      if (filtros.clientes) filtros.clientes.forEach(c => params.append("clientes", c.value));
      if (filtros.compradores) filtros.compradores.forEach(c => params.append("compradores", c.value));
      if (filtros.estatus) filtros.estatus.forEach(e => params.append("estatus", e.value));

      const res = await fetch(`http://127.0.0.1:8000/api/reporte?${params.toString()}`);
      const data = await res.json();
      setDatosReporte(data.registros);
    } catch (error) {
      console.error("Error al generar reporte:", error);
      alert("Hubo un error de conexión.");
    }
    setCargando(false);
  };

  const formatoDinero = (monto) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto || 0);
  const costoTotal = datosReporte.reduce((suma, fila) => suma + (fila.TOTAL || 0), 0);

  return (
    // 🏢 Fondo gris corporativo (muy usado en intranet)
    <div className="flex h-screen bg-[#f4f4f4] overflow-hidden font-sans">
      <Sidebar onGenerarReporte={generarReporte} />

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        <h1 className="text-4xl font-light text-[#000638] mb-10 tracking-tight">Dashboard de <span className="font-bold">Requisiciones</span></h1>
        
        {datosReporte.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 🏢 Tarjetas Flat: Borde superior grueso, sombra casi invisible, fondo blanco puro */}
            <div className="bg-white p-8 border-t-4 border-[#00A4E4] shadow-sm">
              <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Costo Total Autorizado</h3>
              <p className="text-5xl font-light text-[#000638] tracking-tight">{formatoDinero(costoTotal)}</p>
            </div>
            
            <div className="bg-white p-8 border-t-4 border-[#000638] shadow-sm">
              <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Registros Locales</h3>
              <p className="text-5xl font-light text-[#000638] tracking-tight">{datosReporte.length}</p>
            </div>
          </div>
        )}

        {datosReporte.length > 0 && (
          <div className="bg-white p-8 border border-gray-200 shadow-sm mb-8">
            <GraficaPagos datos={datosReporte} />
          </div>
        )}
        
        <div className="bg-white shadow-sm">
          <TablaPagos datos={datosReporte} cargando={cargando} alHacerClicFila={(fila) => setRqSeleccionado(fila)} />
        </div>
      </div>

      {/* 🏢 MODAL TIPO DOCUMENTO OFICIAL */}
      {rqSeleccionado && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 transition-all">
          <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabecera plana azul oscuro */}
            <div className="bg-[#000638] text-white px-8 py-6 flex justify-between items-center border-b-4 border-[#00A4E4]">
              <div>
                <span className="text-[#00A4E4] text-[10px] uppercase tracking-widest font-bold block mb-1">Detalle Operativo</span>
                <h3 className="text-2xl font-light">Requisición <span className="font-bold">{rqSeleccionado.IDFOLIORQ}</span></h3>
              </div>
              <button onClick={() => setRqSeleccionado(null)} className="text-gray-400 hover:text-white font-light text-3xl transition-colors">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto text-sm text-gray-800 grid grid-cols-2 gap-x-8 gap-y-6 custom-scrollbar bg-[#f9fafb]">
              <div><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Fecha de Registro</span> {rqSeleccionado.FECHARQ}</div>
              <div><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Estado Operativo</span> <span className="bg-[#000638] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">{rqSeleccionado.ESTATUS}</span></div>
              
              <div className="col-span-2 h-px bg-gray-200 my-2"></div>

              <div><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Clasificación RQ</span> {rqSeleccionado.TIPORQ || '-'}</div>
              <div><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Clasificación Compra</span> {rqSeleccionado.TIPOCOMPRA || '-'}</div>
              
              <div className="col-span-2"><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Entidad Cliente</span> <span className="text-lg font-bold text-[#000638]">{rqSeleccionado.NOMCLIENT}</span></div>
              <div className="col-span-2"><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Solicitante Autorizado</span> {rqSeleccionado.SOLICITANTE || '-'} <span className="text-gray-500">({rqSeleccionado.CORREOSOLIC || '-'})</span></div>
              
              <div className="col-span-2 h-px bg-gray-200 my-2"></div>

              <div><span className="font-bold block text-[10px] text-[#00A4E4] uppercase tracking-widest mb-1">Código JOB</span> <span className="font-bold text-lg">{rqSeleccionado.JOB || '-'}</span></div>
              <div><span className="font-bold block text-[10px] text-[#00A4E4] uppercase tracking-widest mb-1">Código JOB TASK</span> <span className="font-bold text-lg">{rqSeleccionado.JOBTASK || '-'}</span></div>
              
              <div><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cuenta Contable (NAV)</span> {rqSeleccionado.CTANAV || '-'}</div>
              <div><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Registro Activo Fijo</span> {rqSeleccionado.ACTFIJO || '-'}</div>
              
              <div className="col-span-2"><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Destino de Entrega</span> {rqSeleccionado.DIRENTREGA || '-'}</div>
              
              <div className="col-span-2 bg-white p-6 border border-gray-200 mt-2 flex justify-between items-center">
                <span className="font-bold text-[10px] text-gray-500 uppercase tracking-widest">Inversión Total</span> 
                <div className="text-right">
                  <span className="font-light text-[#00A4E4] text-4xl">{formatoDinero(rqSeleccionado.TOTAL)}</span> 
                  <span className="font-bold text-gray-500 ml-2">{rqSeleccionado.MONERA}</span>
                </div>
              </div>
              
              <div className="col-span-2"><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Justificación Técnica</span> <p className="bg-white border border-gray-200 p-4 text-gray-700">{rqSeleccionado.JUSTIFICOMP || 'Sin registro en base de datos.'}</p></div>
              <div className="col-span-2"><span className="font-bold block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Observaciones Adicionales</span> <p className="bg-white border border-gray-200 p-4 text-gray-700">{rqSeleccionado.OBSERVA1 || 'Sin registro en base de datos.'}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;