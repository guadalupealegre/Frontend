from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Producto(BaseModel):
    id: int
    nombre: str
    precio_final: float
    cuotas_cantidad: int
    cuotas_valor: float
    garantia_meses: int
    stock: int

productos_db = [
    Producto(id=1, nombre="Teclado Mecanico RGB", precio_final=45000.0, cuotas_cantidad=6, cuotas_valor=7500.0, garantia_meses=12, stock=15),
    Producto(id=2, nombre="Mouse Gamer Inalambrico", precio_final=25000.0, cuotas_cantidad=3, cuotas_valor=8333.33, garantia_meses=6, stock=20),
    Producto(id=3, nombre="Auriculares Bluetooth", precio_final=32000.0, cuotas_cantidad=12, cuotas_valor=2666.66, garantia_meses=3, stock=8)
]

@app.get("/productos")
def listar_productos():
    return productos_db

@app.post("/productos")
def crear_producto(producto: Producto):
    productos_db.append(producto)
    return producto
