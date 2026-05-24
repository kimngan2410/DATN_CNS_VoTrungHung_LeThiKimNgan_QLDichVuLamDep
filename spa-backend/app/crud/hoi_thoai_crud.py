from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.hoi_thoai import HoiThoai
from app.models.khach_hang import KhachHang
from app.models.nhan_vien import NhanVien
from app.models.tai_khoan import TaiKhoan
from app.models.tin_nhan import TinNhan

CONVERSATION_OPEN_STATUS = "Đang mở"
CONVERSATION_ANSWERED_STATUS = "Đã trả lời"

def format_time(value):
    if not value:
        return ""

    return value.strftime("%H:%M")


def format_datetime(value):
    if not value:
        return ""

    return value.strftime("%d/%m/%Y %H:%M")


def get_sender_type(tai_khoan: TaiKhoan | None):
    if not tai_khoan:
        return "unknown"

    if tai_khoan.loaiTK == "KHACH_HANG":
        return "customer"

    if tai_khoan.loaiTK == "NHAN_VIEN":
        return "staff"

    return "unknown"


def get_sender_name(db: Session, tai_khoan: TaiKhoan | None):
    if not tai_khoan:
        return "Người dùng"

    if tai_khoan.loaiTK == "KHACH_HANG":
        khach_hang = (
            db.query(KhachHang)
            .filter(KhachHang.idTaiKhoan == tai_khoan.idTaiKhoan)
            .first()
        )

        if khach_hang:
            return khach_hang.hoTen

    if tai_khoan.loaiTK == "NHAN_VIEN":
        nhan_vien = (
            db.query(NhanVien)
            .filter(NhanVien.idTaiKhoan == tai_khoan.idTaiKhoan)
            .first()
        )

        if nhan_vien:
            return nhan_vien.hoTen

    return tai_khoan.email.split("@")[0]


def build_message_response(db: Session, message: TinNhan):
    sender = message.nguoiGui

    return {
        "id": int(message.idTinNhan),
        "idTinNhan": int(message.idTinNhan),
        "idHoiThoai": int(message.idHoiThoai),
        "idNguoiGuiTaiKhoan": int(message.idNguoiGui_TaiKhoan),
        "sender": get_sender_type(sender),
        "senderName": get_sender_name(db, sender),
        "content": message.noiDung,
        "time": format_time(message.thoiGianGui),
        "createdAt": format_datetime(message.thoiGianGui),
        "daXem": bool(message.daXem),

        "daChinhSua": bool(getattr(message, "daChinhSua", False)),
        "thoiGianChinhSua": format_datetime(
            getattr(message, "thoiGianChinhSua", None)
        ),
        "daThuHoi": bool(getattr(message, "daThuHoi", False)),
        "thoiGianThuHoi": format_datetime(
            getattr(message, "thoiGianThuHoi", None)
        ),
    }


def get_customer_by_account_or_404(db: Session, id_tai_khoan: int):
    tai_khoan = (
        db.query(TaiKhoan)
        .filter(TaiKhoan.idTaiKhoan == id_tai_khoan)
        .first()
    )

    if not tai_khoan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản khách hàng",
        )

    if tai_khoan.loaiTK != "KHACH_HANG":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản này không phải tài khoản khách hàng",
        )

    khach_hang = (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == id_tai_khoan)
        .first()
    )

    if not khach_hang:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ khách hàng",
        )

    return khach_hang


def get_staff_by_account_or_404(db: Session, id_tai_khoan: int):
    tai_khoan = (
        db.query(TaiKhoan)
        .filter(TaiKhoan.idTaiKhoan == id_tai_khoan)
        .first()
    )

    if not tai_khoan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản nhân viên",
        )

    if tai_khoan.loaiTK != "NHAN_VIEN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản này không phải tài khoản nhân viên",
        )

    nhan_vien = (
        db.query(NhanVien)
        .filter(NhanVien.idTaiKhoan == id_tai_khoan)
        .first()
    )

    if not nhan_vien:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ nhân viên",
        )

    return nhan_vien


def get_or_create_customer_conversation(db: Session, id_tai_khoan: int):
    khach_hang = get_customer_by_account_or_404(db, id_tai_khoan)

    conversation = (
        db.query(HoiThoai)
        .filter(HoiThoai.idKhachHang == khach_hang.idKhachHang)
        .first()
    )

    if conversation:
        return conversation

    conversation = HoiThoai(
        idKhachHang=khach_hang.idKhachHang,
        idNhanVienPhuTrach=None,
        trangThai=CONVERSATION_OPEN_STATUS,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_conversation_or_404(db: Session, id_hoi_thoai: int):
    conversation = (
        db.query(HoiThoai)
        .filter(HoiThoai.idHoiThoai == id_hoi_thoai)
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hội thoại",
        )

    return conversation


def get_conversation_messages(db: Session, id_hoi_thoai: int):
    messages = (
        db.query(TinNhan)
        .filter(TinNhan.idHoiThoai == id_hoi_thoai)
        .order_by(TinNhan.thoiGianGui.asc(), TinNhan.idTinNhan.asc())
        .all()
    )

    return [build_message_response(db, item) for item in messages]


def mark_staff_messages_as_read_by_customer(
    db: Session,
    id_hoi_thoai: int,
    id_tai_khoan_customer: int,
):
    (
        db.query(TinNhan)
        .filter(
            TinNhan.idHoiThoai == id_hoi_thoai,
            TinNhan.idNguoiGui_TaiKhoan != id_tai_khoan_customer,
            TinNhan.daXem.is_(False),
        )
        .update({"daXem": True}, synchronize_session=False)
    )

    db.commit()


def mark_customer_messages_as_read_by_staff(db: Session, conversation: HoiThoai):
    if not conversation.khachHang:
        return

    customer_account_id = conversation.khachHang.idTaiKhoan

    (
        db.query(TinNhan)
        .filter(
            TinNhan.idHoiThoai == conversation.idHoiThoai,
            TinNhan.idNguoiGui_TaiKhoan == customer_account_id,
            TinNhan.daXem.is_(False),
        )
        .update({"daXem": True}, synchronize_session=False)
    )

    db.commit()


def build_customer_conversation_response(db: Session, conversation: HoiThoai):
    return {
        "id": int(conversation.idHoiThoai),
        "idHoiThoai": int(conversation.idHoiThoai),
        "status": conversation.trangThai,
        "messages": get_conversation_messages(db, int(conversation.idHoiThoai)),
    }


def get_customer_conversation(db: Session, id_tai_khoan: int):
    conversation = get_or_create_customer_conversation(db, id_tai_khoan)

    mark_staff_messages_as_read_by_customer(
        db=db,
        id_hoi_thoai=int(conversation.idHoiThoai),
        id_tai_khoan_customer=id_tai_khoan,
    )

    db.refresh(conversation)

    return build_customer_conversation_response(db, conversation)


def send_customer_message(db: Session, id_tai_khoan: int, content: str):
    content = (content or "").strip()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nội dung tin nhắn không được để trống",
        )

    conversation = get_or_create_customer_conversation(db, id_tai_khoan)

    message = TinNhan(
        idHoiThoai=conversation.idHoiThoai,
        idNguoiGui_TaiKhoan=id_tai_khoan,
        noiDung=content,
        daXem=False,
    )

    conversation.trangThai = CONVERSATION_OPEN_STATUS

    db.add(message)
    db.commit()
    db.refresh(message)
    db.refresh(conversation)

    return {
        "conversation": build_customer_conversation_response(db, conversation),
        "message": build_message_response(db, message),
    }


def get_last_message(db: Session, id_hoi_thoai: int):
    return (
        db.query(TinNhan)
        .filter(TinNhan.idHoiThoai == id_hoi_thoai)
        .order_by(TinNhan.thoiGianGui.desc(), TinNhan.idTinNhan.desc())
        .first()
    )


def get_unread_count_for_staff(db: Session, conversation: HoiThoai):
    if not conversation.khachHang:
        return 0

    customer_account_id = conversation.khachHang.idTaiKhoan

    return int(
        db.query(func.count(TinNhan.idTinNhan))
        .filter(
            TinNhan.idHoiThoai == conversation.idHoiThoai,
            TinNhan.idNguoiGui_TaiKhoan == customer_account_id,
            TinNhan.daXem.is_(False),
        )
        .scalar()
        or 0
    )


def get_staff_conversation_status(last_message: TinNhan | None):
    if not last_message:
        return "answered"

    sender = last_message.nguoiGui

    if sender and sender.loaiTK == "KHACH_HANG":
        return "unanswered"

    return "answered"


def get_activity_info(last_message: TinNhan | None):
    if not last_message or not last_message.thoiGianGui:
        return {
            "activityStatus": "offline",
            "activityText": "Chưa có tin nhắn",
        }

    diff_seconds = (datetime.now() - last_message.thoiGianGui).total_seconds()

    if diff_seconds <= 5 * 60:
        return {
            "activityStatus": "online",
            "activityText": "Đang hoạt động",
        }

    if diff_seconds <= 60 * 60:
        minutes = max(1, int(diff_seconds // 60))

        return {
            "activityStatus": "recent",
            "activityText": f"Hoạt động {minutes} phút trước",
        }

    return {
        "activityStatus": "offline",
        "activityText": "Ngoại tuyến",
    }


def build_staff_conversation_item(db: Session, conversation: HoiThoai):
    khach_hang = conversation.khachHang
    last_message = get_last_message(db, int(conversation.idHoiThoai))
    activity_info = get_activity_info(last_message)

    customer_name = khach_hang.hoTen if khach_hang else "Khách hàng"

    return {
        "id": int(conversation.idHoiThoai),
        "idHoiThoai": int(conversation.idHoiThoai),
        "customerName": customer_name,
        "phone": khach_hang.sdt if khach_hang and khach_hang.sdt else "Chưa cập nhật",
        "avatar": khach_hang.anhDaiDien if khach_hang else "",
        "avatarText": customer_name[0].upper() if customer_name else "K",
        "lastTime": format_time(last_message.thoiGianGui) if last_message else "",
        "lastMessage": last_message.noiDung if last_message else "",
        "lastSender": get_sender_type(last_message.nguoiGui) if last_message else "",
        "unread": get_unread_count_for_staff(db, conversation),
        "status": get_staff_conversation_status(last_message),
        "activityStatus": activity_info["activityStatus"],
        "activityText": activity_info["activityText"],
    }


def get_staff_conversations(db: Session):
    conversations = (
        db.query(HoiThoai)
        .join(KhachHang, KhachHang.idKhachHang == HoiThoai.idKhachHang)
        .all()
    )

    result = []

    for conversation in conversations:
        last_message = get_last_message(db, int(conversation.idHoiThoai))

        if last_message:
            result.append(
                {
                    **build_staff_conversation_item(db, conversation),
                    "_sortTime": last_message.thoiGianGui,
                }
            )

    result.sort(
        key=lambda item: item["_sortTime"] or datetime.min,
        reverse=True,
    )

    for item in result:
        item.pop("_sortTime", None)

    return result


def get_staff_conversation_detail(db: Session, id_hoi_thoai: int):
    conversation = get_conversation_or_404(db, id_hoi_thoai)

    mark_customer_messages_as_read_by_staff(db, conversation)
    db.refresh(conversation)

    return {
        **build_staff_conversation_item(db, conversation),
        "messages": get_conversation_messages(db, int(conversation.idHoiThoai)),
    }


def send_staff_message(
    db: Session,
    id_hoi_thoai: int,
    id_tai_khoan_nhan_vien: int,
    content: str,
):
    content = (content or "").strip()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nội dung phản hồi không được để trống",
        )

    nhan_vien = get_staff_by_account_or_404(db, id_tai_khoan_nhan_vien)
    conversation = get_conversation_or_404(db, id_hoi_thoai)

    if not conversation.idNhanVienPhuTrach:
        conversation.idNhanVienPhuTrach = nhan_vien.idNhanVien

    message = TinNhan(
        idHoiThoai=conversation.idHoiThoai,
        idNguoiGui_TaiKhoan=id_tai_khoan_nhan_vien,
        noiDung=content,
        daXem=False,
    )

    conversation.trangThai = CONVERSATION_ANSWERED_STATUS

    db.add(message)
    db.commit()
    db.refresh(message)
    db.refresh(conversation)

    return {
        "conversation": get_staff_conversation_detail(db, id_hoi_thoai),
        "message": build_message_response(db, message),
    }

def get_customer_unread_count(db: Session, id_tai_khoan: int):
    khach_hang = get_customer_by_account_or_404(db, id_tai_khoan)

    conversation = (
        db.query(HoiThoai)
        .filter(HoiThoai.idKhachHang == khach_hang.idKhachHang)
        .first()
    )

    if not conversation:
        return {
            "unreadCount": 0,
        }

    unread_count = int(
        db.query(func.count(TinNhan.idTinNhan))
        .filter(
            TinNhan.idHoiThoai == conversation.idHoiThoai,
            TinNhan.idNguoiGui_TaiKhoan != id_tai_khoan,
            TinNhan.daXem.is_(False),
        )
        .scalar()
        or 0
    )

    return {
        "unreadCount": unread_count,
    }


def get_staff_unread_count(db: Session):
    unread_count = int(
        db.query(func.count(TinNhan.idTinNhan))
        .join(HoiThoai, HoiThoai.idHoiThoai == TinNhan.idHoiThoai)
        .join(KhachHang, KhachHang.idKhachHang == HoiThoai.idKhachHang)
        .filter(
            TinNhan.idNguoiGui_TaiKhoan == KhachHang.idTaiKhoan,
            TinNhan.daXem.is_(False),
        )
        .scalar()
        or 0
    )

    return {
        "unreadCount": unread_count,
    }

def get_message_or_404(db: Session, id_tin_nhan: int):
    message = (
        db.query(TinNhan)
        .filter(TinNhan.idTinNhan == id_tin_nhan)
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tin nhắn",
        )

    return message


def build_conversation_after_message_action(db: Session, message: TinNhan):
    sender = message.nguoiGui

    if sender and sender.loaiTK == "NHAN_VIEN":
        return get_staff_conversation_detail(
            db=db,
            id_hoi_thoai=int(message.idHoiThoai),
        )

    conversation = get_conversation_or_404(
        db=db,
        id_hoi_thoai=int(message.idHoiThoai),
    )

    return build_customer_conversation_response(db, conversation)


def update_conversation_message(
    db: Session,
    id_tin_nhan: int,
    id_tai_khoan: int,
    content: str,
):
    content = (content or "").strip()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nội dung tin nhắn không được để trống",
        )

    message = get_message_or_404(db, id_tin_nhan)

    if int(message.idNguoiGui_TaiKhoan) != int(id_tai_khoan):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn chỉ được chỉnh sửa tin nhắn của chính mình",
        )

    if getattr(message, "daThuHoi", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể chỉnh sửa tin nhắn đã thu hồi",
        )

    message.noiDung = content
    message.daChinhSua = True
    message.thoiGianChinhSua = datetime.now()

    db.commit()
    db.refresh(message)

    return {
        "conversation": build_conversation_after_message_action(db, message),
        "message": build_message_response(db, message),
    }


def recall_conversation_message(
    db: Session,
    id_tin_nhan: int,
    id_tai_khoan: int,
):
    message = get_message_or_404(db, id_tin_nhan)

    if int(message.idNguoiGui_TaiKhoan) != int(id_tai_khoan):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn chỉ được thu hồi tin nhắn của chính mình",
        )

    if getattr(message, "daThuHoi", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tin nhắn này đã được thu hồi trước đó",
        )

    message.daThuHoi = True
    message.thoiGianThuHoi = datetime.now()

    db.commit()
    db.refresh(message)

    return {
        "conversation": build_conversation_after_message_action(db, message),
        "message": build_message_response(db, message),
    }