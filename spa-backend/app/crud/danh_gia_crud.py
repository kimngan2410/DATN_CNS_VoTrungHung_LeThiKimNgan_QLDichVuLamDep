from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.danh_gia import DanhGia
from app.models.hinh_anh_danh_gia import HinhAnhDanhGia
from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.lich_hen import LichHen
from app.models.khach_hang import KhachHang


REVIEW_UPLOAD_DIR = Path("uploads/reviews")
ALLOWED_REVIEW_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_REVIEW_IMAGE_SIZE = 3 * 1024 * 1024
MAX_REVIEW_IMAGES = 5


def get_public_file_url(file_path: Path) -> str:
    return "/" + str(file_path).replace("\\", "/")


def save_review_image(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_REVIEW_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ảnh đánh giá chỉ hỗ trợ JPG, PNG hoặc WEBP",
        )

    REVIEW_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "").suffix.lower()

    if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
        suffix = ".jpg"

    file_name = f"{uuid4().hex}{suffix}"
    file_path = REVIEW_UPLOAD_DIR / file_name

    size = 0

    try:
        with file_path.open("wb") as buffer:
            while True:
                chunk = file.file.read(1024 * 1024)

                if not chunk:
                    break

                size += len(chunk)

                if size > MAX_REVIEW_IMAGE_SIZE:
                    buffer.close()
                    file_path.unlink(missing_ok=True)

                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Mỗi ảnh đánh giá không được vượt quá 3MB",
                    )

                buffer.write(chunk)

    finally:
        file.file.close()

    return get_public_file_url(file_path)


def build_review_response(db: Session, review: DanhGia):
    images = (
        db.query(HinhAnhDanhGia)
        .filter(HinhAnhDanhGia.idDanhGia == review.idDanhGia)
        .order_by(HinhAnhDanhGia.idHinhAnhDanhGia.asc())
        .all()
    )

    return {
        "idDanhGia": int(review.idDanhGia),
        "idKhachHang": int(review.idKhachHang),
        "idChiTietLH": int(review.idChiTietLH),
        "rating": int(review.soSao),
        "content": review.noiDung or "",
        "images": [
            {
                "id": int(image.idHinhAnhDanhGia),
                "url": image.duongDanAnh,
                "name": image.duongDanAnh.split("/")[-1],
            }
            for image in images
        ],
        "createdAt": review.ngayDanhGia.isoformat() if review.ngayDanhGia else None,
    }


def create_customer_review(
    db: Session,
    id_tai_khoan: int,
    id_chi_tiet_lh: int,
    so_sao: int,
    noi_dung: str | None,
    images: list[UploadFile] | None = None,
):
    if so_sao < 1 or so_sao > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số sao đánh giá phải từ 1 đến 5",
        )

    images = images or []

    if len(images) > MAX_REVIEW_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ được tải tối đa 5 ảnh đánh giá",
        )

    khach_hang = (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == id_tai_khoan)
        .first()
    )

    if not khach_hang:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin khách hàng",
        )

    chi_tiet = (
        db.query(ChiTietLichHen)
        .filter(ChiTietLichHen.idChiTietLH == id_chi_tiet_lh)
        .first()
    )

    if not chi_tiet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy dịch vụ trong lịch hẹn",
        )

    lich_hen = (
        db.query(LichHen)
        .filter(LichHen.idLichHen == chi_tiet.idLichHen)
        .first()
    )

    if not lich_hen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch hẹn",
        )

    if int(lich_hen.idTaiKhoan) != int(id_tai_khoan):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền đánh giá dịch vụ này",
        )

    if lich_hen.trangThai != "Đã hoàn thành":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ được đánh giá dịch vụ sau khi lịch hẹn đã hoàn thành",
        )

    existed_review = (
        db.query(DanhGia)
        .filter(
            DanhGia.idKhachHang == khach_hang.idKhachHang,
            DanhGia.idChiTietLH == id_chi_tiet_lh,
        )
        .first()
    )

    if existed_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dịch vụ này đã được đánh giá",
        )

    try:
        review = DanhGia(
            idKhachHang=khach_hang.idKhachHang,
            idChiTietLH=id_chi_tiet_lh,
            soSao=so_sao,
            noiDung=noi_dung.strip() if noi_dung else None,
            trangThaiHienThi="Hiển thị",
        )

        db.add(review)
        db.flush()

        for image_file in images:
            if not image_file or not image_file.filename:
                continue

            image_url = save_review_image(image_file)

            review_image = HinhAnhDanhGia(
                idDanhGia=review.idDanhGia,
                duongDanAnh=image_url,
            )

            db.add(review_image)

        db.commit()
        db.refresh(review)

        return build_review_response(db, review)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lưu đánh giá dịch vụ: {str(error)}",
        )


def get_review_by_detail(
    db: Session,
    id_khach_hang: int | None,
    id_chi_tiet_lh: int,
):
    if not id_khach_hang:
        return None

    review = (
        db.query(DanhGia)
        .filter(
            DanhGia.idKhachHang == id_khach_hang,
            DanhGia.idChiTietLH == id_chi_tiet_lh,
        )
        .first()
    )

    if not review:
        return None

    return build_review_response(db, review)

def update_customer_review(
    db,
    id_tai_khoan: int,
    id_danh_gia: int,
    so_sao: int,
    noi_dung: str | None,
    kept_image_urls: list[str] | None = None,
    images: list[UploadFile] | None = None,
):
    if so_sao < 1 or so_sao > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số sao đánh giá phải từ 1 đến 5",
        )

    khach_hang = (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == id_tai_khoan)
        .first()
    )

    if not khach_hang:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin khách hàng",
        )

    review = (
        db.query(DanhGia)
        .filter(
            DanhGia.idDanhGia == id_danh_gia,
            DanhGia.idKhachHang == khach_hang.idKhachHang,
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đánh giá cần chỉnh sửa",
        )

    kept_image_urls = kept_image_urls or []
    images = images or []

    total_image_count = len(kept_image_urls) + len(images)

    if total_image_count > MAX_REVIEW_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ được giữ hoặc tải tối đa 5 ảnh đánh giá",
        )

    try:
        review.soSao = so_sao
        review.noiDung = noi_dung.strip() if noi_dung else None

        old_images = (
            db.query(HinhAnhDanhGia)
            .filter(HinhAnhDanhGia.idDanhGia == review.idDanhGia)
            .all()
        )

        for old_image in old_images:
            db.delete(old_image)

        for image_url in kept_image_urls:
            if image_url:
                db.add(
                    HinhAnhDanhGia(
                        idDanhGia=review.idDanhGia,
                        duongDanAnh=image_url,
                    )
                )

        for image_file in images:
            if not image_file or not image_file.filename:
                continue

            image_url = save_review_image(image_file)

            db.add(
                HinhAnhDanhGia(
                    idDanhGia=review.idDanhGia,
                    duongDanAnh=image_url,
                )
            )

        db.commit()
        db.refresh(review)

        return build_review_response(db, review)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật đánh giá dịch vụ: {str(error)}",
        )