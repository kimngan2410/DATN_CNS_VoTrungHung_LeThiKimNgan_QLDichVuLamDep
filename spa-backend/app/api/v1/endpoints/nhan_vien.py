import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.crud.nhan_vien_crud import (
    create_admin_employee,
    delete_admin_employee,
    get_admin_employees,
    get_employee_or_404,
    build_employee_response,
    update_admin_employee,
)
from app.db.session import get_db
from app.schemas.nhan_vien_schema import (
    AdminEmployeeActionResponse,
    AdminEmployeeCreateRequest,
    AdminEmployeeOut,
    AdminEmployeeUpdateRequest,
)


router = APIRouter()


@router.get(
    "/admin/danh-sach",
    response_model=list[AdminEmployeeOut],
)
def get_admin_employee_list(
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_employees(db)


@router.get(
    "/admin/{id_nhan_vien}",
    response_model=AdminEmployeeOut,
)
def get_admin_employee_detail(
    id_nhan_vien: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    employee = get_employee_or_404(db, id_nhan_vien)
    return build_employee_response(employee)


@router.post(
    "/admin/tao",
    response_model=AdminEmployeeActionResponse,
)
def create_admin_employee_api(
    payload: AdminEmployeeCreateRequest,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return create_admin_employee(db, payload)


@router.put(
    "/admin/{id_nhan_vien}",
    response_model=AdminEmployeeActionResponse,
)
def update_admin_employee_api(
    id_nhan_vien: int,
    payload: AdminEmployeeUpdateRequest,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return update_admin_employee(db, id_nhan_vien, payload)


@router.delete(
    "/admin/{id_nhan_vien}",
    response_model=AdminEmployeeActionResponse,
)
def delete_admin_employee_api(
    id_nhan_vien: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return delete_admin_employee(db, id_nhan_vien)

@router.post("/admin/upload-avatar")
async def upload_employee_avatar(
    file: UploadFile = File(...),
):
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Chỉ cho phép upload file ảnh JPG, PNG hoặc WEBP",
        )

    upload_dir = "uploads/employees"
    os.makedirs(upload_dir, exist_ok=True)

    file_extension = os.path.splitext(file.filename or "")[1] or ".jpg"
    file_name = f"{uuid4().hex}{file_extension}"
    file_path = os.path.join(upload_dir, file_name)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    return {
        "url": f"/uploads/employees/{file_name}"
    }