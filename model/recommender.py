import os
import pickle
import math
import numpy as np

from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")


def load_pickle(file_name):
    file_path = os.path.join(ARTIFACTS_DIR, file_name)
    with open(file_path, "rb") as f:
        return pickle.load(f)


print("Đang load artifacts cho recommender...")

vectorizer_no_category = load_pickle("vectorizer_no_category.pkl")
vectorizer_with_category = load_pickle("vectorizer_with_category.pkl")

tfidf_matrix_no_category = load_pickle("tfidf_matrix_no_category.pkl")
tfidf_matrix_with_category = load_pickle("tfidf_matrix_with_category.pkl")

product_metadata = load_pickle("product_metadata.pkl")
product_id_to_index = load_pickle("product_id_to_index.pkl")

print("Load artifacts thành công.")


def safe_float(value, default=0.0):
    try:
        if value is None:
            return default
        value_str = str(value).strip().lower()
        if value_str in ["", "nan", "none", "null", "undefined"]:
            return default
        return float(value)
    except Exception:
        return default


def safe_int(value, default=0):
    try:
        if value is None:
            return default
        value_str = str(value).strip().lower()
        if value_str in ["", "nan", "none", "null", "undefined"]:
            return default
        # rating_count trong một số data có thể là chuỗi số
        return int(float(value))
    except Exception:
        return default


def normalize_rating(rating):
    """
    Giả sử rating nằm khoảng 0 -> 5
    """
    rating_value = safe_float(rating, 0.0)
    normalized = rating_value / 5.0
    return max(0.0, min(normalized, 1.0))


def normalize_popularity(rating_count):
    """
    Dùng log để giảm lệch cho rating_count
    """
    count = safe_int(rating_count, 0)
    log_value = math.log1p(count)

    # scale mềm, tránh sản phẩm quá popular lấn át hết
    # log1p(100000) ~ 11.5
    normalized = log_value / 12.0
    return max(0.0, min(normalized, 1.0))


def get_product_by_index(index: int):
    return product_metadata[index]


def build_product_response(product_info, similarity_score=None, final_score=None):
    return {
        "product_id": product_info["product_id"],
        "product_name": product_info["product_name"],
        "category_path": product_info["category_path"],
        "rating": product_info["rating"],
        "rating_count": product_info["rating_count"],
        "about_product": product_info["about_product"],
        "img_link": product_info["img_link"],
        "product_link": product_info["product_link"],
        "cat_level_1": product_info.get("cat_level_1"),
        "cat_level_2": product_info.get("cat_level_2"),
        "cat_level_3": product_info.get("cat_level_3"),
        "cat_level_4": product_info.get("cat_level_4"),
        "similarity_score": float(similarity_score) if similarity_score is not None else None,
        "final_score": float(final_score) if final_score is not None else None,
    }


def recommend_similar(
    product_id: str,
    use_category: bool = True,
    top_k: int = 10,
    mode: str = "content"
):
    """
    mode:
    - content: dùng similarity thuần
    - hybrid: similarity + rating + popularity
    """

    if product_id not in product_id_to_index:
        return {
            "error": f"Không tìm thấy product_id: {product_id}"
        }

    product_index = product_id_to_index[product_id]

    if use_category:
        tfidf_matrix = tfidf_matrix_with_category
    else:
        tfidf_matrix = tfidf_matrix_no_category

    source_vector = tfidf_matrix[product_index]
    similarity_scores = cosine_similarity(source_vector, tfidf_matrix).flatten()

    source_product = get_product_by_index(product_index)

    candidates = []

    for idx, similarity_score in enumerate(similarity_scores):
        if idx == product_index:
            continue

        product_info = get_product_by_index(idx)

        if mode == "hybrid":
            rating_score = normalize_rating(product_info.get("rating"))
            popularity_score = normalize_popularity(product_info.get("rating_count"))

            final_score = (
                0.75 * float(similarity_score)
                + 0.15 * rating_score
                + 0.10 * popularity_score
            )
        else:
            final_score = float(similarity_score)

        candidates.append({
            "index": idx,
            "similarity_score": float(similarity_score),
            "final_score": float(final_score),
            "product_info": product_info
        })

    # sort theo final_score
    candidates = sorted(candidates, key=lambda x: x["final_score"], reverse=True)

    recommendations = []
    for item in candidates[:top_k]:
        recommendations.append(
            build_product_response(
                product_info=item["product_info"],
                similarity_score=item["similarity_score"],
                final_score=item["final_score"]
            )
        )

    return {
        "source_product": build_product_response(source_product),
        "use_category": use_category,
        "top_k": top_k,
        "mode": mode,
        "recommendations": recommendations
    }