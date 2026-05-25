import asyncio

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.crud.hoi_thoai_crud import (
    get_customer_by_account_or_404,
    get_customer_conversation,
    get_customer_unread_count,
    get_staff_conversation_detail,
    get_staff_conversations,
    get_staff_unread_count,
    recall_conversation_message,
    send_customer_message,
    send_staff_message,
    update_conversation_message,
)
from app.db.session import get_db, SessionLocal
from app.websocket.connection_manager import manager


router = APIRouter()


class CustomerMessageCreate(BaseModel):
    idTaiKhoan: int
    noiDung: str = Field(..., min_length=1)


class StaffMessageCreate(BaseModel):
    idTaiKhoan: int
    noiDung: str = Field(..., min_length=1)


class MessageUpdate(BaseModel):
    idTaiKhoan: int
    noiDung: str = Field(..., min_length=1)


class MessageRecall(BaseModel):
    idTaiKhoan: int


@router.get("/customer/{id_tai_khoan}")
def get_customer_conversation_api(
    id_tai_khoan: int,
    db: Session = Depends(get_db),
):
    return get_customer_conversation(
        db=db,
        id_tai_khoan=id_tai_khoan,
    )


@router.get("/customer/{id_tai_khoan}/unread-count")
def get_customer_unread_count_api(
    id_tai_khoan: int,
    db: Session = Depends(get_db),
):
    return get_customer_unread_count(
        db=db,
        id_tai_khoan=id_tai_khoan,
    )


@router.post("/customer/tin-nhan")
def send_customer_message_api(
    payload: CustomerMessageCreate,
    db: Session = Depends(get_db),
):
    return send_customer_message(
        db=db,
        id_tai_khoan=payload.idTaiKhoan,
        content=payload.noiDung,
    )


@router.get("/staff/danh-sach")
def get_staff_conversations_api(
    db: Session = Depends(get_db),
):
    return get_staff_conversations(db=db)


@router.get("/staff/unread-count")
def get_staff_unread_count_api(
    db: Session = Depends(get_db),
):
    return get_staff_unread_count(db=db)


@router.put("/tin-nhan/{id_tin_nhan}")
def update_conversation_message_api(
    id_tin_nhan: int,
    payload: MessageUpdate,
    db: Session = Depends(get_db),
):
    return update_conversation_message(
        db=db,
        id_tin_nhan=id_tin_nhan,
        id_tai_khoan=payload.idTaiKhoan,
        content=payload.noiDung,
    )


@router.patch("/tin-nhan/{id_tin_nhan}/thu-hoi")
def recall_conversation_message_api(
    id_tin_nhan: int,
    payload: MessageRecall,
    db: Session = Depends(get_db),
):
    return recall_conversation_message(
        db=db,
        id_tin_nhan=id_tin_nhan,
        id_tai_khoan=payload.idTaiKhoan,
    )


@router.get("/staff/{id_hoi_thoai}")
def get_staff_conversation_detail_api(
    id_hoi_thoai: int,
    db: Session = Depends(get_db),
):
    return get_staff_conversation_detail(
        db=db,
        id_hoi_thoai=id_hoi_thoai,
    )


@router.post("/staff/{id_hoi_thoai}/tin-nhan")
def send_staff_message_api(
    id_hoi_thoai: int,
    payload: StaffMessageCreate,
    db: Session = Depends(get_db),
):
    return send_staff_message(
        db=db,
        id_hoi_thoai=id_hoi_thoai,
        id_tai_khoan_nhan_vien=payload.idTaiKhoan,
        content=payload.noiDung,
    )


def _get_ws_error_message(error: Exception):
    detail = getattr(error, "detail", None)

    if detail:
        return str(detail)

    return str(error)


async def _broadcast_conversation_updated(
    id_hoi_thoai: int,
    event_type: str,
    message=None,
):
    payload = {
        "type": event_type,
        "idHoiThoai": int(id_hoi_thoai),
    }

    if message:
        payload["message"] = message

    # Gửi cho socket chi tiết hội thoại đang mở
    await manager.broadcast_conversation(int(id_hoi_thoai), payload)

    # Gửi luôn message cho socket danh sách staff
    # để staff append/update tin nhắn ngay cả khi socket chi tiết chưa kịp nối
    await manager.broadcast_staff_list(payload)

    # Event phụ để frontend reload nhẹ danh sách nếu cần
    await manager.broadcast_staff_list(
        {
            "type": "conversation_updated",
            "idHoiThoai": int(id_hoi_thoai),
        }
    )


@router.websocket("/ws/customer/{id_tai_khoan}")
async def customer_chat_websocket(
    websocket: WebSocket,
    id_tai_khoan: int,
):
    db = SessionLocal()
    id_hoi_thoai = None

    try:
        conversation = get_customer_conversation(
            db=db,
            id_tai_khoan=id_tai_khoan,
        )

        id_hoi_thoai = int(conversation["idHoiThoai"])

        await manager.connect_conversation(id_hoi_thoai, websocket)

        await websocket.send_json(
            {
                "type": "connected",
                "idHoiThoai": id_hoi_thoai,
            }
        )

        while True:
            data = await websocket.receive_json()

            action = data.get("action")
            noi_dung = data.get("noiDung", "")
            id_tin_nhan = data.get("idTinNhan")

            if action == "send_message":
                result = send_customer_message(
                    db=db,
                    id_tai_khoan=id_tai_khoan,
                    content=noi_dung,
                )

                await _broadcast_conversation_updated(
                    id_hoi_thoai=id_hoi_thoai,
                    event_type="message_created",
                    message=result.get("message"),
                )

            elif action == "update_message":
                result = update_conversation_message(
                    db=db,
                    id_tin_nhan=int(id_tin_nhan),
                    id_tai_khoan=id_tai_khoan,
                    content=noi_dung,
                )

                await _broadcast_conversation_updated(
                    id_hoi_thoai=id_hoi_thoai,
                    event_type="message_updated",
                    message=result.get("message"),
                )

            elif action == "recall_message":
                result = recall_conversation_message(
                    db=db,
                    id_tin_nhan=int(id_tin_nhan),
                    id_tai_khoan=id_tai_khoan,
                )

                await _broadcast_conversation_updated(
                    id_hoi_thoai=id_hoi_thoai,
                    event_type="message_recalled",
                    message=result.get("message"),
                )

            else:
                await websocket.send_json(
                    {
                        "type": "error",
                        "message": "Hành động WebSocket không hợp lệ.",
                    }
                )

    except WebSocketDisconnect:
        if id_hoi_thoai is not None:
            manager.disconnect_conversation(id_hoi_thoai, websocket)

    except Exception as error:
        try:
            await websocket.send_json(
                {
                    "type": "error",
                    "message": _get_ws_error_message(error),
                }
            )
        except Exception:
            pass

    finally:
        db.close()


@router.websocket("/ws/conversation/{id_hoi_thoai}")
async def conversation_chat_websocket(
    websocket: WebSocket,
    id_hoi_thoai: int,
):
    db = SessionLocal()

    try:
        await manager.connect_conversation(id_hoi_thoai, websocket)

        await websocket.send_json(
            {
                "type": "connected",
                "idHoiThoai": int(id_hoi_thoai),
            }
        )

        while True:
            data = await websocket.receive_json()

            action = data.get("action")
            id_tai_khoan = data.get("idTaiKhoan")
            noi_dung = data.get("noiDung", "")
            id_tin_nhan = data.get("idTinNhan")

            if not id_tai_khoan:
                await websocket.send_json(
                    {
                        "type": "error",
                        "message": "Thiếu id tài khoản người gửi.",
                    }
                )
                continue

            if action == "send_message":
                result = send_staff_message(
                    db=db,
                    id_hoi_thoai=id_hoi_thoai,
                    id_tai_khoan_nhan_vien=int(id_tai_khoan),
                    content=noi_dung,
                )

                await _broadcast_conversation_updated(
                    id_hoi_thoai=id_hoi_thoai,
                    event_type="message_created",
                    message=result.get("message"),
                )

            elif action == "update_message":
                result = update_conversation_message(
                    db=db,
                    id_tin_nhan=int(id_tin_nhan),
                    id_tai_khoan=int(id_tai_khoan),
                    content=noi_dung,
                )

                await _broadcast_conversation_updated(
                    id_hoi_thoai=id_hoi_thoai,
                    event_type="message_updated",
                    message=result.get("message"),
                )

            elif action == "recall_message":
                result = recall_conversation_message(
                    db=db,
                    id_tin_nhan=int(id_tin_nhan),
                    id_tai_khoan=int(id_tai_khoan),
                )

                await _broadcast_conversation_updated(
                    id_hoi_thoai=id_hoi_thoai,
                    event_type="message_recalled",
                    message=result.get("message"),
                )

            else:
                await websocket.send_json(
                    {
                        "type": "error",
                        "message": "Hành động WebSocket không hợp lệ.",
                    }
                )

    except WebSocketDisconnect:
        manager.disconnect_conversation(id_hoi_thoai, websocket)

    except Exception as error:
        try:
            await websocket.send_json(
                {
                    "type": "error",
                    "message": _get_ws_error_message(error),
                }
            )
        except Exception:
            pass

    finally:
        db.close()


@router.websocket("/ws/staff/danh-sach")
async def staff_conversation_list_websocket(websocket: WebSocket):
    await manager.connect_staff_list(websocket)

    print("STAFF LIST SOCKET CONNECTED")

    try:
        await websocket.send_json({"type": "connected_staff_list"})

        while True:
            await asyncio.sleep(25)
            await websocket.send_json({"type": "ping"})

    except WebSocketDisconnect:
        print("STAFF LIST SOCKET DISCONNECTED")
        manager.disconnect_staff_list(websocket)

    except Exception as error:
        print("STAFF LIST SOCKET ERROR:", error)
        manager.disconnect_staff_list(websocket)


@router.websocket("/ws/presence/customer/{id_tai_khoan}")
async def customer_presence_websocket(
    websocket: WebSocket,
    id_tai_khoan: int,
):
    db = SessionLocal()

    try:
        # Kiểm tra đúng là tài khoản khách hàng
        get_customer_by_account_or_404(db, id_tai_khoan)

        await manager.connect_user_presence(id_tai_khoan, websocket)

        await manager.broadcast_staff_list(
            {
                "type": "presence_updated",
                "idTaiKhoan": int(id_tai_khoan),
                "isOnline": True,
            }
        )

        await websocket.send_json(
            {
                "type": "presence_connected",
                "idTaiKhoan": int(id_tai_khoan),
            }
        )

        while True:
            # Frontend presence socket đang gửi "ping" định kỳ
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect_user_presence(id_tai_khoan, websocket)

        await manager.broadcast_staff_list(
            {
                "type": "presence_updated",
                "idTaiKhoan": int(id_tai_khoan),
                "isOnline": manager.is_user_online(id_tai_khoan),
            }
        )

    except Exception:
        try:
            await websocket.close()
        except Exception:
            pass

    finally:
        db.close()