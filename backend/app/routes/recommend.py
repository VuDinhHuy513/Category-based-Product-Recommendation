from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.product_service import get_products_by_ids
from model.recommender import recommend_similar

router = APIRouter(prefix="/api/recommend", tags=["Recommend"])


class RecommendRequest(BaseModel):
    product_id: str
    use_category: bool = True
    top_k: int = 10
    mode: str = "content"


def enrich_recommendation_result(result: dict, db: Session):
    if "error" in result:
        return result

    product_ids = []

    source_product = result.get("source_product")
    if source_product:
        product_ids.append(source_product["product_id"])

    for item in result.get("recommendations", []):
        product_ids.append(item["product_id"])

    product_map = get_products_by_ids(db, product_ids)

    if source_product and source_product["product_id"] in product_map:
        source_product.update(product_map[source_product["product_id"]])

    for item in result.get("recommendations", []):
        product_id = item["product_id"]

        if product_id in product_map:
            item.update(product_map[product_id])

    return result


@router.post("/similar")
def recommend_products(
    payload: RecommendRequest,
    db: Session = Depends(get_db),
):
    result = recommend_similar(
        product_id=payload.product_id,
        use_category=payload.use_category,
        top_k=payload.top_k,
        mode=payload.mode,
    )

    return enrich_recommendation_result(result, db)