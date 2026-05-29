from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.models.danh_gia import DanhGia
from app.models.hinh_anh_danh_gia import HinhAnhDanhGia
from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.lich_hen import LichHen
from app.models.khach_hang import KhachHang
from app.models.dich_vu import DichVu
from app.models.phan_hoi_danh_gia import PhanHoiDanhGia


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
    

def format_admin_datetime(value):
    if not value:
        return ""

    return value.isoformat()


def get_review_images_for_admin(db: Session, id_danh_gia: int):
    images = (
        db.query(HinhAnhDanhGia)
        .filter(HinhAnhDanhGia.idDanhGia == id_danh_gia)
        .order_by(HinhAnhDanhGia.idHinhAnhDanhGia.asc())
        .all()
    )

    return [image.duongDanAnh for image in images if image.duongDanAnh]


def get_customer_display_name(customer: KhachHang | None):
    if not customer:
        return "Khách hàng"

    return (
        getattr(customer, "hoTen", None)
        or getattr(customer, "tenKhachHang", None)
        or getattr(customer, "fullName", None)
        or f"KH{int(customer.idKhachHang):03d}"
    )


def get_review_service(db: Session, review: DanhGia):
    chi_tiet = review.chiTietLichHen

    if not chi_tiet:
        return None

    id_dich_vu = getattr(chi_tiet, "idDichVu", None)

    if not id_dich_vu:
        return None

    return (
        db.query(DichVu)
        .filter(DichVu.idDichVu == id_dich_vu)
        .first()
    )


def get_review_reply(db: Session, id_danh_gia: int):
    return (
        db.query(PhanHoiDanhGia)
        .filter(PhanHoiDanhGia.idDanhGia == id_danh_gia)
        .first()
    )


def build_admin_review_response(db: Session, review: DanhGia):
    customer = review.khachHang
    service = get_review_service(db, review)
    reply = get_review_reply(db, int(review.idDanhGia))

    response = {
        "idDanhGia": int(review.idDanhGia),
        "maDanhGia": f"DG{int(review.idDanhGia):03d}",

        "idKhachHang": int(review.idKhachHang),
        "tenKhachHang": get_customer_display_name(customer),
        "avatar": customer.anhDaiDien if customer else "",

        "idDichVu": int(service.idDichVu) if service else 0,
        "tenDichVu": service.tenDV if service else "Dịch vụ",

        "soSao": int(review.soSao),
        "noiDung": review.noiDung or "",

        "hinhAnh": get_review_images_for_admin(db, int(review.idDanhGia)),

        "ngayDanhGia": format_admin_datetime(review.ngayDanhGia),
        "trangThai": "Đã phản hồi" if reply else "Chưa phản hồi",

        "phanHoi": None,
    }

    if reply:
        response["phanHoi"] = {
            "noiDungPhanHoi": reply.noiDungDanhGia or "",
            "ngayTao": format_admin_datetime(reply.ngayTao),
            "ngayCapNhat": format_admin_datetime(
                getattr(reply, "ngayCapNhat", None)
            ),
        }

    return response


def get_admin_reviews(db: Session):
    reviews = (
        db.query(DanhGia)
        .options(
            joinedload(DanhGia.khachHang),
            joinedload(DanhGia.chiTietLichHen),
        )
        .order_by(DanhGia.ngayDanhGia.desc(), DanhGia.idDanhGia.desc())
        .all()
    )

    return [build_admin_review_response(db, review) for review in reviews]


def get_admin_review_or_404(db: Session, id_danh_gia: int):
    review = (
        db.query(DanhGia)
        .options(
            joinedload(DanhGia.khachHang),
            joinedload(DanhGia.chiTietLichHen),
        )
        .filter(DanhGia.idDanhGia == id_danh_gia)
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đánh giá",
        )

    return review


def upsert_admin_review_reply(
    db: Session,
    id_danh_gia: int,
    noi_dung_phan_hoi: str,
    id_tai_khoan_admin: int | None = None,
):
    content = str(noi_dung_phan_hoi or "").strip()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng nhập nội dung phản hồi",
        )

    if len(content) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nội dung phản hồi không được vượt quá 500 ký tự",
        )

    review = get_admin_review_or_404(db, id_danh_gia)
    reply = get_review_reply(db, id_danh_gia)

    try:
        if reply:
            reply.noiDungDanhGia = content
        else:
            if not id_tai_khoan_admin:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Không xác định được tài khoản admin phản hồi",
                )

            reply = PhanHoiDanhGia(
                idDanhGia=id_danh_gia,
                idTaiKhoan=id_tai_khoan_admin,
                noiDungDanhGia=content,
            )

            db.add(reply)

        db.commit()
        db.refresh(review)

        return build_admin_review_response(db, review)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi phản hồi đánh giá: {str(error)}",
        )