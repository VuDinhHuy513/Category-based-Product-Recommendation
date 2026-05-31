import os
import sys
import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.database import SessionLocal, Base, engine
from backend.app.models import Product


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "clean_products.csv")


def clean_text(value):
    if pd.isna(value):
        return None

    value = str(value).strip()

    if value.lower() in ["nan", "none", "null", ""]:
        return None

    return value


def clean_float(value):
    try:
        if pd.isna(value):
            return None

        return float(str(value).replace(",", "").strip())
    except Exception:
        return None


def clean_int(value):
    try:
        if pd.isna(value):
            return None

        return int(float(str(value).replace(",", "").strip()))
    except Exception:
        return None


def main():
    Base.metadata.create_all(bind=engine)

    df = pd.read_csv(CSV_PATH)
    db = SessionLocal()

    try:
        for _, row in df.iterrows():
            product_id = clean_text(row.get("product_id"))

            if not product_id:
                continue

            product = db.query(Product).filter(Product.product_id == product_id).first()

            if product is None:
                product = Product(product_id=product_id)
                db.add(product)

            product.product_name = clean_text(row.get("product_name"))
            product.category_path = clean_text(row.get("category_path"))
            product.rating = clean_float(row.get("rating"))
            product.rating_count = clean_int(row.get("rating_count"))
            product.about_product = clean_text(row.get("about_product"))
            product.img_link = clean_text(row.get("img_link"))
            product.product_link = clean_text(row.get("product_link"))

            product.cat_level_1 = clean_text(row.get("cat_level_1"))
            product.cat_level_2 = clean_text(row.get("cat_level_2"))
            product.cat_level_3 = clean_text(row.get("cat_level_3"))
            product.cat_level_4 = clean_text(row.get("cat_level_4"))

            product.clean_text_no_category = clean_text(row.get("clean_text_no_category"))
            product.clean_text_with_category = clean_text(row.get("clean_text_with_category"))

        db.commit()
        print(f"Import thành công {len(df)} sản phẩm vào MySQL")
    finally:
        db.close()


if __name__ == "__main__":
    main()