from sqlalchemy import BigInteger, Column, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class NhanVien(Base):
    __tablename__ = "NhanVien"

    idNhanVien = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idTaiKhoan = Column(
        BigInteger,
        ForeignKey("TaiKhoan.idTaiKhoan"),
        nullable=False,
        unique=True,
    )

    maNV = Column(String(50), nullable=False, unique=True)

    hoTen = Column(String(150), nullable=False)
    sdt = Column(String(20), nullable=True, unique=True)

    chucVu = Column(String(100), nullable=False)
    gioiTinh = Column(String(20), nullable=True)
    ngaySinh = Column(Date, nullable=True)

    anhDaiDien = Column(String(500), nullable=True)

    ngayVaoLam = Column(Date, nullable=True)
    trangThaiLamViec = Column(String(50), nullable=False, default="Đang làm")

    ngayTao = Column(DateTime, server_default=func.now())

    taiKhoan = relationship("TaiKhoan")