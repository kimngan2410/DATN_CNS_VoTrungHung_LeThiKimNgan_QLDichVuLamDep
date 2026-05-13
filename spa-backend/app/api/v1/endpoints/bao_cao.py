from fastapi import APIRouter

router = APIRouter()


@router.get("/doanh-thu")
def get_revenue_report():
    return {
        "message": "API báo cáo doanh thu"
    }


@router.get("/hoa-don")
def get_invoice_report():
    return {
        "message": "API báo cáo hóa đơn"
    }


@router.get("/tinh-hinh-su-dung-dich-vu")
def get_service_usage_report():
    return {
        "message": "API báo cáo tình hình sử dụng dịch vụ"
    }


@router.get("/lich-hen")
def get_appointment_report():
    return {
        "message": "API báo cáo lịch hẹn"
    }