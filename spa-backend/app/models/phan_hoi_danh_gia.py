from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class PhanHoiDanhGia(Base):
    __tablename__ = "PhanHoiDanhGia"

    idPhanHoi = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idDanhGia = Column(
        BigInteger,
        ForeignKey("DanhGia.idDanhGia"),
        nullable=False,
    )

    idTaiKhoan = Column(
        BigInteger,
        ForeignKey("TaiKhoan.idTaiKhoan"),
        nullable=False,
    )

    noiDungDanhGia = Column(Text, nullable=False)

    ngayTao = Column(DateTime, server_default=func.now())

    danhGia = relationship("DanhGia")
    taiKhoan = relationship("TaiKhoan")