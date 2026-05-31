from typing import Optional

from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.auth import require_manager
from backend.app.services.product_service import (
    get_all_products,
    get_product_by_id,
    get_all_categories,
    update_product,
)

router = APIRouter(prefix="/api/products", tags=["Products"])


class ProductUpdateRequest(BaseModel):
    product_name: Optional[str] = None
    category_path: Optional[str] = None
    rating: Optional[float] = None
    rating_count: Optional[int] = None
    about_product: Optional[str] = None
    img_link: Optional[str] = None
    product_link: Optional[str] = None
    cat_level_1: Optional[str] = None
    cat_level_2: Optional[str] = None
    cat_level_3: Optional[str] = None
    cat_level_4: Optional[str] = None


@router.get("/")
def list_products(
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return get_all_products(
        db=db,
        search=search,
        category=category,
        limit=limit,
        offset=offset,
    )


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    return get_all_categories(db)


@router.get("/{product_id}")
def product_detail(product_id: str, db: Session = Depends(get_db)):
    product = get_product_by_id(db, product_id)

    if product is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")

    return product


@router.put("/{product_id}")
def update_product_detail(
    product_id: str,
    payload: ProductUpdateRequest,
    db: Session = Depends(get_db),
    current_manager=Depends(require_manager),
):
    updated_product = update_product(
        db=db,
        product_id=product_id,
        update_data=payload.dict(exclude_unset=True),
    )

    if updated_product is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")

    return {
        "message": "Cập nhật sản phẩm thành công",
        "product": updated_product,
    }