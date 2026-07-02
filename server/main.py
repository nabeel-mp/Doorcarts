# main.py
from fastapi import FastAPI
from sqladmin import Admin, ModelView
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Boolean, Integer
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from contextlib import asynccontextmanager
DATABASE_URL = "postgresql+asyncpg://postgres:321321@localhost/doorcarts"

engine = create_async_engine(DATABASE_URL)

class Base(DeclarativeBase):
    pass

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        if form["username"] == "admin" and form["password"] == "secret123":
            request.session.update({"token": "admin-logged-in"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return "token" in request.session
# --- Your models ---

authentication_backend = AdminAuth(secret_key="semigoldednaturesync")

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200), unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer: Mapped[str] = mapped_column(String(100))
    total: Mapped[int] = mapped_column(Integer)

# --- Admin views (one class per model) ---

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.name, User.email, User.is_active]
    column_searchable_list = [User.name, User.email]
    column_sortable_list = [User.id, User.name]
    page_size = 20
    icon = "fa-solid fa-user"

class OrderAdmin(ModelView, model=Order):
    column_list = [Order.id, Order.customer, Order.total]
    column_searchable_list = [Order.customer]
    icon = "fa-solid fa-cart-shopping"

# --- App setup ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs on startup to create the tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Anything after yield runs on shutdown

app = FastAPI(lifespan=lifespan)

admin = Admin(
    app,
    engine,
    title="My App Admin",
    authentication_backend=authentication_backend
)
admin.add_view(UserAdmin)
admin.add_view(OrderAdmin)

@app.get("/")
async def root():
    return {"message": "API is running"}