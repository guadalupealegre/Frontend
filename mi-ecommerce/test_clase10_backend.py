import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.db.database import SessionLocal
from app.models.usuario import Usuario
from app.models.producto import Producto
from app.core.security import hash_password

client = TestClient(app)

# Firma JPG válida (Magic Numbers: b"\xff\xd8\xff\xe0...")
MAGIC_JPG_VALIDO = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x00\x60\x00\x00\xff\xfe\x00\x13Dulce Vicio Test Image"

def test_clase10():
    print("==================================================")
    print(" INICIANDO PRUEBAS DE BACKEND CLASE 10 - DULCE VICIO")
    print("==================================================")

    db = SessionLocal()
    try:
        # 1. Asegurar usuario admin y usuario cliente en la BD
        admin_email = "admin_test_c10@dulcevicio.com"
        cliente_email = "cliente_test_c10@dulcevicio.com"

        for em in [admin_email, cliente_email]:
            u = db.query(Usuario).filter(Usuario.email == em).first()
            if u:
                db.delete(u)
                db.commit()

        admin_user = Usuario(
            nombre="Admin Test C10",
            email=admin_email,
            hashed_password=hash_password("Admin123!"),
            rol="admin",
            activo=True,
            acepto_tratamiento=True,
        )
        cliente_user = Usuario(
            nombre="Cliente Test C10",
            email=cliente_email,
            hashed_password=hash_password("Cliente123!"),
            rol="cliente",
            activo=True,
            acepto_tratamiento=True,
        )
        db.add(admin_user)
        db.add(cliente_user)
        db.commit()

        # Obtener tokens
        res_admin_login = client.post("/auth/login", data={"username": admin_email, "password": "Admin123!"})
        token_admin = res_admin_login.json()["access_token"]
        headers_admin = {"Authorization": f"Bearer {token_admin}"}

        res_cliente_login = client.post("/auth/login", data={"username": cliente_email, "password": "Cliente123!"})
        token_cliente = res_cliente_login.json()["access_token"]
        headers_cliente = {"Authorization": f"Bearer {token_cliente}"}

        # Obtener o crear producto
        prod = db.query(Producto).first()
        assert prod is not None, "Debe existir al menos un producto"
        prod_id = prod.id
        print(f"[1] Producto objetivo: '{prod.nombre}' (ID: {prod_id})")

        # TEST A: Sin token -> 401 Unauthorized
        res_no_auth = client.post(f"/productos/{prod_id}/imagen", files={"archivo": ("test.jpg", MAGIC_JPG_VALIDO, "image/jpeg")})
        assert res_no_auth.status_code == 401, f"Sin token debe responder 401, respondió {res_no_auth.status_code}"
        print("[2] [OK] Petición sin token rechazada con 401 Unauthorized.")

        # TEST B: Token de cliente -> 403 Forbidden
        res_cliente_auth = client.post(f"/productos/{prod_id}/imagen", headers=headers_cliente, files={"archivo": ("test.jpg", MAGIC_JPG_VALIDO, "image/jpeg")})
        assert res_cliente_auth.status_code == 403, f"Token cliente debe responder 403, respondió {res_cliente_auth.status_code}"
        print("[3] [OK] Petición con usuario cliente rechazada con 403 Forbidden.")

        # TEST C: Extensión inválida (.txt) -> 415 Unsupported Media Type
        res_ext_invalida = client.post(f"/productos/{prod_id}/imagen", headers=headers_admin, files={"archivo": ("script.txt", b"print('hack')", "text/plain")})
        assert res_ext_invalida.status_code == 415, f"Extensión .txt debe responder 415, respondió {res_ext_invalida.status_code}"
        print("[4] [OK] Archivo .txt rechazado con 415 Unsupported Media Type.")

        # TEST D: Tamaño > 2 MB -> 413 Payload Too Large
        contenido_pesado = b"X" * (2 * 1024 * 1024 + 100)
        res_pesado = client.post(f"/productos/{prod_id}/imagen", headers=headers_admin, files={"archivo": ("gigante.jpg", contenido_pesado, "image/jpeg")})
        assert res_pesado.status_code == 413, f"Archivo > 2MB debe responder 413, respondió {res_pesado.status_code}"
        print("[5] [OK] Archivo de 2.1 MB rechazado con 413 Payload Too Large.")

        # TEST E: Archivo trampa (nombre .jpg pero contenido sin Magic Number) -> 415 Unsupported Media Type
        contenido_trampa = b"ESTO ES UN TEXTO DISFRAZADO DE FOTO Y NO TIENE MAGIC NUMBER"
        res_trampa = client.post(f"/productos/{prod_id}/imagen", headers=headers_admin, files={"archivo": ("foto_fake.jpg", contenido_trampa, "image/jpeg")})
        assert res_trampa.status_code == 415, f"Archivo trampa debe responder 415, respondió {res_trampa.status_code}"
        print("[6] [OK] Archivo trampa rechazado con 415 Unsupported Media Type por Magic Numbers.")

        # TEST F: Imagen válida con Admin Token -> 200 OK
        res_exito = client.post(f"/productos/{prod_id}/imagen", headers=headers_admin, files={"archivo": ("postre_real.jpg", MAGIC_JPG_VALIDO, "image/jpeg")})
        assert res_exito.status_code == 200, f"Subida exitosa falló con status {res_exito.status_code}: {res_exito.text}"
        data_prod = res_exito.json()
        assert data_prod["imagen_url"] is not None
        assert data_prod["imagen_url"].startswith("/static/productos/")
        print(f"[7] [OK] Subida exitosa -> 200 OK! URL generada: '{data_prod['imagen_url']}'")

        # TEST G: Verificación de acceso al estático /static/productos/...
        res_static = client.get(data_prod["imagen_url"])
        assert res_static.status_code == 200, f"No se pudo descargar la imagen estática: {res_static.status_code}"
        assert res_static.content == MAGIC_JPG_VALIDO
        print(f"[8] [OK] GET {data_prod['imagen_url']} -> 200 OK estático servido correctamente.")

        print("==================================================")
        print("  TODAS LAS PRUEBAS DE CLASE 10 PASARON CON ÉXITO! ")
        print("==================================================")

    finally:
        db.close()

if __name__ == "__main__":
    test_clase10()
