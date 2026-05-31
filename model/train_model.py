import os
import pickle
import pandas as pd

from scipy.sparse import hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "processed", "clean_products.csv")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")


def ensure_artifacts_dir():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)


def load_data():
    df = pd.read_csv(DATA_PATH)

    # Chỉ giữ các cột cần thiết
    required_columns = [
    "product_id",
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
    "clean_text_no_category",
    "clean_text_with_category",
]

    df = df[required_columns].copy()

    # Loại bỏ dòng thiếu product_id hoặc text
    df = df.dropna(subset=["product_id", "clean_text_no_category", "clean_text_with_category"])

    # Reset index để index khớp với ma trận TF-IDF
    df = df.reset_index(drop=True)

    return df


def build_vectorizer_and_matrix(text_series):
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english"
    )
    tfidf_matrix = vectorizer.fit_transform(text_series)
    return vectorizer, tfidf_matrix

def safe_text_series(series):
    """
    Chuyển dữ liệu text về dạng string an toàn.
    Tránh lỗi khi dữ liệu có NaN, None hoặc giá trị rỗng.
    """
    return series.fillna("").astype(str)


def build_category_text(df):
    """
    Tạo text category từ nhiều cột category.
    Mục đích: gom category_path và các cấp cat_level_1 -> cat_level_4
    để Weighted TF-IDF hiểu rõ hơn sản phẩm thuộc nhóm nào.
    """
    category_columns = [
        "category_path",
        "cat_level_1",
        "cat_level_2",
        "cat_level_3",
        "cat_level_4",
    ]

    category_text = (
        df[category_columns]
        .fillna("")
        .astype(str)
        .agg(" ".join, axis=1)
    )

    return category_text


def build_weighted_tfidf_with_category(
    df,
    name_weight=3.0,
    category_weight=2.0,
    about_weight=1.0,
    max_features_name=3000,
    max_features_category=3000,
    max_features_about=5000,
):
    """
    Weighted TF-IDF cho Content + Category.

    Ý tưởng:
    - product_name thường chứa thông tin quan trọng nhất về sản phẩm.
    - category giúp hệ thống gợi ý đúng nhóm sản phẩm hơn.
    - about_product có nhiều mô tả nhưng cũng có thể chứa nhiều từ nhiễu.
    
    Vì vậy ta train TF-IDF riêng cho từng phần:
    1. product_name
    2. category
    3. about_product

    Sau đó nhân trọng số rồi ghép các vector lại.
    """

    # =========================
    # 1. Chuẩn bị text đầu vào
    # =========================
    name_text = safe_text_series(df["product_name"])
    about_text = safe_text_series(df["about_product"])
    category_text = build_category_text(df)

    # =========================
    # 2. Tạo vectorizer riêng cho từng nhóm thông tin
    # =========================
    name_vectorizer = TfidfVectorizer(
        max_features=max_features_name,
        ngram_range=(1, 2),
        stop_words="english"
    )

    category_vectorizer = TfidfVectorizer(
        max_features=max_features_category,
        ngram_range=(1, 2),
        stop_words="english"
    )

    about_vectorizer = TfidfVectorizer(
        max_features=max_features_about,
        ngram_range=(1, 2),
        stop_words="english"
    )

    # =========================
    # 3. Fit-transform từng nhóm text
    # =========================
    name_matrix = name_vectorizer.fit_transform(name_text)
    category_matrix = category_vectorizer.fit_transform(category_text)
    about_matrix = about_vectorizer.fit_transform(about_text)

    # =========================
    # 4. Nhân trọng số cho từng nhóm đặc trưng
    # =========================
    weighted_name_matrix = name_matrix * name_weight
    weighted_category_matrix = category_matrix * category_weight
    weighted_about_matrix = about_matrix * about_weight

    # =========================
    # 5. Ghép các ma trận lại thành một ma trận Weighted TF-IDF
    # =========================
    weighted_matrix = hstack([
        weighted_name_matrix,
        weighted_category_matrix,
        weighted_about_matrix
    ])

    # Normalize để cosine similarity ổn định hơn
    weighted_matrix = normalize(weighted_matrix, norm="l2", axis=1)

    # Lưu nhiều vectorizer trong một dict
    weighted_vectorizers = {
        "name_vectorizer": name_vectorizer,
        "category_vectorizer": category_vectorizer,
        "about_vectorizer": about_vectorizer,
        "weights": {
            "product_name": name_weight,
            "category": category_weight,
            "about_product": about_weight,
        },
        "max_features": {
            "product_name": max_features_name,
            "category": max_features_category,
            "about_product": max_features_about,
        }
    }

    return weighted_vectorizers, weighted_matrix

def save_pickle(file_name, obj):
    file_path = os.path.join(ARTIFACTS_DIR, file_name)
    with open(file_path, "wb") as f:
        pickle.dump(obj, f)


def main():
    print("Đang tạo thư mục artifacts...")
    ensure_artifacts_dir()

    print("Đang load dữ liệu...")
    df = load_data()
    print(f"Số lượng sản phẩm dùng để train: {len(df)}")

    # =========================
    # Model 1: Không category
    # =========================
    print("Đang train TF-IDF cho mode KHÔNG category...")
    vectorizer_no_cat, matrix_no_cat = build_vectorizer_and_matrix(df["clean_text_no_category"])

    # =========================
    # Model 2: Có category - Weighted TF-IDF
    # =========================
    print("Đang train Weighted TF-IDF cho mode CÓ category...")

    vectorizer_with_cat, matrix_with_cat = build_weighted_tfidf_with_category(
        df,
        name_weight=3.0,
        category_weight=2.0,
        about_weight=1.0,
        max_features_name=3000,
        max_features_category=3000,
        max_features_about=5000,
    )

    # =========================
    # Metadata để tra cứu sản phẩm
    # =========================
    metadata = df.to_dict(orient="records")

    product_id_to_index = {
        row["product_id"]: idx
        for idx, row in enumerate(metadata)
    }

    # =========================
    # Lưu artifacts
    # =========================
    print("Đang lưu artifacts...")
    save_pickle("vectorizer_no_category.pkl", vectorizer_no_cat)
    save_pickle("vectorizer_with_category.pkl", vectorizer_with_cat)
    save_pickle("tfidf_matrix_no_category.pkl", matrix_no_cat)
    save_pickle("tfidf_matrix_with_category.pkl", matrix_with_cat)
    save_pickle("product_metadata.pkl", metadata)
    save_pickle("product_id_to_index.pkl", product_id_to_index)

    print("Train xong và đã lưu artifacts vào model/artifacts/")


if __name__ == "__main__":
    main()