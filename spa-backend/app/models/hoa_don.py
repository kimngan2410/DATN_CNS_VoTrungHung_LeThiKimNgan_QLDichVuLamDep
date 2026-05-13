from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class HoaDon(Base):
    __tablename__ = "HoaDon"

    idHoaDon = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    maHD = Column(String(50), nullable=False, unique=True)

    idLichHen = Column(
        BigInteger,
        ForeignKey("LichHen.idLichHen"),
        nullable=False,
    )

    idTaiKhoan = Column(
        BigInteger,
        ForeignKey("TaiKhoan.idTaiKhoan"),
        nullable=False,
    )

    tongTien = Column(Numeric(12, 2), nullable=False, default=0)
    giamGia = Column(Numeric(12, 2), nullable=False, default=0)
    thanhTien = Column(Numeric(12, 2), nullable=False, default=0)

    phuongThucThanhToan = Column(String(50), nullable=False)
    trangThaiThanhToan = Column(String(50), nullable=False, default="Đã thanh toán")

    ghiChu = Column(Text, nullable=True)

    ngayTao = Column(DateTime, server_default=func.now())

    lichHen = relationship("LichHen")
    taiKhoan = relationship("TaiKhoan")