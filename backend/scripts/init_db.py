import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.database import SessionLocal, Base, engine
from backend.app.models import User
from backend.app.auth import hash_password


def create_user_if_not_exists(db, username, password, role):
    user = db.query(User).filter(User.username == username).first()

    if user:
        return

    user = User(
        username=username,
        password_hash=hash_password(password),
        role=role,
    )

    db.add(user)


def main():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        create_user_if_not_exists(db, "admin", "admin123", "manager")
        create_user_if_not_exists(db, "customer", "customer123", "customer")

        db.commit()

        print("Đã tạo user mẫu:")
        print("Manager:  admin / admin123")
        print("Customer: customer / customer123")
    finally:
        db.close()


if __name__ == "__main__":
    main()