from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import Base, engine
from backend.app.routes.products import router as products_router
from backend.app.routes.recommend import router as recommend_router
from backend.app.routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="B12 Product Recommendation API",
    version="1.0.0",
    description="API cho hệ thống gợi ý sản phẩm theo category"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(recommend_router)


@app.get("/")
def root():
    return {"message": "Backend FastAPI đang chạy"}


@app.get("/health")
def health_check():
    return {"status": "ok"}