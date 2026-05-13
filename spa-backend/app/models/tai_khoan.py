from sqlalchemy import BigInteger, Boolean, Column, DateTime, String
from sqlalchemy.sql import func

from app.db.database import Base


class TaiKhoan(Base):
    __tablename__ = "TaiKhoan"

    idTaiKhoan = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    email = Column(String(255), nullable=False, unique=True)
    matKhau = Column(String(255), nullable=False)

    loaiTK = Column(String(50), nullable=False)
    trangThai = Column(String(50), nullable=False, default="Hoạt động")

    emailDaXacThuc = Column(Boolean, nullable=False, default=False)

    tokenGhiNho = Column(String(500), nullable=True)
    tokenGhiNhoHetHan = Column(DateTime, nullable=True)

    loaiDangNhap = Column(String(50), nullable=False, default="LOCAL")
    lanDangNhapCuoi = Column(DateTime, nullable=True)

    ngayTao = Column(DateTime, server_default=func.now())
    ngayCapNhat = Column(DateTime, server_default=func.now(), onupdate=func.now())