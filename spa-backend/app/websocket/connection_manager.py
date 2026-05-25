from datetime import datetime
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_conversations: dict[int, list[WebSocket]] = {}
        self.active_staff_listeners: list[WebSocket] = []

        # Presence: theo dõi tài khoản nào đang online
        self.active_user_connections: dict[int, list[WebSocket]] = {}
        self.user_last_seen: dict[int, datetime] = {}

    async def connect_conversation(self, id_hoi_thoai: int, websocket: WebSocket):
        await websocket.accept()

        if id_hoi_thoai not in self.active_conversations:
            self.active_conversations[id_hoi_thoai] = []

        self.active_conversations[id_hoi_thoai].append(websocket)

    def disconnect_conversation(self, id_hoi_thoai: int, websocket: WebSocket):
        sockets = self.active_conversations.get(id_hoi_thoai, [])

        if websocket in sockets:
            sockets.remove(websocket)

        if not sockets and id_hoi_thoai in self.active_conversations:
            del self.active_conversations[id_hoi_thoai]

    async def broadcast_conversation(self, id_hoi_thoai: int, payload: dict):
        sockets = self.active_conversations.get(id_hoi_thoai, [])
        disconnected = []

        for websocket in sockets:
            try:
                await websocket.send_json(payload)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect_conversation(id_hoi_thoai, websocket)

    async def connect_staff_list(self, websocket: WebSocket):
        await websocket.accept()
        self.active_staff_listeners.append(websocket)

    def disconnect_staff_list(self, websocket: WebSocket):
        if websocket in self.active_staff_listeners:
            self.active_staff_listeners.remove(websocket)

    async def broadcast_staff_list(self, payload: dict):
        disconnected = []

        for websocket in self.active_staff_listeners:
            try:
                await websocket.send_json(payload)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect_staff_list(websocket)

    async def connect_user_presence(self, id_tai_khoan: int, websocket: WebSocket):
        await websocket.accept()

        if id_tai_khoan not in self.active_user_connections:
            self.active_user_connections[id_tai_khoan] = []

        self.active_user_connections[id_tai_khoan].append(websocket)

    def disconnect_user_presence(self, id_tai_khoan: int, websocket: WebSocket):
        sockets = self.active_user_connections.get(id_tai_khoan, [])

        if websocket in sockets:
            sockets.remove(websocket)

        if not sockets:
            self.active_user_connections.pop(id_tai_khoan, None)
            self.user_last_seen[id_tai_khoan] = datetime.now()

    def is_user_online(self, id_tai_khoan: int):
        return bool(self.active_user_connections.get(id_tai_khoan))

    def get_user_last_seen(self, id_tai_khoan: int):
        return self.user_last_seen.get(id_tai_khoan)

    def get_user_presence(self, id_tai_khoan: int):
        return {
            "isOnline": self.is_user_online(id_tai_khoan),
            "lastSeen": self.get_user_last_seen(id_tai_khoan),
        }


manager = ConnectionManager()