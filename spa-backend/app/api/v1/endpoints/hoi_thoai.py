from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_conversations():
    return {
        "message": "API danh sách hội thoại đang hoạt động"
    }


@router.get("/{conversation_id}")
def get_conversation_detail(conversation_id: int):
    return {
        "message": "API chi tiết hội thoại",
        "conversation_id": conversation_id,
    }