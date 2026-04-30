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

  // 🏢 ESTILO CLARO CORPORATIVO: Cajas blancas, bordes grises definidos
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
    // 🎨 CAMBIO PRINCIPAL: Fondo blanco puro con línea separadora gris a la derecha
    <div className="w-[340px] h-screen bg-white border-r border-gray-200 p-8 flex flex-col z-20 overflow-y-auto custom-scrollbar shrink-0">
      
     {/* 🏢 LOGO TIPO ISS - Imagen y Texto */}
      <div className="mb-10">
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

      <div className="flex flex-col gap-6 flex-1">
        <div>
          <label className="block text-[10px] font-bold mb-2 text-gray-500 uppercase tracking-widest">Año de Consulta</label>
          <select 
            value={selAnio} 
            onChange={(e) => setSelAnio(e.target.value)}
            className="w-full p-2 rounded-sm border border-gray-300 bg-white text-[#000638] font-medium focus:outline-none focus:border-[#00A4E4] focus:ring-1 focus:ring-[#00A4E4] transition-all">
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
          <label className="block text-[10px] font-bold mb-2 text-gray-500 uppercase tracking-widest">Compradores</label>
          <Select isMulti options={compradoresVisibles} value={selCompradores} onChange={setSelCompradores} onInputChange={buscarComprador} filterOption={null} placeholder="Buscar..." styles={estilosSelect} className="text-sm" />
        </div>

        <div>
          <label className="block text-[10px] font-bold mb-2 text-gray-500 uppercase tracking-widest">Estatus</label>
          <Select isMulti options={opcionesEstatus} value={selEstatus} onChange={setSelEstatus} placeholder="Seleccionar..." styles={estilosSelect} className="text-sm" />
        </div>
      </div>

      {/* 🏢 BOTÓN: Inicia Azul Oscuro, cambia a Cyan en Hover */}
      <button 
        onClick={() => onGenerarReporte({ anio: selAnio, meses: selMeses, clientes: selClientes, compradores: selCompradores, estatus: selEstatus })}
        className="mt-8 w-full py-4 bg-[#000638] hover:bg-[#00A4E4] transition-colors duration-300 text-white font-bold text-sm uppercase tracking-widest rounded-sm">
        Aplicar Filtros
      </button>
    </div>
  );
}