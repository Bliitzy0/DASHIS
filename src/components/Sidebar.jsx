import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';

export function Sidebar({ onGenerarReporte }) {
  const [clientesMaestros, setClientesMaestros] = useState([]);
  const [compradoresMaestros, setCompradoresMaestros] = useState([]);
  const [clientesVisibles, setClientesVisibles] = useState([]);
  const [compradoresVisibles, setCompradoresVisibles] = useState([]);
  const [opcionesMeses, setOpcionesMeses] = useState([]);
  const [opcionesEstatus, setOpcionesEstatus] = useState([]);

  const [selAnio, setSelAnio] = useState("2026");
  const [selMeses, setSelMeses] = useState([]);
  const [selClientes, setSelClientes] = useState([]);
  const [selCompradores, setSelCompradores] = useState([]);
  const [selEstatus, setSelEstatus] = useState([]);

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const respuesta = await fetch("http://10.52.9.44:8000/api/catalogos");
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

  // ESTILO CLARO CORPORATIVO: Cajas blancas, bordes grises definidos
  const estilosSelect = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      borderRadius: '2px',
      borderColor: state.isFocused ? '#00A4E4' : '#d1d5db', // border-gray-300
      boxShadow: state.isFocused ? '0 0 0 1px #00A4E4' : 'none',
      backgroundColor: '#ffffff',
      minHeight: '38px',
      '&:hover': { borderColor: state.isFocused ? '#00A4E4' : '#9ca3af' }
    }),
    multiValue: (base) => ({ ...base, backgroundColor: '#f3f4f6', borderRadius: '2px' }),
    multiValueLabel: (base) => ({ ...base, color: '#000638', fontWeight: 'bold' }),
    multiValueRemove: (base) => ({ ...base, ':hover': { backgroundColor: '#e5e7eb', color: '#ef4444' } }),
    menuList: (base) => ({ ...base, padding: 0 }),
    menu: (base) => ({ ...base, borderRadius: '2px', zIndex: 50, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#f0f9ff' : 'white',
      color: state.isFocused ? '#00A4E4' : '#374151',
      ':active': { backgroundColor: '#e0f2fe' }
    })
  }), []);

  return (
    //  CAMBIO PRINCIPAL: Fondo blanco puro con línea separadora gris a la derecha
    <div className={`h-screen bg-white border-r border-gray-200 flex flex-col z-20 overflow-y-auto custom-scrollbar shrink-0 transition-all duration-300 ${isOpen ? 'w-[340px] p-8' : 'w-[80px] p-4 items-center'}`}>

      <div className={`flex ${isOpen ? 'justify-between items-start' : 'flex-col items-center gap-6'} mb-6 w-full`}>
        {isOpen ? (
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/ISSL.png"
                alt="Logo ISS"
                className="h-14 w-auto object-contain"
              />
              <span className="text-[#000638] text-3xl font-light tracking-tight">Pagos</span>
            </div>
            {/* Línea cyan decorativa */}
            <div className="h-1 w-22 bg-[#00A4E4] mt-4"></div>
          </div>
        ) : (
          <img
            src="/ISSL.png"
            alt="Logo ISS"
            className="h-10 w-auto object-contain"
          />
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`text-gray-400 hover:text-[#00A4E4] transition-colors ${isOpen ? 'mt-2' : ''}`}
          title={isOpen ? "Contraer" : "Expandir"}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      <div className={`flex flex-col gap-6 flex-1 mt-4 ${isOpen ? 'opacity-100' : 'hidden'}`}>
        <div>
          <label className="block text-[10px] font-bold mb-2 text-gray-500 uppercase tracking-widest">Año de Consulta</label>
          <select
            value={selAnio}
            onChange={(e) => setSelAnio(e.target.value)}
            className="w-full p-2 rounded-sm border border-gray-300 bg-white text-[#000638] font-medium focus:outline-none focus:border-[#00A4E4] focus:ring-1 focus:ring-[#00A4E4] transition-all">
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold mb-2 text-gray-500 uppercase tracking-widest">Meses</label>
          <Select isMulti options={opcionesMeses} value={selMeses} onChange={setSelMeses} placeholder="Seleccionar..." styles={estilosSelect} className="text-sm" />
        </div>

        <div>
          <label className="block text-[10px] font-bold mb-2 text-gray-500 uppercase tracking-widest">Clientes</label>
          <Select isMulti options={clientesVisibles} value={selClientes} onChange={setSelClientes} onInputChange={buscarCliente} filterOption={null} placeholder="Buscar..." styles={estilosSelect} className="text-sm" />
        </div>

        <div>
          <label className="block text-[10px] font-bold mb-2 text-gray-500 uppercase tracking-widest">Compradores</label>{/*Antes "CORREOSOLIC"*/}
          <Select isMulti options={compradoresVisibles} value={selCompradores} onChange={setSelCompradores} onInputChange={buscarComprador} filterOption={null} placeholder="Buscar..." styles={estilosSelect} className="text-sm" />
        </div>

        <div>
          <label className="block text-[10px] font-bold mb-2 text-gray-500 uppercase tracking-widest">Estatus</label>
          <Select isMulti options={opcionesEstatus} value={selEstatus} onChange={setSelEstatus} placeholder="Seleccionar..." styles={estilosSelect} className="text-sm" />
        </div>
      </div>

      {/* BOTÓN: Inicia Azul Oscuro, cambia a Cyan en Hover */}
      {isOpen ? (
        <button
          onClick={() => onGenerarReporte({ anio: selAnio, meses: selMeses, clientes: selClientes, compradores: selCompradores, estatus: selEstatus })}
          className="mt-8 w-full py-4 bg-[#000638] hover:bg-[#00A4E4] transition-colors duration-300 text-white font-bold text-sm uppercase tracking-widest rounded-sm">
          Aplicar Filtros
        </button>
      ) : (
        <button
          onClick={() => onGenerarReporte({ anio: selAnio, meses: selMeses, clientes: selClientes, compradores: selCompradores, estatus: selEstatus })}
          className="mt-auto w-full py-4 bg-[#000638] hover:bg-[#00A4E4] transition-colors duration-300 text-white flex justify-center rounded-sm"
          title="Aplicar Filtros"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      )}
    </div>
  );
}