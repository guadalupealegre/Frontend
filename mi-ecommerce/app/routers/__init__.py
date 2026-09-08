from app.routers.auth import router as auth_router
from app.routers.productos import router as productos_router
from app.routers.pedidos import router as pedidos_router

__all__ = ["auth_router", "productos_router", "pedidos_router"]
