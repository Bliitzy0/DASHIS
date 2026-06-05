import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';

export function DockFiltros({
  onGenerarReporte,
  selAnio,
  setSelAnio,
  selMeses,
  setSelMeses,
  selClientes,
  setSelClientes,
  selCompradores,
  setSelCompradores,
  selEstatus,
  setSelEstatus
}) {
  const [clientesMaestros, setClientesMaestros] = useState([]);
  const [compradoresMaestros, setCompradoresMaestros] = useState([]);
  const [clientesVisibles, setClientesVisibles] = useState([]);
  const [compradoresVisibles, setCompradoresVisibles] = useState([]);
  const [opcionesMeses, setOpcionesMeses] = useState([]);
  const [opcionesEstatus, setOpcionesEstatus] = useState([]);

  // Control de filtro activo en popover flotante
  const [filtroActivo, setFiltroActivo] = useState(null); // 'anio' | 'meses' | 'clientes' | 'compradores' | 'estatus' | null

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const respuesta = await fetch("http://10.52.14.80:8000/api/catalogos");
        const data = await respuesta.json();
        const formatear = (arr) => arr.map(item => ({ value: item, label: item }));

        setOpcionesMeses(formatear(data.meses));
        setOpcionesEstatus(formatear(data.estatus));

        const clientesFormateados = formatear(data.clientes);
        const compradoresFormateados = formatear(data.compradores);

        setClientesMaestros(clientesFormateados);
        setCompradoresMaestros(compradoresFormateados);
        setClientesVisibles(clientesFormateados.slice(0, 100));
        setCompradoresVisibles(compradoresFormateados.slice(0, 100));
      } catch (error) {
        console.error("Error conectando con FastAPI:", error);
      }
    };
    cargarCatalogos();
  }, []);

  const buscarCliente = (texto) => {
    if (!texto) {
      setClientesVisibles(clientesMaestros.slice(0, 100));
    } else {
      const filtrados = clientesMaestros.filter(c => c.label.toLowerCase().includes(texto.toLowerCase()));
      setClientesVisibles(filtrados.slice(0, 100));
    }
  };

  const buscarComprador = (texto) => {
    if (!texto) {
      setCompradoresVisibles(compradoresMaestros.slice(0, 100));
    } else {
      const filtrados = compradoresMaestros.filter(c => c.label.toLowerCase().includes(texto.toLowerCase()));
      setCompradoresVisibles(filtrados.slice(0, 100));
    }
  };

  const limpiarFiltros = () => {
    setSelAnio("2026");
    setSelMeses([]);
    setSelClientes([]);
    setSelCompradores([]);
    setSelEstatus([]);
    setFiltroActivo(null);
  };

  // ESTILOS DE SELECT TRANSPARENTES CLAROS APPLE STYLE
  const estilosSelect = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      borderRadius: '12px',
      borderColor: state.isFocused ? '#4f46e5' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(79, 70, 229, 0.12)' : 'none',
      backgroundColor: '#ffffff',
      minHeight: '38px',
      color: '#0f172a',
      transition: 'all 0.25s ease',
      borderWidth: '1px',
      fontSize: '12px',
      '&:hover': { borderColor: state.isFocused ? '#4f46e5' : '#cbd5e1' }
    }),
    singleValue: (base) => ({ ...base, color: '#0f172a' }),
    input: (base) => ({ ...base, color: '#0f172a' }),
    placeholder: (base) => ({ ...base, color: '#94a3b8' }),
    multiValue: (base) => ({ 
      ...base, 
      backgroundColor: 'rgba(79, 70, 229, 0.06)', 
      borderRadius: '6px',
      border: '1px solid rgba(79, 70, 229, 0.12)'
    }),
    multiValueLabel: (base) => ({ ...base, color: '#0f172a', fontWeight: '500' }),
    multiValueRemove: (base) => ({ 
      ...base, 
      color: '#64748b',
      ':hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } 
    }),
    menuList: (base) => ({ 
      ...base, 
      padding: 0,
      maxHeight: '180px',
      backgroundColor: '#ffffff',
    }),
    menu: (base) => ({ 
      ...base, 
      borderRadius: '12px', 
      zIndex: 50, 
      border: '1px solid #e2e8f0', 
      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
      overflow: 'hidden',
      position: 'relative',
      marginTop: '4px'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#4f46e5' 
        : state.isFocused 
          ? 'rgba(79, 70, 229, 0.06)' 
          : 'transparent',
      color: state.isSelected 
        ? '#ffffff' 
        : '#0f172a',
      cursor: 'pointer',
      fontSize: '12px',
      ':active': { backgroundColor: 'rgba(79, 70, 229, 0.15)' }
    })
  }), []);

  const toggleFiltro = (filtro) => {
    setFiltroActivo(prev => prev === filtro ? null : filtro);
  };

  return (
    <>
      {/* CAPA DE COBERTURA INVISIBLE (BACKDROP CLICK) */}
      {filtroActivo && (
        <div 
          className="fixed inset-0 z-30 pointer-events-auto cursor-default" 
          onClick={() => setFiltroActivo(null)}
        />
      )}

      {/* CONTENEDOR FLOTANTE CENTRAL */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none w-auto">
        
        {/* POP-OVER DEL FILTRO ACTIVO */}
        {filtroActivo && (
          <div className="mb-4 bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_15px_45px_rgba(15,23,42,0.08)] rounded-3xl p-5 w-80 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200 ease-out z-40">
            
            {/* Popover de Año */}
            {filtroActivo === 'anio' && (
              <div className="flex flex-col gap-2">
                <label className="block text-[9px] font-bold mb-1 text-slate-400 uppercase tracking-widest font-tech">Año de Consulta</label>
                <div className="grid grid-cols-2 gap-2">
                  {["2023", "2024", "2025", "2026"].map((anio) => (
                    <button
                      key={anio}
                      onClick={() => { setSelAnio(anio); setFiltroActivo(null); }}
                      className={`py-2 px-3 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                        selAnio === anio
                          ? "bg-[#0a192f] border-[#0a192f] text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {anio}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popover de Meses */}
            {filtroActivo === 'meses' && (
              <div className="flex flex-col gap-2">
                <label className="block text-[9px] font-bold mb-1 text-slate-400 uppercase tracking-widest font-tech">Meses de Consulta</label>
                <Select
                  isMulti
                  options={opcionesMeses}
                  value={selMeses}
                  onChange={setSelMeses}
                  placeholder="Filtrar por meses..."
                  styles={estilosSelect}
                  className="text-xs font-title"
                  menuIsOpen={true}
                  closeMenuOnSelect={false}
                />
              </div>
            )}

            {/* Popover de Clientes */}
            {filtroActivo === 'clientes' && (
              <div className="flex flex-col gap-2">
                <label className="block text-[9px] font-bold mb-1 text-slate-400 uppercase tracking-widest font-tech">Clientes</label>
                <Select
                  isMulti
                  options={clientesVisibles}
                  value={selClientes}
                  onChange={setSelClientes}
                  onInputChange={buscarCliente}
                  filterOption={null}
                  placeholder="Buscar cliente..."
                  styles={estilosSelect}
                  className="text-xs font-title"
                  menuIsOpen={true}
                  closeMenuOnSelect={false}
                />
              </div>
            )}

            {/* Popover de Compradores */}
            {filtroActivo === 'compradores' && (
              <div className="flex flex-col gap-2">
                <label className="block text-[9px] font-bold mb-1 text-slate-400 uppercase tracking-widest font-tech">Compradores</label>
                <Select
                  isMulti
                  options={compradoresVisibles}
                  value={selCompradores}
                  onChange={setSelCompradores}
                  onInputChange={buscarComprador}
                  filterOption={null}
                  placeholder="Buscar comprador..."
                  styles={estilosSelect}
                  className="text-xs font-title"
                  menuIsOpen={true}
                  closeMenuOnSelect={false}
                />
              </div>
            )}

            {/* Popover de Estatus */}
            {filtroActivo === 'estatus' && (
              <div className="flex flex-col gap-2">
                <label className="block text-[9px] font-bold mb-1 text-slate-400 uppercase tracking-widest font-tech">Estatus</label>
                <Select
                  isMulti
                  options={opcionesEstatus}
                  value={selEstatus}
                  onChange={setSelEstatus}
                  placeholder="Filtrar por estatus..."
                  styles={estilosSelect}
                  className="text-xs font-title"
                  menuIsOpen={true}
                  closeMenuOnSelect={false}
                />
              </div>
            )}

          </div>
        )}

        {/* DOCK FLOTANTE PRINCIPAL DE ACCIONES */}
        <div className="pointer-events-auto bg-white/70 backdrop-blur-3xl border border-slate-200/50 shadow-[0_15px_40px_rgba(15,23,42,0.06)] rounded-full px-5 py-3.5 flex items-center gap-3 relative">
          
          {/* BOTÓN: AÑO */}
          <div className="relative group">
            <button
              onClick={() => toggleFiltro('anio')}
              className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-115 hover:-translate-y-1 ${
                filtroActivo === 'anio' 
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-[#4f46e5]/15' 
                  : 'text-slate-600 hover:text-[#4f46e5] hover:bg-slate-100/60'
              }`}
              title={`Año: ${selAnio}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {/* Badge indicando el año seleccionado */}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[7px] font-bold px-1 py-0.2 rounded font-tech">
                {selAnio}
              </span>
            </button>
          </div>

          {/* BOTÓN: MESES */}
          <div className="relative">
            <button
              onClick={() => toggleFiltro('meses')}
              className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-115 hover:-translate-y-1 ${
                filtroActivo === 'meses' 
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-[#4f46e5]/15' 
                  : 'text-slate-600 hover:text-[#4f46e5] hover:bg-slate-100/60'
              }`}
              title="Filtrar por Meses"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {selMeses.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4f46e5] text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm font-tech">
                  {selMeses.length}
                </span>
              )}
            </button>
          </div>

          {/* BOTÓN: CLIENTES */}
          <div className="relative">
            <button
              onClick={() => toggleFiltro('clientes')}
              className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-115 hover:-translate-y-1 ${
                filtroActivo === 'clientes' 
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-[#4f46e5]/15' 
                  : 'text-slate-600 hover:text-[#4f46e5] hover:bg-slate-100/60'
              }`}
              title="Filtrar por Clientes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {selClientes.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4f46e5] text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm font-tech">
                  {selClientes.length}
                </span>
              )}
            </button>
          </div>

          {/* BOTÓN: COMPRADORES */}
          <div className="relative">
            <button
              onClick={() => toggleFiltro('compradores')}
              className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-115 hover:-translate-y-1 ${
                filtroActivo === 'compradores' 
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-[#4f46e5]/15' 
                  : 'text-slate-600 hover:text-[#4f46e5] hover:bg-slate-100/60'
              }`}
              title="Filtrar por Compradores"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {selCompradores.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4f46e5] text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm font-tech">
                  {selCompradores.length}
                </span>
              )}
            </button>
          </div>

          {/* BOTÓN: ESTATUS */}
          <div className="relative">
            <button
              onClick={() => toggleFiltro('estatus')}
              className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-115 hover:-translate-y-1 ${
                filtroActivo === 'estatus' 
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-[#4f46e5]/15' 
                  : 'text-slate-600 hover:text-[#4f46e5] hover:bg-slate-100/60'
              }`}
              title="Filtrar por Estatus"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {selEstatus.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4f46e5] text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm font-tech">
                  {selEstatus.length}
                </span>
              )}
            </button>
          </div>

          {/* DIVISOR DE PRECISIÓN DE APPLE */}
          <div className="w-[1px] h-6 bg-slate-200/80 mx-1 shrink-0"></div>

          {/* ACCIÓN: APLICAR FILTROS (BOTÓN DE ALTO RELIEVE) */}
          <button
            onClick={() => {
              setFiltroActivo(null);
              onGenerarReporte({ 
                anio: selAnio, 
                meses: selMeses, 
                clientes: selClientes, 
                compradores: selCompradores, 
                estatus: selEstatus 
              });
            }}
            className="p-3 bg-[#0a192f] hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all duration-200 cursor-pointer hover:scale-115 hover:-translate-y-1"
            title="Aplicar Filtros"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* ACCIÓN: LIMPIAR FILTROS */}
          <button
            onClick={limpiarFiltros}
            className="p-3 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center active:scale-95 transition-all duration-200 cursor-pointer hover:scale-115 hover:-translate-y-1"
            title="Limpiar Filtros"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

        </div>
      </div>
    </>
  );
}
