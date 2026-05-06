import React, { useMemo, useState } from "react";
import {
  Search,
  Bell,
  UserRound,
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


const TODAY = new Date("2026-05-04T00:00:00");

const transactionList = [
  {
    idHoaDon: "HD001",
    maLichHen: "LH001",
    customer: "Nguyễn Thị Mai",
    phone: "0901234567",
    paymentTime: "2026-05-04 10:15",
    paymentMethod: "Chuyển khoản",
    status: "Đã thanh toán",
    spaName: "Serinity Spa",
    spaAddress: "123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    spaPhone: "0909 999 888",
    bookedServices: [
      {
        idDichVu: "DV001",
        tenDichVu: "Massage body",
        soLuong: 1,
        donGia: 500000,
      },
      {
        idDichVu: "DV002",
        tenDichVu: "Gội đầu dưỡng sinh",
        soLuong: 1,
        donGia: 250000,
      },
    ],
    extraServices: [],
    note: "Khách thanh toán bằng chuyển khoản.",
  },
  {
    idHoaDon: "HD002",
    maLichHen: "LH002",
    customer: "Lê Thị Hoa",
    phone: "0923456789",
    paymentTime: "2026-05-03 15:30",
    paymentMethod: "Tiền mặt",
    status: "Đã thanh toán",
    spaName: "Serinity Spa",
    spaAddress: "123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    spaPhone: "0909 999 888",
    bookedServices: [
      {
        idDichVu: "DV003",
        tenDichVu: "Chăm sóc da mặt",
        soLuong: 1,
        donGia: 400000,
      },
      {
        idDichVu: "DV004",
        tenDichVu: "Massage cổ vai gáy",
        soLuong: 1,
        donGia: 200000,
      },
    ],
    extraServices: [
      {
        idDichVu: "DV009",
        tenDichVu: "Xông hơi thư giãn",
        soLuong: 1,
        donGia: 180000,
      },
      {
        idDichVu: "DV010",
        tenDichVu: "Đắp mặt nạ collagen",
        soLuong: 1,
        donGia: 100000,
      },
    ],
    note: "Có thêm dịch vụ phát sinh trong lúc thực hiện.",
  },
  {
    idHoaDon: "HD003",
    maLichHen: "LH010",
    customer: "Trần Văn Hùng",
    phone: "0912345678",
    paymentTime: "2026-05-02 11:10",
    paymentMethod: "Thẻ ngân hàng",
    status: "Đã thanh toán",
    spaName: "Serinity Spa",
    spaAddress: "123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    spaPhone: "0909 999 888",
    bookedServices: [
      {
        idDichVu: "DV001",
        tenDichVu: "Massage body",
        soLuong: 1,
        donGia: 500000,
      },
    ],
    extraServices: [],
    note: "",
  },
  {
    idHoaDon: "HD004",
    maLichHen: "LH005",
    customer: "Hoàng Thu Trang",
    phone: "0945678901",
    paymentTime: "2026-05-04 17:55",
    paymentMethod: "Tiền mặt",
    status: "Đã thanh toán",
    spaName: "Serinity Spa",
    spaAddress: "123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    spaPhone: "0909 999 888",
    bookedServices: [
      {
        idDichVu: "DV005",
        tenDichVu: "Nail art",
        soLuong: 1,
        donGia: 300000,
      },
      {
        idDichVu: "DV006",
        tenDichVu: "Sơn gel",
        soLuong: 1,
        donGia: 180000,
      },
    ],
    extraServices: [],
    note: "Khách thanh toán tiền mặt tại quầy.",
  },
  {
    idHoaDon: "HD005",
    maLichHen: "LH004",
    customer: "Phạm Minh Tuấn",
    phone: "0934567890",
    paymentTime: "2026-05-04 16:40",
    paymentMethod: "Thẻ ngân hàng",
    status: "Đã thanh toán",
    spaName: "Serinity Spa",
    spaAddress: "123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    spaPhone: "0909 999 888",
    bookedServices: [
      {
        idDichVu: "DV001",
        tenDichVu: "Massage body",
        soLuong: 1,
        donGia: 500000,
      },
    ],
    extraServices: [],
    note: "Khách thanh toán bằng thẻ ngân hàng.",
  },
];

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

const weekdayLabels = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "CN",
];

const formatMoney = (value) => {
  return `${value.toLocaleString("vi-VN")} đ`;
};

const getItemTotal = (item) => {
  return item.soLuong * item.donGia;
};

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
  const weekdays = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  return `${weekdays[date.getDay()]} ${date.getDate()} thg ${
    date.getMonth() + 1
  }`;
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

const getTransactionDate = (transaction) => {
  return transaction.paymentTime.split(" ")[0];
};

function StaffTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("Tất cả");
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
  );

  const selectedDateValue = formatDateToValue(selectedDate);

  const filteredTransactions = useMemo(() => {
    return transactionList.filter((transaction) => {
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
  }, [searchTerm, paymentMethodFilter, selectedDateValue]);

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

  const handleOpenDetail = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDetail = () => {
    setSelectedTransaction(null);
  };

  const handleExportFile = () => {
    if (filteredTransactions.length === 0) {
      alert("Không có dữ liệu để xuất file.");
      return;
    }

    const headers = [
      "Mã hóa đơn",
      "Mã lịch hẹn",
      "Khách hàng",
      "Số điện thoại",
      "Ngày thanh toán",
      "Phương thức thanh toán",
      "Tổng tiền",
      "Trạng thái",
    ];

    const rows = filteredTransactions.map((item) => [
      item.idHoaDon,
      item.maLichHen,
      item.customer,
      item.phone,
      item.paymentTime,
      item.paymentMethod,
      getTransactionTotal(item),
      item.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((value) => `"${value}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "danh-sach-giao-dich-da-thanh-toan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintInvoice = (transaction) => {
    if (!transaction || transaction.status !== "Đã thanh toán") {
      alert("Không thể in hóa đơn.");
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

    const calendarCells = [
      ...Array.from({ length: leadingBlankCount }, () => null),
      ...Array.from({ length: totalDays }, (_, index) => {
        return new Date(year, month, index + 1);
      }),
    ];

    return (
      <div className="staff-transactions-calendar-month">
        <h3>{formatMonthTitle(monthDate)}</h3>

        <div className="staff-transactions-calendar-weekdays">
          {weekdayLabels.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="staff-transactions-calendar-days">
          {calendarCells.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="staff-transactions-calendar-empty"
                ></div>
              );
            }

            const isSelected = isSameDate(date, selectedDate);
            const isToday = isSameDate(date, TODAY);

            return (
              <button
                type="button"
                key={formatDateToValue(date)}
                className={[
                  "staff-transactions-calendar-day",
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

  return (
    <div className="staff-transactions-page">
      <StaffPageHeader title="Giao dịch & Hoá đơn" />

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
                <p>Tổng tiền</p>
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
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.length === 0 ? (
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
                        <span className="staff-transactions-status paid">
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
                      <span>Ngày thanh toán</span>
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
                    <span className="staff-transaction-paid-badge">
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

              <button
                type="button"
                className="staff-transaction-primary-btn"
                onClick={() => handlePrintInvoice(selectedTransaction)}
              >
                <Printer size={17} />
                <span>In hóa đơn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffTransactions;