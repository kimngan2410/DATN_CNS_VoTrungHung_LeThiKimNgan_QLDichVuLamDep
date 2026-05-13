from sqlalchemy import BigInteger, Column, DateTime, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class DanhMucDichVu(Base):
    __tablename__ = "DanhMucDichVu"

    idDanhMuc = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    tenDM = Column(String(150), nullable=False, unique=True)
    moTa = Column(Text, nullable=True)

    ngayTao = Column(DateTime, server_default=func.now())