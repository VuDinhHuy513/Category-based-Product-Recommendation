# Product Recommendation Web App - Đồ án 2

## 1. Giới thiệu

Đây là project Đồ án 2 kết hợp **Machine Learning** và **Công nghệ Web**. Hệ thống xây dựng một website hiển thị sản phẩm và tích hợp chức năng **gợi ý sản phẩm tương tự** dựa trên nội dung sản phẩm.

Bài toán chính của project là **Category-based Product Recommendation**. Hệ thống sử dụng thông tin mô tả sản phẩm và danh mục sản phẩm để tìm ra các sản phẩm có độ tương đồng cao với sản phẩm người dùng đang xem.

## 2. Chức năng chính

### Người dùng

- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Đăng nhập / đăng xuất
- Nhận gợi ý sản phẩm tương tự
- Xem sản phẩm theo giao diện card

### Admin

- Xem danh sách sản phẩm ở trang quản trị
- Thêm sản phẩm
- Sửa thông tin sản phẩm
- Xóa sản phẩm
- Quay lại trang sản phẩm dành cho người dùng

### Phân tích / thống kê

- Trang analytics hiển thị thông tin tổng quan về sản phẩm
- Hỗ trợ trực quan hóa dữ liệu phục vụ đánh giá hệ thống

## 3. Machine Learning

Project sử dụng hướng tiếp cận **Content-Based Recommendation**.

Các đặc trưng được sử dụng gồm:

- Tên sản phẩm
- Mô tả sản phẩm
- Danh mục sản phẩm
- Nội dung kết hợp giữa `content` và `category`

Các phương pháp có thể được sử dụng hoặc so sánh trong project:

- TF-IDF không dùng category
- TF-IDF có dùng category
- Weighted TF-IDF
- Cosine Similarity để tính độ tương đồng giữa các sản phẩm

### Quy trình gợi ý sản phẩm

1. Đọc dữ liệu sản phẩm từ file CSV.
2. Tiền xử lý dữ liệu.
3. Kết hợp thông tin mô tả và danh mục sản phẩm.
4. Vector hóa sản phẩm bằng TF-IDF hoặc phương pháp embedding khác.
5. Tính cosine similarity giữa sản phẩm hiện tại và các sản phẩm còn lại.
6. Trả về danh sách Top-N sản phẩm tương tự.

## 4. Công nghệ sử dụng

### Backend

- Python
- FastAPI
- SQLAlchemy
- MySQL
- Uvicorn

### Frontend

- HTML
- CSS
- JavaScript

### Machine Learning

- pandas
- numpy
- scikit-learn
- joblib
- TF-IDF
- Cosine Similarity

## 5. Cấu trúc thư mục

```bash
DA2/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── auth.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── products.py
│   │       └── recommend.py
│   │
│   ├── scripts/
│   │   ├── init_db.py
│   │   └── import_products.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── pages/
│   │   ├── products.html
│   │   ├── product-detail.html
│   │   ├── admin-products.html
│   │   ├── analytics.html
│   │   └── login.html
│   │
│   ├── css/
│   │   ├── base.css
│   │   ├── products.css
│   │   ├── detail.css
│   │   ├── analytics.css
│   │   └── login.css
│   │
│   └── js/
│       ├── api.js
│       ├── products.js
│       ├── product-detail.js
│       ├── admin-products.js
│       ├── analytics.js
│       └── login.js
│
├── model/
│   ├── train_model.py
│   ├── recommender.py
│   ├── test_recommender.py
│   └── artifacts/
│       ├── product_metadata.pkl
│       ├── product_id_to_index.pkl
│       ├── tfidf_matrix_no_category.pkl
│       ├── tfidf_matrix_with_category.pkl
│       ├── vectorizer_no_category.pkl
│       └── vectorizer_with_category.pkl
│
├── data/
│   ├── raw/
│   │   └── amazon.csv
│   └── processed/
│       └── clean_products.csv
│
└── README.md
```

## 6. Cài đặt project

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### Bước 2: Tạo môi trường ảo Python

```bash
cd backend
python -m venv .venv
```

Kích hoạt môi trường ảo trên Windows:

```bash
.venv\Scripts\activate
```

Kích hoạt môi trường ảo trên macOS/Linux:

```bash
source .venv/bin/activate
```

### Bước 3: Cài đặt thư viện backend

```bash
pip install -r requirements.txt
```

### Bước 4: Cấu hình database

Tạo database MySQL, ví dụ:

```sql
CREATE DATABASE da2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Sau đó kiểm tra và chỉnh thông tin kết nối database trong file:

```bash
backend/app/database.py
```

Các thông tin cần kiểm tra thường gồm:

- Host
- Port
- Username
- Password
- Database name

### Bước 5: Khởi tạo database

Chạy script tạo bảng:

```bash
python scripts/init_db.py
```

Import dữ liệu sản phẩm:

```bash
python scripts/import_products.py
```

## 7. Train lại model gợi ý

Nếu dữ liệu sản phẩm thay đổi hoặc muốn cập nhật thuật toán gợi ý, chạy:

```bash
cd model
python train_model.py
```

Sau khi chạy xong, các file model sẽ được lưu trong thư mục:

```bash
model/artifacts/
```

Các file `.pkl` này được backend sử dụng để trả về danh sách sản phẩm gợi ý.

## 8. Chạy backend

Từ thư mục `backend`, chạy lệnh:

```bash
uvicorn app.main:app --reload
```

Backend mặc định chạy tại:

```bash
http://127.0.0.1:8000
```

Có thể xem tài liệu API tự động của FastAPI tại:

```bash
http://127.0.0.1:8000/docs
```

## 9. Chạy frontend

Mở thư mục `frontend/pages` và chạy file:

```bash
products.html
```

Nên mở bằng extension **Live Server** trong Visual Studio Code để tránh lỗi đường dẫn hoặc lỗi gọi API.

Các trang chính:

- `products.html`: trang danh sách sản phẩm
- `product-detail.html`: trang chi tiết sản phẩm
- `admin-products.html`: trang quản trị sản phẩm
- `analytics.html`: trang thống kê
- `login.html`: trang đăng nhập

## 10. API chính

Một số nhóm API chính của hệ thống:

### Auth

```http
POST /login
```

Dùng để đăng nhập người dùng hoặc admin.

### Products

```http
GET /products
GET /products/{product_id}
POST /products
PUT /products/{product_id}
DELETE /products/{product_id}
```

Dùng để lấy danh sách sản phẩm, xem chi tiết, thêm, sửa và xóa sản phẩm.

### Recommendation

```http
GET /recommend/{product_id}
```

Dùng để lấy danh sách sản phẩm được gợi ý dựa trên sản phẩm hiện tại.

## 11. Ghi chú khi phát triển

Nếu chỉ sửa giao diện HTML/CSS/JavaScript thì không cần train lại model.

Nếu sửa dữ liệu sản phẩm, thay đổi cách xử lý dữ liệu hoặc thay đổi thuật toán gợi ý trong `train_model.py`, cần chạy lại:

```bash
python train_model.py
```

Nếu sửa logic gợi ý trong `recommender.py`, cần kiểm tra lại API recommendation ở backend.

## 12. Kết quả mong đợi

Hệ thống sau khi chạy thành công sẽ cho phép:

- Người dùng xem sản phẩm trên website
- Người dùng xem chi tiết từng sản phẩm
- Hệ thống hiển thị sản phẩm tương tự dựa trên nội dung và category
- Admin có thể quản lý sản phẩm
- Backend cung cấp API cho frontend sử dụng
- Model gợi ý có thể được train lại khi dữ liệu thay đổi

## 13. Hướng phát triển

- Bổ sung đánh giá mô hình bằng Precision@K, Recall@K, NDCG@K
- So sánh chi tiết giữa TF-IDF, Weighted TF-IDF và Sentence-BERT
- Lưu lịch sử xem sản phẩm của người dùng
- Cá nhân hóa gợi ý theo từng user
- Thêm Hybrid Recommendation kết hợp content-based và user behavior
- Deploy backend và frontend lên server thật

## 14. Tác giả

Sinh viên thực hiện: Vũ Đình Huy  
Môn học: Đồ án 2   
Tên project: Product Recommendation Web App
