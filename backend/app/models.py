from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum
from sqlalchemy.sql import func

from backend.app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("manager", "customer"), nullable=False, default="customer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(100), unique=True, nullable=False, index=True)

    product_name = Column(Text)
    category_path = Column(Text)
    rating = Column(Float)
    rating_count = Column(Integer)
    about_product = Column(Text)
    img_link = Column(Text)
    product_link = Column(Text)

    cat_level_1 = Column(String(255))
    cat_level_2 = Column(String(255))
    cat_level_3 = Column(String(255))
    cat_level_4 = Column(String(255))

    clean_text_no_category = Column(Text)
    clean_text_with_category = Column(Text)

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )