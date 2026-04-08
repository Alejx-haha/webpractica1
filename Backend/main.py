from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional, List

# =====================
# CONFIG
# =====================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# DATABASE (SQLite local)
# =====================
DATABASE_URL = "sqlite:///./ecommerce.db"
engine = create_engine(DATABASE_URL, echo=True)


def create_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


# =====================
# MODEL
# =====================
class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    image_url: Optional[str] = None


# =====================
# STARTUP
# =====================
@app.on_event("startup")
def on_startup():
    create_db()


# =====================
# CRUD ENDPOINTS
# =====================

@app.post("/products", response_model=Product)
def create_product(product: Product):
    with Session(engine) as session:
        session.add(product)
        session.commit()
        session.refresh(product)
        return product


@app.get("/products", response_model=List[Product])
def get_products():
    with Session(engine) as session:
        return session.exec(select(Product)).all()


@app.get("/products/{id}", response_model=Product)
def get_product(id: int):
    with Session(engine) as session:
        product = session.get(Product, id)
        if not product:
            raise HTTPException(status_code=404, detail="No encontrado")
        return product


@app.put("/products/{id}", response_model=Product)
def update_product(id: int, data: Product):
    with Session(engine) as session:
        product = session.get(Product, id)
        if not product:
            raise HTTPException(status_code=404, detail="No encontrado")

        product.name = data.name
        product.description = data.description
        product.price = data.price
        product.stock = data.stock
        product.image_url = data.image_url

        session.commit()
        session.refresh(product)
        return product


@app.delete("/products/{id}")
def delete_product(id: int):
    with Session(engine) as session:
        product = session.get(Product, id)
        if not product:
            raise HTTPException(status_code=404, detail="No encontrado")

        session.delete(product)
        session.commit()
        return {"message": "Eliminado"}