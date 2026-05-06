from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import pandas as pd
from sqlalchemy import create_engine, text
import urllib.parse


# ---------------------- 1. CONFIGURACIÓN DE LA API ----------------------

app = FastAPI(
    title="API de Pagos ISS",
    description="Motor de datos para el Dashboard de Requisiciones",
    version="1.0.0"
)

# Configuración de CORS (Permite que cualquier Frontend se conecte a esta API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción, aquí pones la IP de tu Frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------- 2. MAPEO Y DICCIONARIOS ----------------------

diccionario_meses = {
    "Enero": 1, "Febrero": 2, "Marzo": 3, "Abril": 4, "Mayo": 5, "Junio": 6,
    "Julio": 7, "Agosto": 8, "Septiembre": 9, "Octubre": 10, "Noviembre": 11, "Diciembre": 12
}

diccionario_estatus = {
    "0  Almacenado": 0, "1  Envía a Autorizador": 1, "2  Autorizado por autorizador": 2,
    "3  Validado por mesa control": 3, "4  Autorizado con asignación directa": 4,
    "5  Comprador envió Pedido de Compra": 5, "6  Comprador agrego Pedido de Compra": 6,
    "7  No autorizado por Importes": 7, "8  Usuario Sube Archivo de Posteo": 8,
    "9  Transferido a Nivel Superior": 9, "10 Usuario quita Archivo de Posteo": 10,
    "11 Rechazo por Documentación": 11, "12 Rechazo Comprador por Importe": 12,
    "50 Cambio de categoría": 50, "51 Cambio de categoría y comprador": 51,
    "52 Comprador envió Pedido de Compra a proveedor y usuario": 52,
    "53 Usuario envía por correo Posteo y soportes y/o evidencias al proveedor": 53,
    "54 Comprador envía por correo Posteo y soportes y/o evidencias al proveedor": 54,
    "55 Usuario completo información al folio": 55,
    "56 COMPRADOR ELIMINO ARCHIVO DE COMPRA DEL FOLIO": 56,
    "57 Nombre de Archivo y Registro de la PO fue renombrado.": 57,
    "58 REAPERTURA DE LA RQ - PO ELIMNADO": 58,
    "59 RQ AUTORIZADA POR CFO CON SOPORTE DE LA REGION": 59,
    "60 RQ AF - enviada a control financiero": 60,
    "61 RQ AF - enviada a control de Activos Fijos": 61,
    "62 RQ AF - Folio rechazado": 62, "63 RQ AF - Asignado activo fijo": 63
}

# ---------------------- 3. MOTOR DE CONEXIÓN ----------------------

def iniciar_motor():
    password_segura = urllib.parse.quote_plus("Ifs2017#Test")
    url_conexion = (
        f"mssql+pyodbc://IssPagos:{password_segura}@10.52.18.191/ISS_Pagos"
        f"?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes"
    )
    return create_engine(url_conexion)

def obtener_datos(query, parametros=None):
    engine = iniciar_motor()
    try:
        with engine.connect() as conexion:
            # 1. Apagamos los mensajes ocultos de SQL Server y convertimos a texto seguro
            query_segura = text("SET NOCOUNT ON; " + query)
            
            # 2. Ejecutamos la consulta de forma nativa (Bypass a Pandas)
            resultado = conexion.execute(query_segura, parametros or {})
            
            # 3. Si la base de datos nos devuelve una tabla, la empaquetamos en Pandas
            if resultado.returns_rows:
                datos = resultado.fetchall()
                columnas = resultado.keys()
                return pd.DataFrame(datos, columns=columnas)
            else:
                return pd.DataFrame()
                
    except Exception as e:
        print(f"Error profundo en BD: {e}")
        return pd.DataFrame()

# ---------------------- 4. ENDPOINTS (RUTAS DE LA API) ----------------------

@app.get("/api/reporte", summary="Generar reporte filtrado usando Stored Procedure")
def generar_reporte(
    anio: int = Query(..., description="Año de búsqueda (ej. 2025)"),
    meses: Optional[List[str]] = Query(None, description="Lista de meses"),
    clientes: Optional[List[str]] = Query(None, description="Lista de clientes"),
    compradores: Optional[List[str]] = Query(None, description="Lista de compradores"),
    estatus: Optional[List[str]] = Query(None, description="Lista de estatus")
):
    # 1. Convertimos las listas de Python a textos separados por comas para SQL Server
    meses_str = None
    if meses:
        m_nums = [str(diccionario_meses[m]) for m in meses if m in diccionario_meses]
        if m_nums: 
            meses_str = ",".join(m_nums)
        
    clientes_str = ",".join(clientes) if clientes else None
    compradores_str = ",".join(compradores) if compradores else None
    
    estatus_str = None
    if estatus:
        e_nums = [str(diccionario_estatus[e]) for e in estatus if e in diccionario_estatus]
        if e_nums: 
            estatus_str = ",".join(e_nums)

    # 2. Llamamos al Procedimiento Almacenado
    query = """
        EXEC ObtenerReportePagos_Dashboard 
        @Anio = :anio, 
        @Meses = :meses, 
        @Clientes = :clientes, 
        @Compradores = :compradores, 
        @Estatus = :estatus
    """
    
    params = {
        "anio": anio, 
        "meses": meses_str, 
        "clientes": clientes_str, 
        "compradores": compradores_str, 
        "estatus": estatus_str
    }
    
    df = obtener_datos(query, params)

    if df.empty:
        return {"metricas": {"total_solicitudes": 0, "monto_acumulado": 0.0}, "registros": []}

    df['FECHARQ'] = df['FECHARQ'].astype(str)
    df = df.fillna("")

    return {
        "metricas": {
            "total_solicitudes": len(df),
            "monto_acumulado": float(df['TOTAL'].sum())
        },
        "registros": df.to_dict(orient="records")
    }

@app.get("/api/catalogos", summary="Obtener catálogos para filtros")
def get_catalogos():
    df_c = obtener_datos("SELECT DISTINCT NOMCLIENT FROM RQ_FLX_SOLICITUD WHERE NOMCLIENT IS NOT NULL")
    lista_c = sorted(df_c['NOMCLIENT'].astype(str).tolist()) if not df_c.empty else []
    
    df_comp = obtener_datos("SELECT DISTINCT CORREOSOLIC FROM RQ_FLX_SOLICITUD WHERE CORREOSOLIC IS NOT NULL")
    lista_comp = sorted(df_comp['CORREOSOLIC'].astype(str).tolist()) if not df_comp.empty else []
    
    return {
        "clientes": lista_c,
        "compradores": lista_comp,
        "meses": list(diccionario_meses.keys()),
        "estatus": list(diccionario_estatus.keys())
    }