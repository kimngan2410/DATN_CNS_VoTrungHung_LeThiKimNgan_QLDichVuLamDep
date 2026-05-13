from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class OTPXacThuc(Base):
    __tablename__ = "OTPXacThuc"

    otp_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idTaiKhoan = Column(
        BigInteger,
        ForeignKey("TaiKhoan.idTaiKhoan"),
        nullable=True,
    )

    maOTP = Column(String(20), nullable=False)
    loaiOTP = Column(String(50), nullable=False)

    thoiGianHetHan = Column(DateTime, nullable=False)
    daSuDung = Column(Boolean, nullable=False, default=False)

    soLanGui = Column(Integer, nullable=False, default=1)
    thoiGianGuiCuoi = Column(DateTime, nullable=True)

    ngayTao = Column(DateTime, server_default=func.now())

    taiKhoan = relationship("TaiKhoan")