import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserRound,
  Filter,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  User,
  Phone,
  CalendarDays,
  Clock3,
  ClipboardList,
  ListChecks,
  CheckCircle2,
  BadgeCheck,
  UserCheck,
  PlayCircle,
  XCircle,
  UserX,
} from "lucide-react";

import StaffPageHeader from "../../../components/StaffPageHeader/StaffPageHeader";
import {
  createStaffAppointmentApi,
  getStaffAppointmentsApi,
  updateStaffAppointmentStatusApi,
} from "../../../services/staffAppointmentApi";
import {
  createStaffCustomerApi,
  getStaffCustomersApi,
} from "../../../services/staffCustomerApi";
import {
  getServiceCategoriesApi,
  getServicesApi,
} from "../../../services/serviceApi";

import "./StaffAppointments.css";

const TODAY = new Date();

const statusOptions = [
  "Tất cả",
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đã check-in",
  "Đang thực hiện",
  "Đã hoàn thành",
  "Đã huỷ",
  "Không đến",
];

const blockedStatuses = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đã check-in",
  "Đang thực hiện",
];

const monthNames = [
  "Tháng Một",
  "Tháng Hai",
  "Tháng Ba",
  "Tháng Tư",
  "Tháng Năm",
  "Tháng Sáu",
  "Tháng Bảy",
  "Tháng Tám",
  "Tháng Chín",
  "Tháng Mười",
  "Tháng Mười Một",
  "Tháng Mười Hai",
];

const weekdayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

const formatDateToValue = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date) => {
  const weekdays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  return `${weekdays[date.getDay()]} ${date.getDate()} thg ${date.getMonth() + 1}`;
};

const formatMonthTitle = (date) => {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

const addMonths = (date, months) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const isSameDate = (dateA, dateB) => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

const formatMoney = (value) => {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
};

const getServiceQuantity = (service) => {
  return Number(service?.soLuong || 1);
};

const getServiceDuration = (service) => {
  return Number(service?.thoiLuongPhut || service?.duration || 0);
};

const getServiceSubtotal = (service) => {
  if (service?.thanhTien !== undefined) {
    return Number(service.thanhTien || 0);
  }

  return Number(service?.price || 0) * getServiceQuantity(service);
};

const getTotalPrice = (services = []) => {
  return services.reduce((total, service) => total + getServiceSubtotal(service), 0);
};

const getTotalDuration = (services = []) => {
  return services.reduce((total, service) => total + getServiceDuration(service), 0);
};

const toMinutes = (time) => {
  if (!time || !time.includes(":")) return 0;

  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const formatTimeFromMinutes = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const getAppointmentEndTime = (appointment) => {
  if (appointment?.endTime) return appointment.endTime;

  const duration = getTotalDuration(appointment?.services || []);
  return formatTimeFromMinutes(toMinutes(appointment?.time) + duration);
};

const isTimeSlotAvailable = ({ selectedDate, startTime, totalDuration, appointments }) => {
  const newStart = toMinutes(startTime);
  const newEnd = newStart + totalDuration;

  return !appointments.some((appointment) => {
    const isSameAppointmentDate = appointment.date === selectedDate;
    const isBlocked = blockedStatuses.includes(appointment.status);

    if (!isSameAppointmentDate || !isBlocked) return false;

    const oldStart = toMinutes(appointment.time);
    const oldEnd = toMinutes(getAppointmentEndTime(appointment));

    return newStart < oldEnd && newEnd > oldStart;
  });
};

const generateAvailableSlots = ({
  selectedDate,
  services,
  appointments,
  openTime = "08:00",
  closeTime = "20:00",
}) => {
  const totalDuration = getTotalDuration(services);

  if (totalDuration <= 0) return [];

  const openMinutes = toMinutes(openTime);
  const closeMinutes = toMinutes(closeTime);
  const slots = [];

  for (let current = openMinutes; current + totalDuration <= closeMinutes; current += 30) {
    const startTime = formatTimeFromMinutes(current);
    const endTime = formatTimeFromMinutes(current + totalDuration);

    const available = isTimeSlotAvailable({
      selectedDate,
      startTime,
      totalDuration,
      appointments,
    });

    slots.push({
      startTime,
      endTime,
      available,
    });
  }

  return slots;
};

const getStatusClass = (status) => {
  switch (status) {
    case "Chờ xác nhận":
      return "pending";
    case "Đã xác nhận":
      return "confirmed";
    case "Đã check-in":
      return "checked";
    case "Đang thực hiện":
      return "doing";
    case "Đã hoàn thành":
      return "completed";
    case "Đã huỷ":
      return "cancelled";
    case "Không đến":
      return "no-show";
    default:
      return "";
  }
};

const getServiceNamesText = (services = []) => {
  if (!services || services.length === 0) return "";

  const serviceNames = services.map((service) => service.name);

  if (serviceNames.length === 1) {
    return serviceNames[0];
  }

  return `${serviceNames.slice(0, 2).join(", ")}...`;
};

const normalizeStaffService = (service) => {
  const serviceId = Number(service.idDichVu || service.id);

  return {
    id: service.maDV || serviceId,
    idDichVu: serviceId,
    name: service.tenDV || service.title || service.name || "Dịch vụ",
    category: service.category || service.tenDanhMuc || service.tenDM || "Dịch vụ",
    price: Number(service.gia || service.price || 0),
    thoiLuongPhut: Number(service.thoiLuongPhut || service.duration || 0),
    isActive: service.isActive !== false,
  };
};

function StaffAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentError, setAppointmentError] = useState("");

  const [customerOptions, setCustomerOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [serviceCategoryOptions, setServiceCategoryOptions] = useState(["Tất cả"]);
  const [isLoadingCreateData, setIsLoadingCreateData] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedDate, setSelectedDate] = useState(TODAY);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
  );

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [invoiceAppointment, setInvoiceAppointment] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
  const [selectedExtraServiceId, setSelectedExtraServiceId] = useState("");
  const [extraServices, setExtraServices] = useState([]);

  const [reasonModal, setReasonModal] = useState(null);
  const [reasonText, setReasonText] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSearchCustomer, setCreateSearchCustomer] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isQuickCustomerMode, setIsQuickCustomerMode] = useState(false);
  const [quickCustomer, setQuickCustomer] = useState({
    name: "",
    phone: "",
  });
  const [createServices, setCreateServices] = useState([]);
  const [createDate, setCreateDate] = useState(formatDateToValue(TODAY));
  const [createTimeSlot, setCreateTimeSlot] = useState(null);
  const [createNote, setCreateNote] = useState("");
  const [createServiceSearch, setCreateServiceSearch] = useState("");
  const [createServiceCategory, setCreateServiceCategory] = useState("Tất cả");

  const selectedDateValue = formatDateToValue(selectedDate);

  useEffect(() => {
    const fetchStaffAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        setAppointmentError("");

        const data = await getStaffAppointmentsApi({
          date: selectedDateValue,
        });

        setAppointments(data);
      } catch (error) {
        setAppointmentError(error.message || "Không thể tải danh sách lịch hẹn.");
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchStaffAppointments();
  }, [selectedDateValue]);

  useEffect(() => {
    const fetchCreateData = async () => {
      try {
        setIsLoadingCreateData(true);

        const [customers, categories, services] = await Promise.all([
          getStaffCustomersApi(),
          getServiceCategoriesApi(),
          getServicesApi(),
        ]);

        const normalizedServices = (services || [])
          .map(normalizeStaffService)
          .filter((service) => service.isActive !== false);

        const categoryNames = (categories || [])
          .map((category) => category.tenDM || category.name || category.category)
          .filter(Boolean);

        setCustomerOptions(customers || []);
        setServiceOptions(normalizedServices);
        setServiceCategoryOptions([
          "Tất cả",
          ...(categoryNames.length > 0
            ? categoryNames
            : [...new Set(normalizedServices.map((service) => service.category || "Dịch vụ"))]),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingCreateData(false);
      }
    };

    fetchCreateData();
  }, []);

  const extraServiceOptions = serviceOptions;

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesKeyword =
        keyword === "" ||
        String(appointment.id || "").toLowerCase().includes(keyword) ||
        String(appointment.customer || "").toLowerCase().includes(keyword) ||
        String(appointment.phone || "").toLowerCase().includes(keyword) ||
        (appointment.services || []).some((service) =>
          String(service.name || "").toLowerCase().includes(keyword)
        );

      const matchesStatus =
        statusFilter === "Tất cả" || appointment.status === statusFilter;

      const matchesDate = appointment.date === selectedDateValue;

      return matchesKeyword && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, selectedDateValue]);

  const appointmentsBySelectedDate = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesDate = appointment.date === selectedDateValue;

      const matchesKeyword =
        keyword === "" ||
        String(appointment.id || "").toLowerCase().includes(keyword) ||
        String(appointment.customer || "").toLowerCase().includes(keyword) ||
        String(appointment.phone || "").toLowerCase().includes(keyword) ||
        (appointment.services || []).some((service) =>
          String(service.name || "").toLowerCase().includes(keyword)
        );

      return matchesDate && matchesKeyword;
    });
  }, [appointments, searchTerm, selectedDateValue]);

  const appointmentStatusCards = useMemo(() => {
    const countByStatus = (status) => {
      return appointmentsBySelectedDate.filter(
        (appointment) => appointment.status === status
      ).length;
    };

    return [
      {
        label: "Tất cả",
        value: appointmentsBySelectedDate.length,
        status: "Tất cả",
        icon: ListChecks,
        type: "all",
      },
      {
        label: "Chờ xác nhận",
        value: countByStatus("Chờ xác nhận"),
        status: "Chờ xác nhận",
        icon: Clock3,
        type: "pending",
      },
      {
        label: "Đã xác nhận",
        value: countByStatus("Đã xác nhận"),
        status: "Đã xác nhận",
        icon: BadgeCheck,
        type: "confirmed",
      },
      {
        label: "Đã check-in",
        value: countByStatus("Đã check-in"),
        status: "Đã check-in",
        icon: UserCheck,
        type: "checked",
      },
      {
        label: "Đang thực hiện",
        value: countByStatus("Đang thực hiện"),
        status: "Đang thực hiện",
        icon: PlayCircle,
        type: "doing",
      },
      {
        label: "Đã hoàn thành",
        value: countByStatus("Đã hoàn thành"),
        status: "Đã hoàn thành",
        icon: CheckCircle2,
        type: "completed",
      },
      {
        label: "Đã huỷ",
        value: countByStatus("Đã huỷ"),
        status: "Đã huỷ",
        icon: XCircle,
        type: "cancelled",
      },
      {
        label: "Không đến",
        value: countByStatus("Không đến"),
        status: "Không đến",
        icon: UserX,
        type: "no-show",
      },
    ];
  }, [appointmentsBySelectedDate]);

  const filteredCustomers = useMemo(() => {
    return customerOptions.filter((customer) => {
      const keyword = createSearchCustomer.trim().toLowerCase();

      if (!keyword) return true;

      return (
        String(customer.id || "").toLowerCase().includes(keyword) ||
        String(customer.maKH || "").toLowerCase().includes(keyword) ||
        String(customer.fullName || "").toLowerCase().includes(keyword) ||
        String(customer.phone || "").includes(keyword) ||
        String(customer.email || "").toLowerCase().includes(keyword)
      );
    });
  }, [customerOptions, createSearchCustomer]);

  const filteredServiceOptions = useMemo(() => {
    return serviceOptions.filter((service) => {
      const keyword = createServiceSearch.trim().toLowerCase();

      const matchesSearch =
        keyword === "" ||
        service.name.toLowerCase().includes(keyword) ||
        service.category.toLowerCase().includes(keyword);

      const matchesCategory =
        createServiceCategory === "Tất cả" || service.category === createServiceCategory;

      return matchesSearch && matchesCategory;
    });
  }, [serviceOptions, createServiceSearch, createServiceCategory]);

  const createAvailableSlots = useMemo(() => {
    return generateAvailableSlots({
      selectedDate: createDate,
      services: createServices,
      appointments,
    });
  }, [createDate, createServices, appointments]);

  const handleGoToday = () => {
    setSelectedDate(TODAY);
    setCalendarMonth(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
    setIsCalendarOpen(false);
  };

  const handlePrevDate = () => {
    setSelectedDate((prev) => {
      const newDate = addDays(prev, -1);
      setCalendarMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      return newDate;
    });

    setIsCalendarOpen(false);
  };

  const handleNextDate = () => {
    setSelectedDate((prev) => {
      const newDate = addDays(prev, 1);
      setCalendarMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      return newDate;
    });

    setIsCalendarOpen(false);
  };

  const handleToggleCalendar = () => {
    setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    setIsCalendarOpen((prev) => !prev);
  };

  const handleSelectCalendarDate = (date) => {
    setSelectedDate(date);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsCalendarOpen(false);
  };

  const handlePrevCalendarMonth = () => {
    setCalendarMonth((prev) => addMonths(prev, -1));
  };

  const handleNextCalendarMonth = () => {
    setCalendarMonth((prev) => addMonths(prev, 1));
  };

  const resetCreateForm = () => {
    setCreateSearchCustomer("");
    setSelectedCustomer(null);
    setIsQuickCustomerMode(false);
    setQuickCustomer({
      name: "",
      phone: "",
    });
    setCreateServices([]);
    setCreateDate(formatDateToValue(TODAY));
    setCreateTimeSlot(null);
    setCreateNote("");
    setCreateServiceSearch("");
    setCreateServiceCategory("Tất cả");
  };

  const handleCreateAppointment = () => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (isSubmittingCreate) return;

    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer({
      ...customer,
      name: customer.fullName,
      phone: customer.phone,
    });
    setIsQuickCustomerMode(false);
  };

  const handleAddServiceToCreate = (service) => {
    setCreateServices((prev) => {
      const existed = prev.some((item) => item.idDichVu === service.idDichVu);

      if (existed) {
        return prev.map((item) =>
          item.idDichVu === service.idDichVu
            ? { ...item, soLuong: getServiceQuantity(item) + 1 }
            : item
        );
      }

      return [...prev, { ...service, soLuong: 1 }];
    });

    setCreateTimeSlot(null);
  };

  const handleIncreaseCreateService = (serviceId) => {
    setCreateServices((prev) =>
      prev.map((service) =>
        service.idDichVu === serviceId
          ? { ...service, soLuong: getServiceQuantity(service) + 1 }
          : service
      )
    );

    setCreateTimeSlot(null);
  };

  const handleDecreaseCreateService = (serviceId) => {
    setCreateServices((prev) =>
      prev.map((service) =>
        service.idDichVu === serviceId
          ? {
              ...service,
              soLuong: Math.max(1, getServiceQuantity(service) - 1),
            }
          : service
      )
    );

    setCreateTimeSlot(null);
  };

  const handleRemoveCreateService = (serviceId) => {
    setCreateServices((prev) =>
      prev.filter((service) => service.idDichVu !== serviceId)
    );

    setCreateTimeSlot(null);
  };

  const handleConfirmCreateAppointment = async () => {
    if (isSubmittingCreate) return;

    let customer = isQuickCustomerMode ? quickCustomer : selectedCustomer;

    if (!customer || !customer.name?.trim() || !customer.phone?.trim()) {
      alert("Vui lòng chọn khách hàng hoặc nhập thông tin khách hàng mới.");
      return;
    }

    if (createServices.length === 0) {
      alert("Vui lòng chọn ít nhất một dịch vụ.");
      return;
    }

    if (!createTimeSlot) {
      alert("Vui lòng chọn khung giờ còn trống.");
      return;
    }

    try {
      setIsSubmittingCreate(true);

      if (isQuickCustomerMode) {
        const result = await createStaffCustomerApi({
          fullName: customer.name.trim(),
          phone: customer.phone.trim(),
          email: null,
          gender: "Nữ",
          birthday: null,
          loaiKH: "Thường",
          status: "Đang hoạt động",
        });

        customer = {
          ...result.customer,
          name: result.customer.fullName,
          phone: result.customer.phone,
        };

        setCustomerOptions((prev) => [result.customer, ...prev]);
      }

      const createdAppointment = await createStaffAppointmentApi({
        idTaiKhoan: customer.idTaiKhoan,
        ngayHen: createDate,
        gioHen: createTimeSlot.startTime,
        ghiChu: createNote || "Lịch hẹn được tạo tại quầy.",
        dichVuItems: createServices.map((service) => ({
          idDichVu: Number(service.idDichVu || service.id),
          soLuong: getServiceQuantity(service),
        })),
      });

      setAppointments((prev) => [createdAppointment, ...prev]);
      setSelectedDate(new Date(`${createDate}T00:00:00`));
      setCalendarMonth(new Date(`${createDate}T00:00:00`));
      setIsCreateModalOpen(false);
      resetCreateForm();

      alert("Tạo lịch hẹn thành công. Trạng thái lịch hẹn là Đã xác nhận.");
    } catch (error) {
      alert(error.message || "Không thể tạo lịch hẹn.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleOpenDetail = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetail = () => {
    setSelectedAppointment(null);
  };

  const handleOpenReasonModal = (nextStatus) => {
    if (!selectedAppointment) return;

    setReasonModal({
      appointmentId: selectedAppointment.id,
      nextStatus,
      title:
        nextStatus === "Đã huỷ"
          ? "Nhập lý do huỷ lịch"
          : "Nhập lý do khách không đến",
      label:
        nextStatus === "Đã huỷ"
          ? "Nhập lý do huỷ lịch *"
          : "Nhập lý do không đến *",
      placeholder:
        nextStatus === "Đã huỷ"
          ? "Khách không đến, khách bận..."
          : "Khách không phản hồi, khách không đến spa...",
    });

    setReasonText("");
  };

  const handleCloseReasonModal = () => {
    setReasonModal(null);
    setReasonText("");
  };

  const handleConfirmReason = async () => {
    if (!reasonModal) return;

    if (!reasonText.trim()) {
      alert("Vui lòng nhập lý do.");
      return;
    }

    await handleUpdateStatus(reasonModal.nextStatus, reasonText.trim());
    setReasonModal(null);
    setReasonText("");
  };

  const handleUpdateStatus = async (nextStatus, reason = "") => {
    if (!selectedAppointment || isUpdatingStatus) return;

    const currentStatus = selectedAppointment.status;

    const allowedTransitions = {
      "Chờ xác nhận": ["Đã xác nhận", "Đã huỷ"],
      "Đã xác nhận": ["Đã check-in", "Không đến", "Đã huỷ"],
      "Đã check-in": ["Đang thực hiện"],
      "Đang thực hiện": [],
      "Đã hoàn thành": [],
      "Đã huỷ": [],
      "Không đến": [],
    };

    const isAllowed = allowedTransitions[currentStatus]?.includes(nextStatus);

    if (!isAllowed) {
      alert("Không thể cập nhật trạng thái này theo quy trình hiện tại.");
      return;
    }

    try {
      setIsUpdatingStatus(true);

      const updatedAppointment = await updateStaffAppointmentStatusApi(
        selectedAppointment.appointmentId,
        {
          trangThai: nextStatus,
          lyDo: reason,
        }
      );

      setAppointments((prev) =>
        prev.map((item) =>
          item.appointmentId === updatedAppointment.appointmentId
            ? updatedAppointment
            : item
        )
      );

      setSelectedAppointment(updatedAppointment);
      alert("Cập nhật trạng thái lịch hẹn thành công.");
    } catch (error) {
      alert(error.message || "Không thể cập nhật trạng thái lịch hẹn.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenInvoice = () => {
    if (!selectedAppointment) return;

    if (selectedAppointment.status !== "Đang thực hiện") {
      alert("Chỉ lịch hẹn đang thực hiện mới được lập hoá đơn.");
      return;
    }

    setInvoiceAppointment(selectedAppointment);
    setSelectedAppointment(null);
    setPaymentMethod("Tiền mặt");
    setSelectedExtraServiceId("");
    setExtraServices([]);
  };

  const handleCloseInvoice = () => {
    setInvoiceAppointment(null);
    setPaymentMethod("Tiền mặt");
    setSelectedExtraServiceId("");
    setExtraServices([]);
  };

  const handleAddExtraService = () => {
    if (!selectedExtraServiceId) {
      alert("Vui lòng chọn dịch vụ phát sinh.");
      return;
    }

    const selectedService = extraServiceOptions.find(
      (service) => String(service.idDichVu || service.id) === String(selectedExtraServiceId)
    );

    if (!selectedService) return;

    setExtraServices((prev) => {
      const existed = prev.some((service) => service.idDichVu === selectedService.idDichVu);

      if (existed) {
        return prev.map((service) =>
          service.idDichVu === selectedService.idDichVu
            ? { ...service, soLuong: getServiceQuantity(service) + 1 }
            : service
        );
      }

      return [...prev, { ...selectedService, soLuong: 1 }];
    });

    setSelectedExtraServiceId("");
  };

  const handleRemoveExtraService = (serviceId) => {
    setExtraServices((prev) =>
      prev.filter((service) => service.idDichVu !== serviceId)
    );
  };

  const handleConfirmPayment = () => {
    if (!invoiceAppointment) return;

    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    const updatedAppointment = {
      ...invoiceAppointment,
      status: "Đã hoàn thành",
    };

    setAppointments((prev) =>
      prev.map((item) =>
        item.appointmentId === invoiceAppointment.appointmentId
          ? updatedAppointment
          : item
      )
    );

    setInvoiceAppointment(null);
    setPaymentMethod("Tiền mặt");
    setSelectedExtraServiceId("");
    setExtraServices([]);

    alert("Thanh toán thành công. Lịch hẹn đã được cập nhật thành Đã hoàn thành.");
  };

  const renderCalendarMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const leadingBlankCount = (firstDay.getDay() + 6) % 7;

    const calendarCells = [
      ...Array.from({ length: leadingBlankCount }, () => null),
      ...Array.from({ length: totalDays }, (_, index) => {
        return new Date(year, month, index + 1);
      }),
    ];

    return (
      <div className="staff-calendar-month">
        <h3>{formatMonthTitle(monthDate)}</h3>

        <div className="staff-calendar-weekdays">
          {weekdayLabels.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="staff-calendar-days">
          {calendarCells.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="staff-calendar-empty"></div>;
            }

            const isSelected = isSameDate(date, selectedDate);
            const isToday = isSameDate(date, TODAY);

            return (
              <button
                type="button"
                key={formatDateToValue(date)}
                className={[
                  "staff-calendar-day",
                  isSelected ? "selected" : "",
                  isToday ? "today" : "",
                ].join(" ")}
                onClick={() => handleSelectCalendarDate(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderModalActions = () => {
    if (!selectedAppointment) return null;

    switch (selectedAppointment.status) {
      case "Chờ xác nhận":
        return (
          <>
            <button
              type="button"
              className="appointment-modal-action-btn primary"
              onClick={() => handleUpdateStatus("Đã xác nhận")}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? "Đang xử lý..." : "Xác nhận lịch"}
            </button>

            <button
              type="button"
              className="appointment-modal-action-btn danger"
              onClick={() => handleOpenReasonModal("Đã huỷ")}
              disabled={isUpdatingStatus}
            >
              Huỷ lịch
            </button>
          </>
        );

      case "Đã xác nhận":
        return (
          <>
            <button
              type="button"
              className="appointment-modal-action-btn primary"
              onClick={() => handleUpdateStatus("Đã check-in")}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? "Đang xử lý..." : "Check-in"}
            </button>

            <button
              type="button"
              className="appointment-modal-action-btn warning"
              onClick={() => handleOpenReasonModal("Không đến")}
              disabled={isUpdatingStatus}
            >
              Không đến
            </button>

            <button
              type="button"
              className="appointment-modal-action-btn danger"
              onClick={() => handleOpenReasonModal("Đã huỷ")}
              disabled={isUpdatingStatus}
            >
              Huỷ lịch
            </button>
          </>
        );

      case "Đã check-in":
        return (
          <button
            type="button"
            className="appointment-modal-action-btn primary"
            onClick={() => handleUpdateStatus("Đang thực hiện")}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? "Đang xử lý..." : "Bắt đầu dịch vụ"}
          </button>
        );

      case "Đang thực hiện":
        return (
          <button
            type="button"
            className="appointment-modal-action-btn primary"
            onClick={handleOpenInvoice}
          >
            Lập hoá đơn
          </button>
        );

      case "Đã hoàn thành":
      case "Đã huỷ":
      case "Không đến":
      default:
        return (
          <button
            type="button"
            className="appointment-modal-action-btn neutral"
            onClick={handleCloseDetail}
          >
            Đóng
          </button>
        );
    }
  };

  return (
    <div className="staff-appointments-page">
      <StaffPageHeader title="Quản lý lịch hẹn" />

      <section className="staff-appointments-content">
        <div className="staff-appointments-summary-grid">
          {appointmentStatusCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                type="button"
                key={card.status}
                className={[
                  "staff-appointments-summary-card",
                  card.type,
                  statusFilter === card.status ? "active" : "",
                ].join(" ")}
                onClick={() => setStatusFilter(card.status)}
              >
                <div className="staff-appointments-summary-icon">
                  <Icon size={20} />
                </div>

                <div>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </div>
              </button>
            );
          })}
        </div>

        <div className="staff-appointments-card">
          <div className="staff-appointments-toolbar">
            <div className="staff-appointments-toolbar-left">
              <div className="staff-appointments-search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, mã lịch hẹn..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="staff-appointments-filter-box">
                <Filter size={18} />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="staff-appointments-date-group">
                <button
                  type="button"
                  className="staff-appointments-today-btn"
                  onClick={handleGoToday}
                >
                  Hôm nay
                </button>

                <div className="staff-appointments-date-navigator">
                  <button
                    type="button"
                    className="staff-appointments-date-nav-btn"
                    onClick={handlePrevDate}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    className="staff-appointments-date-display"
                    onClick={handleToggleCalendar}
                  >
                    {formatDisplayDate(selectedDate)}
                  </button>

                  <button
                    type="button"
                    className="staff-appointments-date-nav-btn"
                    onClick={handleNextDate}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {isCalendarOpen && (
                  <div className="staff-calendar-popover">
                    <div className="staff-calendar-popover-nav">
                      <button type="button" onClick={handlePrevCalendarMonth}>
                        <ChevronLeft size={18} />
                      </button>

                      <button type="button" onClick={handleNextCalendarMonth}>
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    <div className="staff-calendar-months">
                      {renderCalendarMonth(calendarMonth)}
                      {renderCalendarMonth(addMonths(calendarMonth, 1))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="staff-appointments-create-btn"
              onClick={handleCreateAppointment}
            >
              <Plus size={18} />
              <span>Tạo lịch hẹn</span>
            </button>
          </div>

          <div className="staff-appointments-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã LH</th>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Ngày hẹn</th>
                  <th>Giờ hẹn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {isLoadingAppointments ? (
                  <tr>
                    <td colSpan="7" className="staff-appointments-empty">
                      Đang tải danh sách lịch hẹn...
                    </td>
                  </tr>
                ) : appointmentError ? (
                  <tr>
                    <td colSpan="7" className="staff-appointments-empty">
                      {appointmentError}
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="staff-appointments-empty">
                      Hiện chưa có lịch hẹn nào
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="staff-appointments-row"
                      onClick={() => handleOpenDetail(appointment)}
                      title="Nhấn để xem chi tiết lịch hẹn"
                    >
                      <td className="staff-appointments-id">{appointment.id}</td>

                      <td>
                        <strong>{appointment.customer}</strong>
                        <p>{appointment.phone}</p>
                      </td>

                      <td>
                        <div
                          className="staff-appointments-service"
                          title={(appointment.services || [])
                            .map((service) => service.name)
                            .join(", ")}
                        >
                          {getServiceNamesText(appointment.services)}
                        </div>
                      </td>

                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>

                      <td>
                        <span
                          className={`staff-appointments-status ${getStatusClass(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="staff-appointments-view-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenDetail(appointment);
                          }}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedAppointment && (
        <div className="appointment-modal-overlay" onClick={handleCloseDetail}>
          <div
            className="appointment-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="appointment-modal-header">
              <h2>Chi tiết lịch hẹn {selectedAppointment.id}</h2>

              <button
                type="button"
                className="appointment-modal-close"
                onClick={handleCloseDetail}
              >
                <X size={22} />
              </button>
            </div>

            <div className="appointment-modal-body">
              <div className="appointment-modal-status-row">
                <span>Trạng thái hiện tại:</span>

                <span
                  className={`staff-appointments-status ${getStatusClass(
                    selectedAppointment.status
                  )}`}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="appointment-modal-info-box">
                <div className="appointment-modal-info-item">
                  <User size={19} />
                  <span>{selectedAppointment.customer}</span>
                </div>

                <div className="appointment-modal-info-item">
                  <Phone size={19} />
                  <span>{selectedAppointment.phone}</span>
                </div>

                <div className="appointment-modal-info-item">
                  <CalendarDays size={19} />
                  <span>{selectedAppointment.date}</span>
                </div>

                <div className="appointment-modal-info-item">
                  <Clock3 size={19} />
                  <span>
                    {selectedAppointment.time} - {getAppointmentEndTime(selectedAppointment)}
                  </span>
                </div>
              </div>

              <div className="appointment-modal-section">
                <h3>Dịch vụ đã đặt</h3>

                <div className="appointment-modal-service-list">
                  {(selectedAppointment.services || []).map((service, index) => (
                    <div className="appointment-modal-service-item" key={index}>
                      <div>
                        <span>{service.name}</span>
                        <p>
                          SL: {getServiceQuantity(service)} × {formatMoney(service.price)}
                        </p>
                      </div>

                      <strong>{formatMoney(getServiceSubtotal(service))}</strong>
                    </div>
                  ))}
                </div>

                <div className="appointment-modal-total">
                  <span>Tổng cộng</span>
                  <strong>{formatMoney(getTotalPrice(selectedAppointment.services))}</strong>
                </div>
              </div>

              <div className="appointment-modal-section">
                <h3 className="appointment-modal-note-title">
                  <ClipboardList size={17} />
                  <span>Ghi chú</span>
                </h3>

                <div className="appointment-modal-note">
                  {selectedAppointment.note || "Không có ghi chú"}
                </div>
              </div>

              {selectedAppointment.statusReason && (
                <div className="appointment-modal-section">
                  <h3>
                    {selectedAppointment.status === "Đã huỷ"
                      ? "Lý do huỷ lịch"
                      : "Lý do không đến"}
                  </h3>

                  <div className="appointment-modal-reason">
                    {selectedAppointment.statusReason}
                  </div>
                </div>
              )}
            </div>

            <div className="appointment-modal-footer">{renderModalActions()}</div>
          </div>
        </div>
      )}

      {invoiceAppointment && (
        <div className="appointment-modal-overlay" onClick={handleCloseInvoice}>
          <div
            className="appointment-modal invoice-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="appointment-modal-header">
              <h2>Lập hoá đơn {invoiceAppointment.id}</h2>

              <button
                type="button"
                className="appointment-modal-close"
                onClick={handleCloseInvoice}
              >
                <X size={22} />
              </button>
            </div>

            <div className="appointment-modal-body">
              <div className="appointment-modal-info-box">
                <div className="appointment-modal-info-item">
                  <User size={19} />
                  <span>{invoiceAppointment.customer}</span>
                </div>

                <div className="appointment-modal-info-item">
                  <Phone size={19} />
                  <span>{invoiceAppointment.phone}</span>
                </div>

                <div className="appointment-modal-info-item">
                  <CalendarDays size={19} />
                  <span>
                    {invoiceAppointment.date} - {invoiceAppointment.time}
                  </span>
                </div>
              </div>

              <div className="appointment-modal-section">
                <h3>Dịch vụ trong hoá đơn</h3>

                <div className="invoice-service-table">
                  <div className="invoice-service-row invoice-service-head">
                    <span>Dịch vụ</span>
                    <span>SL</span>
                    <span>Đơn giá</span>
                    <span>Thành tiền</span>
                    <span></span>
                  </div>

                  {(invoiceAppointment.services || []).map((service, index) => (
                    <div className="invoice-service-row" key={`main-${index}`}>
                      <span>{service.name}</span>
                      <span>{getServiceQuantity(service)}</span>
                      <span>{formatMoney(service.price)}</span>
                      <strong>{formatMoney(getServiceSubtotal(service))}</strong>
                      <span></span>
                    </div>
                  ))}

                  {extraServices.map((service) => (
                    <div className="invoice-service-row" key={service.idDichVu || service.id}>
                      <span>{service.name}</span>
                      <span>{getServiceQuantity(service)}</span>
                      <span>{formatMoney(service.price)}</span>
                      <strong>{formatMoney(getServiceSubtotal(service))}</strong>

                      <button
                        type="button"
                        className="invoice-remove-service-btn"
                        onClick={() => handleRemoveExtraService(service.idDichVu)}
                      >
                        Xoá
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="appointment-modal-section">
                <h3>Thêm dịch vụ phát sinh</h3>

                <div className="invoice-extra-service-box">
                  <select
                    value={selectedExtraServiceId}
                    onChange={(event) => setSelectedExtraServiceId(event.target.value)}
                  >
                    <option value="">Chọn dịch vụ phát sinh</option>

                    {extraServiceOptions.map((service) => (
                      <option key={service.idDichVu || service.id} value={service.idDichVu || service.id}>
                        {service.name} - {formatMoney(service.price)}
                      </option>
                    ))}
                  </select>

                  <button type="button" onClick={handleAddExtraService}>
                    Thêm dịch vụ
                  </button>
                </div>
              </div>

              <div className="appointment-modal-section">
                <h3>Phương thức thanh toán</h3>

                <div className="invoice-payment-methods">
                  {["Tiền mặt", "Chuyển khoản", "Thẻ ngân hàng"].map((method) => (
                    <button
                      type="button"
                      key={method}
                      className={paymentMethod === method ? "active" : ""}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="appointment-modal-total invoice-total">
                <span>Tổng thanh toán</span>
                <strong>
                  {formatMoney(
                    getTotalPrice(invoiceAppointment.services || []) +
                      getTotalPrice(extraServices)
                  )}
                </strong>
              </div>
            </div>

            <div className="appointment-modal-footer">
              <button
                type="button"
                className="appointment-modal-action-btn neutral"
                onClick={handleCloseInvoice}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="appointment-modal-action-btn primary"
                onClick={handleConfirmPayment}
              >
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {reasonModal && (
        <div className="appointment-modal-overlay" onClick={handleCloseReasonModal}>
          <div
            className="appointment-reason-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="appointment-modal-header">
              <h2>{reasonModal.title}</h2>

              <button
                type="button"
                className="appointment-modal-close"
                onClick={handleCloseReasonModal}
              >
                <X size={22} />
              </button>
            </div>

            <div className="appointment-reason-body">
              <label>{reasonModal.label}</label>

              <textarea
                value={reasonText}
                onChange={(event) => setReasonText(event.target.value)}
                placeholder={reasonModal.placeholder}
              ></textarea>
            </div>

            <div className="appointment-modal-footer">
              <button
                type="button"
                className="appointment-modal-action-btn neutral"
                onClick={handleCloseReasonModal}
                disabled={isUpdatingStatus}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="appointment-modal-action-btn primary"
                onClick={handleConfirmReason}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="create-appointment-overlay" onClick={handleCloseCreateModal}>
          <div
            className="create-appointment-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="create-appointment-header">
              <div>
                <h2>Tạo lịch hẹn tại quầy</h2>
                <p>Chọn khách hàng, dịch vụ và khung giờ còn trống.</p>
              </div>

              <button
                type="button"
                className="appointment-modal-close"
                onClick={handleCloseCreateModal}
                disabled={isSubmittingCreate}
              >
                <X size={22} />
              </button>
            </div>

            <div className="create-appointment-body">
              <div className="create-appointment-grid">
                <div className="create-appointment-left">
                  <div className="create-section">
                    <h3>1. Chọn khách hàng</h3>

                    {!isQuickCustomerMode ? (
                      <>
                        <div className="create-search-box">
                          <Search size={16} />
                          <input
                            type="text"
                            placeholder="Tìm theo tên, SĐT, mã KH..."
                            value={createSearchCustomer}
                            onChange={(event) => setCreateSearchCustomer(event.target.value)}
                          />
                        </div>

                        <div className="create-customer-list">
                          {isLoadingCreateData ? (
                            <div className="create-empty-text">Đang tải khách hàng...</div>
                          ) : filteredCustomers.length === 0 ? (
                            <div className="create-empty-customer">
                              <UserRound size={26} />
                              <p>Không tìm thấy khách hàng phù hợp.</p>
                            </div>
                          ) : (
                            filteredCustomers.map((customer) => (
                              <button
                                type="button"
                                key={customer.id}
                                className={
                                  selectedCustomer?.id === customer.id
                                    ? "create-customer-card active"
                                    : "create-customer-card"
                                }
                                onClick={() => handleSelectCustomer(customer)}
                              >
                                <strong>{customer.fullName}</strong>
                                <span>{customer.phone || customer.email}</span>
                              </button>
                            ))
                          )}
                        </div>

                        <button
                          type="button"
                          className="create-quick-customer-btn"
                          onClick={() => {
                            setIsQuickCustomerMode(true);
                            setSelectedCustomer(null);
                          }}
                        >
                          <Plus size={16} />
                          <span>Thêm nhanh khách hàng mới</span>
                        </button>
                      </>
                    ) : (
                      <div className="quick-customer-box">
                        <div className="quick-customer-input">
                          <label>Họ tên khách hàng</label>
                          <input
                            type="text"
                            value={quickCustomer.name}
                            onChange={(event) =>
                              setQuickCustomer((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="quick-customer-input">
                          <label>Số điện thoại</label>
                          <input
                            type="text"
                            value={quickCustomer.phone}
                            onChange={(event) =>
                              setQuickCustomer((prev) => ({
                                ...prev,
                                phone: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="back-select-customer"
                          onClick={() => setIsQuickCustomerMode(false)}
                        >
                          Quay lại chọn khách có sẵn
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="create-section">
                    <h3>2. Chọn dịch vụ</h3>

                    <div className="create-service-tools">
                      <div className="create-service-search">
                        <Search size={16} />
                        <input
                          type="text"
                          placeholder="Tìm dịch vụ theo tên..."
                          value={createServiceSearch}
                          onChange={(event) => setCreateServiceSearch(event.target.value)}
                        />
                      </div>

                      <div className="create-service-category-tabs">
                        {serviceCategoryOptions.map((category) => (
                          <button
                            type="button"
                            key={category}
                            className={
                              createServiceCategory === category
                                ? "create-category-tab active"
                                : "create-category-tab"
                            }
                            onClick={() => setCreateServiceCategory(category)}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="create-service-list">
                      {isLoadingCreateData ? (
                        <div className="create-empty-service">Đang tải dịch vụ...</div>
                      ) : filteredServiceOptions.length === 0 ? (
                        <div className="create-empty-service">
                          Không tìm thấy dịch vụ phù hợp.
                        </div>
                      ) : (
                        filteredServiceOptions.map((service) => {
                          const selected = createServices.find(
                            (item) => item.idDichVu === service.idDichVu
                          );

                          return (
                            <div className="create-service-card" key={service.idDichVu}>
                              <div>
                                <strong>{service.name}</strong>

                                <p>
                                  <span>{service.category}</span>
                                  {" · "}
                                  {service.thoiLuongPhut} phút · {formatMoney(service.price)}
                                </p>
                              </div>

                              {selected ? (
                                <div className="create-service-qty">
                                  <button
                                    type="button"
                                    onClick={() => handleDecreaseCreateService(service.idDichVu)}
                                  >
                                    <Minus size={14} />
                                  </button>

                                  <span>{getServiceQuantity(selected)}</span>

                                  <button
                                    type="button"
                                    onClick={() => handleIncreaseCreateService(service.idDichVu)}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="add-create-service-btn"
                                  onClick={() => handleAddServiceToCreate(service)}
                                >
                                  Thêm
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="create-appointment-right">
                  <div className="create-section">
                    <h3>3. Dịch vụ đã chọn</h3>

                    {createServices.length === 0 ? (
                      <p className="create-empty-text">Chưa chọn dịch vụ nào.</p>
                    ) : (
                      <div className="create-selected-services">
                        {createServices.map((service) => (
                          <div className="create-selected-service" key={service.idDichVu}>
                            <div>
                              <strong>{service.name}</strong>
                              <p>
                                SL: {getServiceQuantity(service)} × {formatMoney(service.price)}
                              </p>
                            </div>

                            <div className="create-selected-service-right">
                              <strong>{formatMoney(getServiceSubtotal(service))}</strong>

                              <button
                                type="button"
                                onClick={() => handleRemoveCreateService(service.idDichVu)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="create-summary-box">
                          <div>
                            <span>Tổng thời lượng</span>
                            <strong>{getTotalDuration(createServices)} phút</strong>
                          </div>

                          <div>
                            <span>Tạm tính</span>
                            <strong>{formatMoney(getTotalPrice(createServices))}</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="create-section">
                    <h3>4. Chọn ngày hẹn</h3>

                    <input
                      type="date"
                      className="create-date-input"
                      value={createDate}
                      onChange={(event) => {
                        setCreateDate(event.target.value);
                        setCreateTimeSlot(null);
                      }}
                    />
                  </div>

                  <div className="create-section">
                    <h3>5. Khung giờ khả dụng</h3>

                    {createServices.length === 0 ? (
                      <p className="create-empty-text">
                        Vui lòng chọn dịch vụ để hệ thống tính thời lượng.
                      </p>
                    ) : createAvailableSlots.length === 0 ? (
                      <p className="create-empty-text">
                        Không có khung giờ phù hợp trong ngày này.
                      </p>
                    ) : (
                      <div className="create-slot-grid">
                        {createAvailableSlots.map((slot) => (
                          <button
                            type="button"
                            key={`${slot.startTime}-${slot.endTime}`}
                            className={[
                              "create-time-slot",
                              slot.available ? "available" : "disabled",
                              createTimeSlot?.startTime === slot.startTime ? "active" : "",
                            ].join(" ")}
                            disabled={!slot.available}
                            onClick={() => setCreateTimeSlot(slot)}
                          >
                            <strong>{slot.startTime}</strong>
                            <span>{slot.endTime}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="create-section">
                    <h3>6. Ghi chú</h3>

                    <textarea
                      className="create-note-input"
                      placeholder="Nhập ghi chú cho lịch hẹn nếu có..."
                      value={createNote}
                      onChange={(event) => setCreateNote(event.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="create-appointment-footer">
              <button
                type="button"
                className="create-cancel-btn"
                onClick={handleCloseCreateModal}
                disabled={isSubmittingCreate}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="create-confirm-btn"
                onClick={handleConfirmCreateAppointment}
                disabled={isSubmittingCreate || isLoadingCreateData}
              >
                {isSubmittingCreate ? "Đang tạo..." : "Xác nhận tạo lịch hẹn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffAppointments;
