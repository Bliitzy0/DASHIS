import { useState, useRef, useEffect } from 'react';

export function AgentChat({ onApplyAgentFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pregunta, setPregunta] = useState('');
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [cargando, setCargando] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'agent',
      type: 'text',
      content: '¡Hola! Soy tu asistente de IA para el Dashboard de Requisiciones. Puedes pedirme que filtre la vista (ej. "Muéstrame las requisiciones de Oxxo del 2025") o hacerme preguntas analíticas directamente (ej. "¿Quién es el comprador con más compras en total?"). ¿En qué puedo ayudarte hoy?'
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, cargando]);

  // Formateador simple de Markdown para negritas, bloques de código y código en línea
  const renderMessageContent = (content, role) => {
    if (!content) return null;
    
    // Separar por bloques de código (backticks triples)
    const codeBlocks = content.split(/(```[\s\S]*?```)/g);
    
    return codeBlocks.map((block, idx) => {
      if (block.startsWith('```') && block.endsWith('```')) {
        // Es un bloque de código
        const codeLines = block.slice(3, -3).trim().split('\n');
        let language = '';
        if (codeLines.length > 0 && /^[a-zA-Z0-9_-]+$/.test(codeLines[0])) {
          language = codeLines.shift();
        }
        const code = codeLines.join('\n');
        
        return (
          <div key={idx} className="my-2 border border-slate-200 bg-slate-100/50 rounded-xl p-3 font-mono text-[11px] text-slate-800 overflow-x-auto select-text">
            {language && <div className="text-[9px] text-[#0088ff] font-bold uppercase tracking-wider mb-1 font-tech">{language}</div>}
            <pre className="whitespace-pre">{code}</pre>
          </div>
        );
      }
      
      // Para texto plano, formatear negritas (**) y código en línea (`)
      const inlineBlocks = block.split(/(\*\*.*?\*\*|`.*?`)/g);
      
      return (
        <span key={idx} className="whitespace-pre-wrap">
          {inlineBlocks.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong 
                  key={partIdx} 
                  className={`font-extrabold ${role === 'user' ? 'text-cyan-200' : 'text-[#0a192f]'}`}
                >
                  {part.slice(2, -2)}
                </strong>
              );
            } else if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code 
                  key={partIdx} 
                  className={`px-1.5 py-0.5 border rounded font-mono text-[10px] ${
                    role === 'user' 
                      ? 'bg-slate-850/70 border-slate-700 text-cyan-200' 
                      : 'bg-slate-100 border-slate-200 text-rose-600'
                  }`}
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  const enviarPregunta = async (preguntaTexto) => {
    if (!preguntaTexto.trim() || cargando) return;

    const nuevaPregunta = preguntaTexto.trim();
    setPregunta('');
    setCargando(true);

    // Agregar mensaje del usuario a la historia
    setChatHistory(prev => [...prev, { role: 'user', type: 'text', content: nuevaPregunta }]);

    try {
      const response = await fetch('http://10.52.14.80:8000/api/chat_agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pregunta: nuevaPregunta,
          model_name: modelName
        }),
      });

      if (!response.ok) {
        throw new Error('Error en el servidor de IA');
      }

      const data = await response.json();
      
      if (data.type === 'filter') {
        // Es una petición de filtro de dashboard
        setChatHistory(prev => [
          ...prev, 
          { 
            role: 'agent', 
            type: 'filter', 
            content: `He configurado los filtros en el dashboard:`,
            filters: data.filters 
          }
        ]);
        
        // Aplicar los filtros al dashboard de React
        if (onApplyAgentFilters) {
          onApplyAgentFilters(data.filters);
        }
      } else {
        // Respuesta textual
        setChatHistory(prev => [
          ...prev, 
          { 
            role: 'agent', 
            type: 'text', 
            content: data.response 
          }
        ]);
      }
    } catch (error) {
      console.error('Error al consultar el agente:', error);
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'agent', 
          type: 'text', 
          content: '⚠️ Ocurrió un error al procesar tu solicitud. Asegúrate de que el backend FastAPI esté activo y de que tu API Key de Gemini esté configurada en el archivo `.env`.' 
        }
      ]);
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvioForm = (e) => {
    e.preventDefault();
    enviarPregunta(pregunta);
  };

  const sugerencias = [
    "Mostrar requisiciones de Walmart en 2025",
    "Filtrar Enero de 2026 para Oxxo",
    "¿Cuál es el promedio de gasto por cliente?",
    "¿Quién es el comprador con más solicitudes?",
    "Buscar folios en estatus Validado por mesa control"
  ];

  return (
    <>
      {/* BOTÓN FLOTANTE (CHAT BUBBLE) */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:scale-110 active:scale-95 shadow-lg ${
            isOpen 
              ? 'bg-rose-500 text-white shadow-rose-500/20 rotate-90' 
              : 'bg-[#0088ff] text-white shadow-[#0088ff]/25 cyber-pulse-cyan'
          }`}
          title="Consultar Agente de IA"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </button>
      </div>

      {/* PANEL LATERAL DE CHAT */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full sm:w-[450px] z-40 transition-transform duration-300 ease-out p-6 pt-10 pb-6 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="glass-panel-heavy w-full h-full flex flex-col overflow-hidden border border-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.15)] bg-white/90 backdrop-blur-2xl">
          {/* Cabecera */}
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/80 flex flex-col gap-2 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-[#0088ff]/10 text-[#0088ff] rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm font-title leading-tight">ISS Agente SQL</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-tech font-bold uppercase tracking-wider">Listo</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Selector de Modelo */}
            <div className="flex items-center justify-between border-t border-slate-200/40 pt-2 mt-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-tech">Modelo:</label>
              <select 
                value={modelName} 
                onChange={(e) => setModelName(e.target.value)}
                className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-[#0088ff] font-tech cursor-pointer transition-colors"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado)</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</option>
              </select>
            </div>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-4 bg-slate-50/30">
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col max-w-[85%] ${
                  msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div 
                  className={`px-4 py-3 rounded-2xl text-[12px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#0a192f] text-white rounded-tr-sm shadow-md' 
                      : 'bg-white border border-slate-200/80 text-slate-700 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.type === 'filter' ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-cyan-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span>{msg.content}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex flex-col gap-1 text-[11px] font-tech font-semibold text-slate-600">
                        {msg.filters.anio && <div>• Año: <span className="text-slate-900">{msg.filters.anio}</span></div>}
                        {msg.filters.meses?.length > 0 && <div>• Meses: <span className="text-slate-900">{msg.filters.meses.join(', ')}</span></div>}
                        {msg.filters.clientes?.length > 0 && <div>• Clientes: <span className="text-slate-900">{msg.filters.clientes.join(', ')}</span></div>}
                        {msg.filters.compradores?.length > 0 && <div>• Compradores: <span className="text-slate-900">{msg.filters.compradores.join(', ')}</span></div>}
                        {msg.filters.estatus?.length > 0 && <div>• Estatus: <span className="text-slate-900">{msg.filters.estatus.map(e => e.split(' ')[0]).join(', ')}</span></div>}
                      </div>
                    </div>
                  ) : (
                    <div className={`font-medium ${msg.role === 'user' ? 'text-white' : 'text-slate-700'}`}>
                      {renderMessageContent(msg.content, msg.role)}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-tech font-bold uppercase tracking-wider mt-1 px-1">
                  {msg.role === 'user' ? 'Tú' : 'Agente'}
                </span>
              </div>
            ))}

            {cargando && (
              <div className="flex flex-col items-start max-w-[80%] self-start">
                <div className="bg-white border border-slate-200/80 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#0088ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#0088ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#0088ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-450 font-tech">Consultando base de datos...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias de Entrada y Formulario */}
          <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex flex-col gap-3">
            {/* Chips de sugerencias */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar shrink-0 select-none">
              {sugerencias.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => enviarPregunta(sug)}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-100/90 text-[10px] text-slate-500 font-semibold border border-slate-200/70 rounded-full cursor-pointer shrink-0 transition-colors hover:text-[#0088ff] hover:border-[#0088ff]/30 font-title"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={manejarEnvioForm} className="flex gap-2 relative">
              <input
                type="text"
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                disabled={cargando}
                className="flex-1 bg-slate-50 border border-slate-200 text-[12px] font-medium rounded-2xl px-4 py-2.5 outline-none focus:border-[#0088ff] focus:bg-white text-slate-800 disabled:opacity-50 transition-all font-title placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={cargando || !pregunta.trim()}
                className="bg-[#0a192f] hover:bg-[#122849] text-white p-2.5 rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
