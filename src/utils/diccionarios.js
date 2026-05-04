// Archivo: src/utils/diccionarios.js

export const DICCIONARIO_ESTATUS = {
    "0": "Almacenado",
    "1": "Envía a Autorizador",
    "2": "Autorizado por autorizador",
    "3": "Validado por mesa control",
    "4": "Autorizado con asignación directa",
    "5": "Comprador envió Pedido de Compra",
    "6": "Comprador agrego Pedido de Compra",
    "7": "No autorizado por Importes",
    "8": "Usuario Sube Archivo de Posteo",
    "9": "Transferido a Nivel Superior",
    "10": "Usuario quita Archivo de Posteo",
    "11": "Rechazo por Documentación",
    "12": "Rechazo Comprador por Importe",
    "50": "Cambio de categoría",
    "51": "Cambio de categoría y comprador",
    "52": "Comprador envió Pedido de Compra a proveedor y usuario",
    "53": "Usuario envía por correo Posteo y soportes y/o evidencias al proveedor",
    "54": "Comprador envía por correo Posteo y soportes y/o evidencias al proveedor",
    "55": "Usuario completo información al folio",
    "56": "COMPRADOR ELIMINO ARCHIVO DE COMPRA DEL FOLIO",
    "57": "Nombre de Archivo y Registro de la PO fue renombrado.",
    "58": "REAPERTURA DE LA RQ - PO ELIMNADO",
    "59": "RQ AUTORIZADA POR CFO CON SOPORTE DE LA REGION",
    "60": "RQ AF - enviada a control financiero",
    "61": "RQ AF - enviada a control de Activos Fijos",
    "62": "RQ AF - Folio rechazado",
    "63": "RQ AF - Asignado activo fijo"
};

// Esta función evita que el sistema falle si llega un número raro
export const obtenerTextoEstatus = (numero) => {
  return DICCIONARIO_ESTATUS[String(numero)] || "Desconocido";
};
// 🚀 1. Función para convertir a MXN (con su seguro de vida)
export const convertirAMXN = (monto, moneda, tasasDinamicas) => {
  if (!monto) return 0;
  if (moneda === 'MXN') return monto;
  
  const tasasSeguras = tasasDinamicas || {}; 
  const tasa = tasasSeguras[moneda] || 1; 
  
  return monto * tasa;
};

// 🚀 2. Función para darle formato visual a la tabla (¡Esta es la que faltaba!)
export const formatoDineroMoneda = (monto, moneda) => {
  const codigoMoneda = moneda && moneda.trim() !== '' ? moneda : 'MXN';
  return new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: codigoMoneda 
  }).format(monto || 0);
};