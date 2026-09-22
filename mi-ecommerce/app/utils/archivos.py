import secrets
import os

MAGIC_NUMBERS = {
    'jpg': b"\xff\xd8\xff",
    'png': b"\x89PNG\r\n\x1a\n",
    'webp': b"RIFF",
}


def parece_imagen(contenido: bytes) -> bool:
    """
    Verifica las firmas mágicas (Magic Numbers) de archivos de imagen reales:
    - JPG / JPEG: b"\xff\xd8\xff"
    - PNG: b"\x89PNG\r\n\x1a\n"
    - WEBP: b"RIFF"
    
    Previene archivos trampa (scripts o texto renombrados a .jpg/.png).
    """
    if not contenido:
        return False

    if contenido.startswith(b"\xff\xd8\xff"):
        return True
    if contenido.startswith(b"\x89PNG\r\n\x1a\n"):
        return True
    if contenido.startswith(b"RIFF"):
        return True

    return False


def generar_nombre_seguro(producto_id: int, extension: str) -> str:
    """
    Genera un nombre de archivo único y seguro usando secrets.token_hex(8).
    NUNCA utiliza el nombre original subido por el cliente (archivo.filename)
    para evitar vulnerabilidades de Path Traversal o Remote Code Execution.
    """
    token = secrets.token_hex(8)
    ext = extension.lower()
    if not ext.startswith('.'):
        ext = f".{ext}"
    return f"producto_{producto_id}_{token}{ext}"
