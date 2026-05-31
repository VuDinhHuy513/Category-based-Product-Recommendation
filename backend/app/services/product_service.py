from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.app.models import Product


def product_to_dict(product: Product):
    return {
        "product_id": product.product_id,
        "product_name": product.product_name,
        "category_path": product.category_path,
        "rating": product.rating,
        "rating_count": product.rating_count,
        "about_product": product.about_product,
        "img_link": product.img_link,
        "product_link": product.product_link,
        "cat_level_1": product.cat_level_1,
        "cat_level_2": product.cat_level_2,
        "cat_level_3": product.cat_level_3,
        "cat_level_4": product.cat_level_4,
    }


def get_all_products(
    db: Session,
    search: str = None,
    category: str = None,
    limit: int = 20,
    offset: int = 0,
):
    query = db.query(Product)

    if search:
        search_like = f"%{search}%"
        query = query.filter(
            or_(
                Product.product_name.like(search_like),
                Product.about_product.like(search_like),
            )
        )

    if category:
        query = query.filter(
            or_(
                Product.cat_level_1 == category,
                Product.cat_level_2 == category,
                Product.cat_level_3 == category,
                Product.cat_level_4 == category,
            )
        )

    total = query.count()

    products = (
        query
        .order_by(Product.id.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "products": [product_to_dict(product) for product in products],
    }


def get_product_by_id(db: Session, product_id: str):
    product = db.query(Product).filter(Product.product_id == product_id).first()

    if product is None:
        return None

    return product_to_dict(product)


def get_products_by_ids(db: Session, product_ids: list[str]):
    products = db.query(Product).filter(Product.product_id.in_(product_ids)).all()

    return {
        product.product_id: product_to_dict(product)
        for product in products
    }


def get_all_categories(db: Session):
    products = db.query(
        Product.cat_level_1,
        Product.cat_level_2,
        Product.cat_level_3,
        Product.cat_level_4,
    ).all()

    cat_level_1 = set()
    cat_level_2 = set()
    cat_level_3 = set()
    cat_level_4 = set()

    for product in products:
        if product.cat_level_1:
            cat_level_1.add(product.cat_level_1)
        if product.cat_level_2:
            cat_level_2.add(product.cat_level_2)
        if product.cat_level_3:
            cat_level_3.add(product.cat_level_3)
        if product.cat_level_4:
            cat_level_4.add(product.cat_level_4)

    return {
        "cat_level_1": sorted(cat_level_1),
        "cat_level_2": sorted(cat_level_2),
        "cat_level_3": sorted(cat_level_3),
        "cat_level_4": sorted(cat_level_4),
    }


def update_product(db: Session, product_id: str, update_data: dict):
    product = db.query(Product).filter(Product.product_id == product_id).first()

    if product is None:
        return None

    allowed_fields = [
        "product_name",
        "category_path",
        "rating",
        "rating_count",
        "about_product",
        "img_link",
        "product_link",
        "cat_level_1",
        "cat_level_2",
        "cat_level_3",
        "cat_level_4",
    ]

    for field in allowed_fields:
        if field in update_data:
            setattr(product, field, update_data[field])

    db.commit()
    db.refresh(product)

    return product_to_dict(product)