import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  X,
  Phone,
  CalendarDays,
  CreditCard,
  Receipt,
  FileText,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Landmark,
} from "lucide-react";
import "./StaffTransactions.css";
import StaffPageHeader from "../../../components/StaffPageHeader/StaffPageHeader";
import {
  getStaffTransactionDetailApi,
  getStaffTransactionsApi,
} from "../../../services/staffTransactionApi";

const TODAY = new Date();
const paymentMethodOptions = [
  "Tất cả",
  "Tiền mặt",
  "Chuyển khoản",
  "Thẻ ngân hàng",
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

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const getItemTotal = (item) => {
  if (item?.thanhTien !== undefined && item?.thanhTien !== null) {
    return Number(item.thanhTien || 0);
  }

  return Number(item?.soLuong || 0) * Number(item?.donGia || 0);
};

const getTransactionSubtotal = (transaction) => {
  const bookedTotal = (transaction?.bookedServices || []).reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );

  const extraTotal = (transaction?.extraServices || []).reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );

  return bookedTotal + extraTotal;
};

const getTransactionDiscount = (transaction) => {
  return Number(
    transaction?.discountAmount ??
      transaction?.giamGia ??
      transaction?.discount ??
      0
  );
};

const getTransactionTotal = (transaction) => {
  if (transaction?.totalAmount !== undefined && transaction?.totalAmount !== null) {
    return Number(transaction.totalAmount || 0);
  }

  return Math.max(getTransactionSubtotal(transaction) - getTransactionDiscount(transaction), 0);
};

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

const formatMonthTitle = (date) => `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

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

const getTransactionDate = (transaction) => transaction.paymentTime.split(" ")[0];

const getStatusClass = (status) => {
  return status === "Đã huỷ" ? "cancelled" : "paid";
};

const isPaidTransaction = (transaction) => {
  return String(transaction?.status || "").trim() === "Đã thanh toán";
};


function StaffTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("Tất cả");
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
  );

  const selectedDateValue = formatDateToValue(selectedDate);

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      setTransactionError("");

      const data = await getStaffTransactionsApi({
        date: selectedDateValue,
      });

      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      setTransactions([]);
      setTransactionError(error.message || "Không thể tải danh sách giao dịch.");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateValue]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const keyword = searchTerm.trim().toLowerCase();
      const transactionDate = getTransactionDate(transaction);

      const matchesKeyword =
        keyword === "" ||
        transaction.idHoaDon.toLowerCase().includes(keyword) ||
        transaction.maLichHen.toLowerCase().includes(keyword) ||
        transaction.customer.toLowerCase().includes(keyword) ||
        transaction.phone.includes(keyword);

      const matchesPaymentMethod =
        paymentMethodFilter === "Tất cả" ||
        transaction.paymentMethod === paymentMethodFilter;

      const matchesDate = transactionDate === selectedDateValue;

      return matchesKeyword && matchesPaymentMethod && matchesDate;
    });
  }, [transactions, searchTerm, paymentMethodFilter, selectedDateValue]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (result, transaction) => {
        const total = getTransactionTotal(transaction);

        result.totalTransactions += 1;
        result.totalRevenue += total;

        if (transaction.paymentMethod === "Tiền mặt") {
          result.cashTotal += total;
        }

        if (transaction.paymentMethod === "Chuyển khoản") {
          result.transferTotal += total;
        }

        if (transaction.paymentMethod === "Thẻ ngân hàng") {
          result.cardTotal += total;
        }

        return result;
      },
      {
        totalTransactions: 0,
        totalRevenue: 0,
        cashTotal: 0,
        transferTotal: 0,
        cardTotal: 0,
      }
    );
  }, [filteredTransactions]);

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
    setCalendarMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
    setIsCalendarOpen((prev) => !prev);
  };

  const handlePrevCalendarMonth = () => {
    setCalendarMonth((prev) => addMonths(prev, -1));
  };

  const handleNextCalendarMonth = () => {
    setCalendarMonth((prev) => addMonths(prev, 1));
  };

  const handleSelectCalendarDate = (date) => {
    setSelectedDate(date);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsCalendarOpen(false);
  };

  const handleOpenDetail = async (transaction) => {
    try {
      const detail = await getStaffTransactionDetailApi(transaction.idHoaDon);
      setSelectedTransaction(detail);
    } catch (error) {
      alert(error.message || "Không thể tải chi tiết giao dịch.");
    }
  };

  const handleCloseDetail = () => {
    setSelectedTransaction(null);
  };

  const handleExportFile = () => {
    if (filteredTransactions.length === 0) {
      alert("Không có dữ liệu để xuất file.")
      return
    }

    const exportDate = new Date().toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    const rowsHtml = filteredTransactions
      .map((item, index) => {
        const total = getTransactionTotal(item)

        return `
          <tr>
            <td class="center">${index + 1}</td>
            <td>${escapeHtml(item.idHoaDon)}</td>
            <td>${escapeHtml(item.maLichHen)}</td>
            <td>${escapeHtml(item.customer)}</td>
            <td class="text">${escapeHtml(item.phone)}</td>
            <td>${escapeHtml(item.paymentTime)}</td>
            <td>${escapeHtml(item.paymentMethod)}</td>
            <td class="money">${Number(total || 0).toLocaleString("vi-VN")} đ</td>
            <td class="status">${escapeHtml(item.status)}</td>
          </tr>
        `
      })
      .join("")

    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #2f2a27;
            }

            table {
              border-collapse: collapse;
              width: 100%;
            }

            .report-title {
              font-size: 22px;
              font-weight: 700;
              color: #2f2a27;
              text-align: center;
            }

            .report-subtitle {
              font-size: 13px;
              color: #6b7280;
              text-align: center;
            }

            .summary-label {
              font-weight: 700;
              background: #fff7e6;
              color: #8d6915;
            }

            .summary-value {
              font-weight: 700;
              color: #2f2a27;
            }

            th {
              background: #4d4a4b;
              color: #ffffff;
              font-weight: 700;
              text-align: center;
              border: 1px solid #d9d9d9;
              padding: 10px;
            }

            td {
              border: 1px solid #d9d9d9;
              padding: 9px;
              vertical-align: middle;
            }

            .center {
              text-align: center;
            }

            .money {
              text-align: right;
              font-weight: 700;
              color: #8d6915;
            }

            .status {
              text-align: center;
              font-weight: 700;
            }

            .text {
              mso-number-format: "\\@";
            }

            .total-row td {
              background: #fff7e6;
              font-weight: 700;
            }
          </style>
        </head>

        <body>
          <table>
            <tr>
              <td colspan="9" class="report-title">
                DANH SÁCH GIAO DỊCH HOÁ ĐƠN
              </td>
            </tr>

            <tr>
              <td colspan="9" class="report-subtitle">
                Ngày xuất file: ${escapeHtml(exportDate)}
              </td>
            </tr>

            <tr>
              <td colspan="9"></td>
            </tr>

            <tr>
              <td class="summary-label" colspan="2">Tổng số giao dịch</td>
              <td class="summary-value" colspan="2">${filteredTransactions.length}</td>
              <td class="summary-label" colspan="2">Tổng doanh thu</td>
              <td class="summary-value money" colspan="3">
                ${Number(summary.totalRevenue || 0).toLocaleString("vi-VN")} đ
              </td>
            </tr>

            <tr>
              <td colspan="9"></td>
            </tr>

            <tr>
              <th>STT</th>
              <th>Mã hoá đơn</th>
              <th>Mã lịch hẹn</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Ngày thanh toán/tạo</th>
              <th>Phương thức thanh toán</th>
              <th>Giá trị hoá đơn</th>
              <th>Trạng thái</th>
            </tr>

            ${rowsHtml}

            <tr class="total-row">
              <td colspan="7">TỔNG DOANH THU</td>
              <td class="money">
                ${Number(summary.totalRevenue || 0).toLocaleString("vi-VN")} đ
              </td>
              <td></td>
            </tr>
          </table>
        </body>
      </html>
    `

    const blob = new Blob(["\uFEFF" + htmlContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `danh-sach-giao-dich-hoa-don-${selectedDateValue}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const handlePrintInvoice = (transaction) => {
    if (!transaction || transaction.status !== "Đã thanh toán") {
      alert("Không thể in hóa đơn đã huỷ.");
      return;
    }

    const allServices = [
      ...(transaction.bookedServices || []),
      ...(transaction.extraServices || []),
    ];

    const serviceRows = allServices
      .map((item, index) => `
        <tr>
          <td class="center">${index + 1}</td>
          <td>
            <strong>${escapeHtml(item.tenDichVu)}</strong>
            ${index >= (transaction.bookedServices || []).length ? '<small>Dịch vụ phát sinh</small>' : ''}
          </td>
          <td class="center">${Number(item.soLuong || 1)}</td>
          <td class="money">${formatMoney(item.donGia)}</td>
          <td class="money">${formatMoney(getItemTotal(item))}</td>
        </tr>
      `)
      .join("");

    const subtotal = getTransactionSubtotal(transaction);
    const discount = getTransactionDiscount(transaction);
    const finalTotal = getTransactionTotal(transaction);
    const discountPercent = subtotal > 0 && discount > 0
      ? Math.round((discount / subtotal) * 100)
      : 0;

    const discountRow = discount > 0
      ? `
        <div class="summary-row discount">
          <span>Giảm giá${discountPercent > 0 ? ` (${discountPercent}%)` : ""}</span>
          <strong>- ${formatMoney(discount)}</strong>
        </div>
      `
      : "";

    const noteRow = transaction.note
      ? `<div class="note-box"><strong>Ghi chú:</strong> ${escapeHtml(transaction.note)}</div>`
      : "";

    const printWindow = window.open("", "_blank", "width=520,height=760");

    if (!printWindow) {
      alert("Trình duyệt đã chặn cửa sổ in.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Hoá đơn ${escapeHtml(transaction.idHoaDon)}</title>
          <meta charset="UTF-8" />
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 18px;
              background: #f3f4f6;
              color: #222;
              font-family: Arial, Helvetica, sans-serif;
            }

            .receipt {
              width: 380px;
              max-width: 100%;
              margin: 0 auto;
              padding: 20px 18px 18px;
              background: #ffffff;
              border: 1px dashed #9ca3af;
              box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
            }

            .shop-header {
              display: grid;
              grid-template-columns: 72px 1fr;
              gap: 12px;
              align-items: center;
              margin-bottom: 14px;
            }

            .logo-box {
              width: 72px;
              height: 62px;
              border: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              font-weight: 900;
              color: #8d6915;
              letter-spacing: 1px;
            }

            .shop-name {
              font-size: 22px;
              font-weight: 900;
              line-height: 1.15;
            }

            .shop-info {
              margin-top: 4px;
              font-size: 12px;
              line-height: 1.45;
              color: #555;
            }

            .invoice-title {
              margin: 14px 0 6px;
              text-align: center;
              font-size: 24px;
              font-weight: 900;
              letter-spacing: 0.3px;
            }

            .invoice-code {
              text-align: center;
              font-size: 17px;
              font-weight: 800;
              margin-bottom: 14px;
            }

            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 12px;
              margin-bottom: 10px;
              font-size: 12px;
              line-height: 1.35;
            }

            .meta-grid div:nth-child(even) {
              text-align: right;
            }

            .line {
              border-top: 1px dashed #bdbdbd;
              margin: 12px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th,
            td {
              border: 1px solid #999;
              padding: 6px 5px;
              vertical-align: top;
            }

            th {
              background: #f4f4f5;
              text-align: center;
              font-weight: 800;
            }

            td strong {
              display: block;
              font-size: 12px;
              font-weight: 700;
            }

            td small {
              display: block;
              margin-top: 2px;
              color: #777;
              font-size: 10px;
            }

            .center {
              text-align: center;
            }

            .money {
              text-align: right;
              white-space: nowrap;
            }

            .summary {
              margin-top: 14px;
              font-size: 13px;
            }

            .summary-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 16px;
              padding: 5px 0;
            }

            .summary-row span {
              color: #333;
            }

            .summary-row strong {
              font-weight: 800;
            }

            .summary-row.discount strong {
              color: #c2410c;
            }

            .summary-row.total {
              margin-top: 5px;
              padding-top: 9px;
              border-top: 1px dashed #bdbdbd;
              font-size: 15px;
              font-weight: 900;
            }

            .summary-row.total strong {
              font-size: 18px;
            }

            .note-box {
              margin-top: 10px;
              padding: 8px;
              border: 1px dashed #d6d3d1;
              background: #fffaf0;
              font-size: 11px;
              line-height: 1.4;
            }

            .thanks {
              margin-top: 16px;
              text-align: center;
              font-size: 12px;
              font-weight: 700;
              line-height: 1.5;
            }

            @media print {
              body {
                padding: 0;
                background: #ffffff;
              }

              .receipt {
                width: 80mm;
                box-shadow: none;
                border: 1px dashed #999;
              }
            }
          </style>
        </head>

        <body>
          <div class="receipt">
            <div class="shop-header">
              <div class="logo-box">S</div>
              <div>
                <div class="shop-name">${escapeHtml(transaction.spaName || "Serinity Spa")}</div>
                <div class="shop-info">
                  ${escapeHtml(transaction.spaAddress || "")}<br />
                  SĐT: ${escapeHtml(transaction.spaPhone || "")}
                </div>
              </div>
            </div>

            <div class="invoice-title">HOÁ ĐƠN THANH TOÁN</div>
            <div class="invoice-code">Số HĐ: ${escapeHtml(transaction.idHoaDon)}</div>

            <div class="meta-grid">
              <div><strong>Mã LH:</strong> ${escapeHtml(transaction.maLichHen)}</div>
              <div><strong>TN:</strong> Lễ tân</div>
              <div><strong>Khách:</strong> ${escapeHtml(transaction.customer)}</div>
              <div><strong>Ngày:</strong> ${escapeHtml(transaction.paymentTime)}</div>
              <div><strong>SĐT:</strong> ${escapeHtml(transaction.phone)}</div>
              <div><strong>PTTT:</strong> ${escapeHtml(transaction.paymentMethod)}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width:32px;">TT</th>
                  <th>Tên dịch vụ</th>
                  <th style="width:36px;">SL</th>
                  <th style="width:76px;">Đơn giá</th>
                  <th style="width:82px;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${serviceRows}
              </tbody>
            </table>

            <div class="line"></div>

            <div class="summary">
              <div class="summary-row">
                <span>Thành tiền:</span>
                <strong>${formatMoney(subtotal)}</strong>
              </div>
              ${discountRow}
              <div class="summary-row total">
                <span>Tổng thanh toán:</span>
                <strong>${formatMoney(finalTotal)}</strong>
              </div>
            </div>

            ${noteRow}

            <div class="line"></div>

            <div class="thanks">
              Cảm ơn quý khách đã sử dụng dịch vụ!<br />
              Hẹn gặp lại quý khách.
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderCalendarMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const leadingBlankCount = (firstDay.getDay() + 6) % 7;

    const blanks = Array.from({ length: leadingBlankCount });
    const days = Array.from({ length: totalDays }, (_, index) => index + 1);

    return (
      <div className="staff-transactions-calendar-month" key={`${year}-${month}`}>
        <h3>{formatMonthTitle(monthDate)}</h3>

        <div className="staff-transactions-calendar-weekdays">
          {weekdayLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="staff-transactions-calendar-days">
          {blanks.map((_, index) => (
            <span
              className="staff-transactions-calendar-empty"
              key={`empty-${index}`}
            />
          ))}

          {days.map((day) => {
            const date = new Date(year, month, day);
            const isToday = isSameDate(date, TODAY);
            const isSelected = isSameDate(date, selectedDate);

            return (
              <button
                type="button"
                key={day}
                className={[
                  "staff-transactions-calendar-day",
                  isToday ? "today" : "",
                  isSelected ? "selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleSelectCalendarDate(date)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="staff-transactions-page">
      <StaffPageHeader title="Lịch sử giao dịch" />

      <section className="staff-transactions-content">
        <div className="staff-transactions-card">
          <div className="staff-transactions-toolbar">
            <div className="staff-transactions-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Tìm theo mã HĐ, mã lịch hẹn, tên khách, SĐT..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="staff-transactions-method-select">
              <Filter size={18} />
              <select
                value={paymentMethodFilter}
                onChange={(event) => setPaymentMethodFilter(event.target.value)}
              >
                {paymentMethodOptions.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>


            <button
              type="button"
              className="staff-transactions-today-btn"
              onClick={handleGoToday}
            >
              Hôm nay
            </button>

            <div className="staff-transactions-date-wrapper">
              <div className="staff-transactions-date-navigator">
                <button
                  type="button"
                  className="staff-transactions-date-nav-btn"
                  onClick={handlePrevDate}
                >
                  <ChevronLeft size={17} />
                </button>

                <button
                  type="button"
                  className="staff-transactions-date-display"
                  onClick={handleToggleCalendar}
                >
                  {formatDisplayDate(selectedDate)}
                </button>

                <button
                  type="button"
                  className="staff-transactions-date-nav-btn"
                  onClick={handleNextDate}
                >
                  <ChevronRight size={17} />
                </button>
              </div>

              {isCalendarOpen && (
                <div className="staff-transactions-calendar-popover">
                  <div className="staff-transactions-calendar-nav">
                    <button type="button" onClick={handlePrevCalendarMonth}>
                      <ChevronLeft size={18} />
                    </button>

                    <button type="button" onClick={handleNextCalendarMonth}>
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="staff-transactions-calendar-months">
                    {renderCalendarMonth(calendarMonth)}
                    {renderCalendarMonth(addMonths(calendarMonth, 1))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="staff-transactions-export-btn"
              onClick={handleExportFile}
            >
              <Download size={18} />
              <span>Xuất file</span>
            </button>
          </div>

          <div className="staff-transactions-summary-grid">
            <div className="staff-transactions-summary-card">
              <div className="summary-icon total">
                <Receipt size={19} />
              </div>

              <div>
                <p>Tổng giao dịch</p>
                <strong>{summary.totalTransactions}</strong>
              </div>
            </div>

            <div className="staff-transactions-summary-card">
              <div className="summary-icon revenue">
                <CreditCard size={19} />
              </div>

              <div>
                <p>Tổng doanh thu</p>
                <strong>{formatMoney(summary.totalRevenue)}</strong>
              </div>
            </div>

            <div className="staff-transactions-summary-card">
              <div className="summary-icon cash">
                <Banknote size={19} />
              </div>

              <div>
                <p>Tiền mặt</p>
                <strong>{formatMoney(summary.cashTotal)}</strong>
              </div>
            </div>

            <div className="staff-transactions-summary-card">
              <div className="summary-icon transfer">
                <Landmark size={19} />
              </div>

              <div>
                <p>Chuyển khoản</p>
                <strong>{formatMoney(summary.transferTotal)}</strong>
              </div>
            </div>

            <div className="staff-transactions-summary-card">
              <div className="summary-icon card">
                <CreditCard size={19} />
              </div>

              <div>
                <p>Thẻ ngân hàng</p>
                <strong>{formatMoney(summary.cardTotal)}</strong>
              </div>
            </div>
          </div>

          <div className="staff-transactions-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Mã LH</th>
                  <th>Khách hàng</th>
                  <th>Thời gian</th>
                  <th>Phương thức</th>
                  <th>Giá trị HĐ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {isLoadingTransactions ? (
                  <tr>
                    <td colSpan="8" className="staff-transactions-empty">
                      Đang tải danh sách giao dịch...
                    </td>
                  </tr>
                ) : transactionError ? (
                  <tr>
                    <td colSpan="8" className="staff-transactions-empty">
                      {transactionError}
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="staff-transactions-empty">
                      Không tìm thấy giao dịch phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.idHoaDon}
                      className="staff-transactions-row"
                    >
                      <td className="staff-transactions-id">
                        {transaction.idHoaDon}
                      </td>

                      <td>{transaction.maLichHen}</td>

                      <td>
                        <strong>{transaction.customer}</strong>
                        <p>{transaction.phone}</p>
                      </td>

                      <td>{transaction.paymentTime}</td>

                      <td>{transaction.paymentMethod}</td>

                      <td className="staff-transactions-money">
                        {formatMoney(getTransactionTotal(transaction))}
                      </td>

                      <td>
                        <span
                          className={`staff-transactions-status ${getStatusClass(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>

                      <td>
                        <div className="staff-transactions-actions">
                          <button
                            type="button"
                            className="staff-transactions-icon-btn"
                            title="Xem chi tiết"
                            onClick={() => handleOpenDetail(transaction)}
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            className="staff-transactions-icon-btn"
                            title="In hóa đơn"
                            disabled={transaction.status !== "Đã thanh toán"}
                            onClick={() => handlePrintInvoice(transaction)}
                          >
                            <Printer size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedTransaction && (
        <div
          className="staff-transaction-modal-overlay"
          onClick={handleCloseDetail}
        >
          <div
            className="staff-transaction-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-transaction-modal-header">
              <h2>Chi tiết giao dịch {selectedTransaction.idHoaDon}</h2>

              <button
                type="button"
                className="staff-transaction-modal-close"
                onClick={handleCloseDetail}
              >
                <X size={22} />
              </button>
            </div>

            <div className="staff-transaction-modal-body">
              <div className="staff-transaction-summary-grid">
                <div className="staff-transaction-summary-card">
                  <div className="staff-transaction-summary-item">
                    <Receipt size={18} />

                    <div>
                      <span>Mã hóa đơn</span>
                      <strong>{selectedTransaction.idHoaDon}</strong>
                    </div>
                  </div>

                  <div className="staff-transaction-summary-item">
                    <FileText size={18} />

                    <div>
                      <span>Mã lịch hẹn</span>
                      <strong>{selectedTransaction.maLichHen}</strong>
                    </div>
                  </div>
                </div>

                <div className="staff-transaction-summary-card">
                  <div className="staff-transaction-summary-item">
                    <Phone size={18} />

                    <div>
                      <span>Khách hàng</span>
                      <strong>{selectedTransaction.customer}</strong>
                      <p>{selectedTransaction.phone}</p>
                    </div>
                  </div>

                  <div className="staff-transaction-summary-item">
                    <CalendarDays size={18} />

                    <div>
                      <span>Thời gian</span>
                      <strong>{selectedTransaction.paymentTime}</strong>
                    </div>
                  </div>
                </div>

                <div className="staff-transaction-summary-card">
                  <div className="staff-transaction-summary-item">
                    <CreditCard size={18} />

                    <div>
                      <span>Phương thức</span>
                      <strong>{selectedTransaction.paymentMethod}</strong>
                    </div>
                  </div>

                  <div className="staff-transaction-summary-item">
                    <span
                      className={`staff-transaction-paid-badge ${getStatusClass(
                        selectedTransaction.status
                      )}`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="staff-transaction-section">
                <h3>Dịch vụ đã đặt</h3>

                <div className="staff-transaction-service-table">
                  <div className="staff-transaction-service-head">
                    <span>Dịch vụ</span>
                    <span>SL</span>
                    <span>Đơn giá</span>
                    <span>Thành tiền</span>
                  </div>

                  {selectedTransaction.bookedServices.map((item) => (
                    <div
                      className="staff-transaction-service-row"
                      key={item.idDichVu}
                    >
                      <span>{item.tenDichVu}</span>
                      <span>{item.soLuong}</span>
                      <span>{formatMoney(item.donGia)}</span>
                      <strong>{formatMoney(getItemTotal(item))}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTransaction.extraServices.length > 0 && (
                <div className="staff-transaction-section">
                  <h3>Dịch vụ phát sinh</h3>

                  <div className="staff-transaction-service-table">
                    <div className="staff-transaction-service-head">
                      <span>Dịch vụ</span>
                      <span>SL</span>
                      <span>Đơn giá</span>
                      <span>Thành tiền</span>
                    </div>

                    {selectedTransaction.extraServices.map((item) => (
                      <div
                        className="staff-transaction-service-row"
                        key={item.idDichVu}
                      >
                        <span>{item.tenDichVu}</span>
                        <span>{item.soLuong}</span>
                        <span>{formatMoney(item.donGia)}</span>
                        <strong>{formatMoney(getItemTotal(item))}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="staff-transaction-total-box">
                <span>Tổng thanh toán</span>
                <strong>{formatMoney(getTransactionTotal(selectedTransaction))}</strong>
              </div>

              {getTransactionDiscount(selectedTransaction) > 0 && (
                <div className="staff-transaction-note-box">
                  <h4>Thông tin giảm giá</h4>
                  <p>
                    Tạm tính: <strong>{formatMoney(getTransactionSubtotal(selectedTransaction))}</strong>
                  </p>
                  <p>
                    Giảm giá: <strong>- {formatMoney(getTransactionDiscount(selectedTransaction))}</strong>
                  </p>
                  <p>
                    Thành tiền sau giảm: <strong>{formatMoney(getTransactionTotal(selectedTransaction))}</strong>
                  </p>
                </div>
              )}

              {selectedTransaction.note && (
                <div className="staff-transaction-note-box">
                  <h4>Ghi chú</h4>
                  <p>{selectedTransaction.note}</p>
                </div>
              )}
            </div>

            <div className="staff-transaction-modal-footer">
              <button
                type="button"
                className="staff-transaction-secondary-btn"
                onClick={handleCloseDetail}
              >
                Đóng
              </button>

              {isPaidTransaction(selectedTransaction) && (
                <button
                  type="button"
                  className="staff-transaction-primary-btn"
                  onClick={() => handlePrintInvoice(selectedTransaction)}
                >
                  <Printer size={17} />
                  <span>In hóa đơn</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default StaffTransactions;