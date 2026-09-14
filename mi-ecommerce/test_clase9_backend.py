"""
Script de verificación integral para la Clase 9 de Dulce Vicio:
1. Crear un pedido con un usuario cliente de prueba.
2. Comprobar stock antes y después.
3. Revocar el pedido -> 201 Created con código ARR-YYYYMMDD-XXXXXX y reposición de stock.
4. Intentar revocar nuevamente -> 409 Conflict.
5. Consultar /usuarios/me/datos -> 200 OK con revocaciones y pedidos.
6. Exportar /usuarios/me/exportar -> 200 OK con JSON adjunto.
7. Dar de baja la cuenta (DELETE /usuarios/me) -> 200 OK, usuario anonimizado, activo=False.
8. Verificar que el token sea rechazado con 401 Unauthorized.
"""
import os
import sys
from datetime import datetime, timezone
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.db.database import SessionLocal
from app.models.usuario import Usuario
from app.models.producto import Producto
from app.models.pedido import Pedido
from app.models.solicitud_revocacion import SolicitudRevocacion
from app.core.security import hash_password

client = TestClient(app)


def test_clase9():
    print("==================================================")
    print(" INICIANDO PRUEBAS DE BACKEND CLASE 9 - DULCE VICIO")
    print("==================================================")

    db = SessionLocal()
    try:
        # 1. Crear o reiniciar usuario de prueba específico para el test
        test_email = "test_clase9@dulcevicio.com"
        usuario_existente = db.query(Usuario).filter(Usuario.email == test_email).first()
        if usuario_existente:
            db.delete(usuario_existente)
            db.commit()

        test_user = Usuario(
            nombre="Comprador Pruebas Clase 9",
            email=test_email,
            hashed_password=hash_password("Password123!"),
            rol="cliente",
            activo=True,
            acepto_tratamiento=True,
            fecha_consentimiento=datetime.now(timezone.utc),
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        # 2. Obtener un producto para comprar
        producto = db.query(Producto).first()
        assert producto is not None, "Debe haber al menos un producto en la base de datos"
        stock_inicial = producto.stock
        producto_id = producto.id
        print(f"[1] Producto de prueba: '{producto.nombre}' (ID: {producto_id}) - Stock inicial: {stock_inicial}")

        # 3. Iniciar sesión con el usuario de prueba
        res_login = client.post(
            "/auth/login",
            data={"username": test_email, "password": "Password123!"},
        )
        assert res_login.status_code == 200, f"Login falló: {res_login.text}"
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[2] Login exitoso -> Token obtenido.")

        # 4. Crear un pedido de 2 unidades
        cantidad_a_comprar = 2
        res_pedido = client.post(
            "/pedidos/",
            headers=headers,
            json={"items": [{"producto_id": producto_id, "cantidad": cantidad_a_comprar}]},
        )
        assert res_pedido.status_code == 201, f"Creación de pedido falló: {res_pedido.text}"
        pedido_id = res_pedido.json()["id"]
        
        # Verificar descuento de stock en BD
        db.expire_all()
        prod_despues = db.query(Producto).filter(Producto.id == producto_id).first()
        assert prod_despues.stock == stock_inicial - cantidad_a_comprar, "El stock no fue descontado correctamente"
        print(f"[3] Pedido #{pedido_id} creado con éxito. Stock restante: {prod_despues.stock} (Descontó {cantidad_a_comprar} u.)")

        # 5. Revocar el pedido -> debe devolver 201 Created con código ARR-YYYYMMDD-XXXXXX
        res_revocacion = client.post(
            f"/pedidos/{pedido_id}/revocacion",
            headers=headers,
        )
        assert res_revocacion.status_code == 201, f"Revocación falló con código {res_revocacion.status_code}: {res_revocacion.text}"
        datos_rev = res_revocacion.json()
        codigo_arr = datos_rev["codigo"]
        assert codigo_arr.startswith("ARR-"), f"Código no tiene prefijo ARR-: {codigo_arr}"
        print(f"[4] [OK] Revocación exitosa -> 201 Created! Código generado: {codigo_arr}")

        # Verificar que el stock fue reintegrado en BD y el pedido está cancelado
        db.expire_all()
        prod_reincorporado = db.query(Producto).filter(Producto.id == producto_id).first()
        pedido_db = db.query(Pedido).filter(Pedido.id == pedido_id).first()
        assert prod_reincorporado.stock == stock_inicial, f"El stock no fue repuesto: {prod_reincorporado.stock} != {stock_inicial}"
        assert pedido_db.estado == "cancelado", f"El pedido no quedó cancelado: {pedido_db.estado}"
        print(f"    -> Stock repuesto correctamente a {prod_reincorporado.stock} unidades.")
        print(f"    -> Estado del pedido en BD: '{pedido_db.estado}'.")

        # 6. Intentar revocar nuevamente el mismo pedido -> debe devolver 409 Conflict
        res_reintento = client.post(
            f"/pedidos/{pedido_id}/revocacion",
            headers=headers,
        )
        assert res_reintento.status_code == 409, f"Se esperaba 409 pero respondió {res_reintento.status_code}: {res_reintento.text}"
        print(f"[5] [OK] Reintento de revocación rechazado con 409 Conflict: '{res_reintento.json().get('detail')}'")

        # 7. Consultar /usuarios/me/datos (Portabilidad y Acceso)
        res_datos = client.get("/usuarios/me/datos", headers=headers)
        assert res_datos.status_code == 200, f"Consulta de datos falló: {res_datos.text}"
        datos_usuario = res_datos.json()
        assert len(datos_usuario["pedidos"]) >= 1, "Debe incluir los pedidos"
        assert len(datos_usuario["solicitudes_revocacion"]) >= 1, "Debe incluir las revocaciones"
        print(f"[6] [OK] GET /usuarios/me/datos -> 200 OK (Pedidos: {len(datos_usuario['pedidos'])}, Revocaciones: {len(datos_usuario['solicitudes_revocacion'])})")

        # 8. Exportar /usuarios/me/exportar (Descarga de JSON)
        res_exportar = client.get("/usuarios/me/exportar", headers=headers)
        assert res_exportar.status_code == 200, f"Exportación falló: {res_exportar.text}"
        assert "attachment; filename=\"mis_datos.json\"" in res_exportar.headers.get("content-disposition", "")
        print(f"[7] [OK] GET /usuarios/me/exportar -> 200 OK con Content-Disposition attachment.")

        # 9. Dar de baja la cuenta (DELETE /usuarios/me)
        res_baja = client.delete("/usuarios/me", headers=headers)
        assert res_baja.status_code == 200, f"Baja de cuenta falló: {res_baja.text}"
        print(f"[8] [OK] DELETE /usuarios/me -> 200 OK: {res_baja.json().get('mensaje')}")

        # Comprobar en BD la anonimización: fila conservada, nombre/email anonimizados, activo=False
        db.expire_all()
        usr_anonimo = db.query(Usuario).filter(Usuario.id == test_user.id).first()
        assert usr_anonimo is not None, "La fila del usuario NO debe eliminarse de la BD"
        assert usr_anonimo.activo is False, "El usuario debe quedar inactivo (activo=False)"
        assert usr_anonimo.fecha_baja is not None, "Debe registrarse fecha_baja"
        assert f"usuario_baja_{test_user.id}@anonimo.com" == usr_anonimo.email, f"Email no fue anonimizado: {usr_anonimo.email}"
        assert len(usr_anonimo.pedidos) >= 1, "Los pedidos históricos deben permanecer intactos"
        print(f"    -> Verificación BD: Nombre='{usr_anonimo.nombre}', Email='{usr_anonimo.email}', Activo={usr_anonimo.activo}, Pedidos={len(usr_anonimo.pedidos)}")

        # 10. Intentar autenticar con token del usuario dado de baja -> debe responder 401 Unauthorized
        res_me_baja = client.get("/auth/me", headers=headers)
        assert res_me_baja.status_code == 401, f"Se esperaba 401 pero respondió {res_me_baja.status_code}"
        print(f"[9] [OK] get_current_user rechazó al usuario inactivo con 401 Unauthorized: '{res_me_baja.json().get('detail')}'")

        print("==================================================")
        print("  TODAS LAS PRUEBAS DE BACKEND PASARON CON ÉXITO!  ")
        print("==================================================")

    finally:
        db.close()


if __name__ == "__main__":
    test_clase9()
