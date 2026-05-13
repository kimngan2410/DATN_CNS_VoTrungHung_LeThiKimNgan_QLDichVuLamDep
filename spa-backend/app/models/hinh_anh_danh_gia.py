from sqlalchemy import BigInteger, Column, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class HinhAnhDanhGia(Base):
    __tablename__ = "HinhAnhDanhGia"

    idHinhAnhDanhGia = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    idDanhGia = Column(
        BigInteger,
        ForeignKey("DanhGia.idDanhGia"),
        nullable=False,
    )

    duongDanAnh = Column(String(500), nullable=False)

    danhGia = relationship("DanhGia")