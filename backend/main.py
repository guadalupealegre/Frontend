from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import Base, engine, get_db
import models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/productos", response_model=list[schemas.Producto])
def listar_productos(db: Session = Depends(get_db)):
    return db.query(models.Producto).all()

@app.post("/productos", response_model=schemas.Producto)
def crear_producto(producto: schemas.ProductoCrear, db: Session = Depends(get_db)):
    db_producto = models.Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto