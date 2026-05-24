from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TinNhan(Base):
    __tablename__ = "TinNhan"

    idTinNhan = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    idHoiThoai = Column(
        BigInteger,
        ForeignKey("HoiThoai.idHoiThoai"),
        nullable=False,
    )

    idNguoiGui_TaiKhoan = Column(
        BigInteger,
        ForeignKey("TaiKhoan.idTaiKhoan"),
        nullable=False,
    )

    noiDung = Column(
        Text,
        nullable=False,
    )

    thoiGianGui = Column(
        DateTime,
        server_default=func.now(),
    )

    daXem = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    daChinhSua = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    thoiGianChinhSua = Column(
        DateTime,
        nullable=True,
    )

    daThuHoi = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    thoiGianThuHoi = Column(
        DateTime,
        nullable=True,
    )

    hoiThoai = relationship("HoiThoai")
    nguoiGui = relationship("TaiKhoan")