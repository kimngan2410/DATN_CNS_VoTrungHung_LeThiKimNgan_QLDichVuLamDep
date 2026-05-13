from sqlalchemy import BigInteger, Boolean, Column, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class HinhAnhDichVu(Base):
    __tablename__ = "HinhAnhDichVu"

    idHinhAnh = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idDichVu = Column(
        BigInteger,
        ForeignKey("DichVu.idDichVu"),
        nullable=False,
    )

    duongDanAnh = Column(String(500), nullable=False)
    anhChinh = Column(Boolean, nullable=False, default=False)

    dichVu = relationship("DichVu")