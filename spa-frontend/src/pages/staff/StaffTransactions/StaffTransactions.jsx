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

const getItemTotal = (item) => item.soLuong * item.donGia;

const getTransactionTotal = (transaction) => {
  const bookedTotal = transaction.bookedServices.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );

  const extraTotal = transaction.extraServices.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );

  return bookedTotal + extraTotal;
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

    const escapeHtml = (value) => {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
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

    const bookedRows = transaction.bookedServices
      .map(
        (item) => `
          <tr>
            <td>${item.tenDichVu}</td>
            <td style="text-align:center;">${item.soLuong}</td>
            <td style="text-align:right;">${formatMoney(item.donGia)}</td>
            <td style="text-align:right;">${formatMoney(getItemTotal(item))}</td>
          </tr>
        `
      )
      .join("");

    const extraRows = transaction.extraServices
      .map(
        (item) => `
          <tr>
            <td>${item.tenDichVu}</td>
            <td style="text-align:center;">${item.soLuong}</td>
            <td style="text-align:right;">${formatMoney(item.donGia)}</td>
            <td style="text-align:right;">${formatMoney(getItemTotal(item))}</td>
          </tr>
        `
      )
      .join("");

    const total = getTransactionTotal(transaction);
    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      alert("Trình duyệt đã chặn cửa sổ in.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${transaction.idHoaDon}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #333;
            }

            .invoice-wrap {
              max-width: 800px;
              margin: 0 auto;
            }

            h1, h2, h3, p {
              margin: 0;
            }

            .invoice-top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 24px;
            }

            .invoice-top-left h2 {
              font-size: 28px;
              margin-bottom: 8px;
            }

            .invoice-top-left p {
              font-size: 14px;
              color: #555;
              line-height: 1.6;
            }

            .invoice-title {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 18px;
            }

            .section {
              margin-bottom: 22px;
            }

            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px 24px;
              font-size: 14px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 10px;
              font-size: 14px;
            }

            th {
              background: #f5f5f5;
            }

            .total-box {
              margin-top: 20px;
              text-align: right;
              font-size: 18px;
              font-weight: 700;
            }

            .group-title {
              margin-top: 14px;
              margin-bottom: 8px;
              font-size: 15px;
              font-weight: 700;
            }
          </style>
        </head>

        <body>
          <div class="invoice-wrap">
            <div class="invoice-top">
              <div class="invoice-top-left">
                <h2>${transaction.spaName}</h2>
                <p>${transaction.spaAddress}</p>
                <p>SĐT: ${transaction.spaPhone}</p>
              </div>

              <div>
                <div class="invoice-title">HÓA ĐƠN THANH TOÁN</div>
              </div>
            </div>

            <div class="section">
              <div class="info-grid">
                <div><strong>Mã hóa đơn:</strong> ${transaction.idHoaDon}</div>
                <div><strong>Mã lịch hẹn:</strong> ${transaction.maLichHen}</div>
                <div><strong>Khách hàng:</strong> ${transaction.customer}</div>
                <div><strong>SĐT:</strong> ${transaction.phone}</div>
                <div><strong>Ngày thanh toán:</strong> ${transaction.paymentTime}</div>
                <div><strong>Phương thức:</strong> ${transaction.paymentMethod}</div>
                <div><strong>Trạng thái:</strong> ${transaction.status}</div>
              </div>
            </div>

            <div class="section">
              <div class="group-title">Dịch vụ đã đặt</div>

              <table>
                <thead>
                  <tr>
                    <th>Dịch vụ</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${bookedRows}
                </tbody>
              </table>

              ${
                transaction.extraServices.length > 0
                  ? `
                    <div class="group-title">Dịch vụ phát sinh</div>
                    <table>
                      <thead>
                        <tr>
                          <th>Dịch vụ</th>
                          <th>Số lượng</th>
                          <th>Đơn giá</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${extraRows}
                      </tbody>
                    </table>
                  `
                  : ""
              }

              <div class="total-box">
                Tổng thanh toán: ${formatMoney(total)}
              </div>
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
                <strong>
                  {formatMoney(getTransactionTotal(selectedTransaction))}
                </strong>
              </div>

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