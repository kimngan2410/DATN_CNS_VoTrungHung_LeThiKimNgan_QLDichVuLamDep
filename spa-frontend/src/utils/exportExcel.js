export const formatExcelMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export const exportStyledExcel = ({
  title,
  subtitle = "",
  columns = [],
  rows = [],
  summaryRows = [],
  fileName = "bao-cao",
}) => {
  const totalColumns = Math.max(columns.length, 1)

  const bodyRows = rows
    .map((row, rowIndex) => {
      return `
        <tr>
          ${columns
            .map((column) => {
              const value =
                typeof column.value === "function"
                  ? column.value(row, rowIndex)
                  : row?.[column.value]

              const className = [
                column.align === "center" ? "center" : "",
                column.align === "right" ? "right" : "",
                column.type === "money" ? "money" : "",
                column.type === "text" ? "text" : "",
                column.type === "status" ? "status" : "",
              ]
                .filter(Boolean)
                .join(" ")

              return `<td class="${className}">${escapeHtml(value)}</td>`
            })
            .join("")}
        </tr>
      `
    })
    .join("")

  const summaryHtml =
    summaryRows.length > 0
      ? `
        <tr>
          <td colspan="${totalColumns}"></td>
        </tr>

        ${summaryRows
          .map((item) => {
            return `
              <tr class="summary-row">
                <td colspan="${Math.max(totalColumns - 2, 1)}">${escapeHtml(
                  item.label
                )}</td>
                <td colspan="2" class="${
                  item.type === "money" ? "money" : "right"
                }">${escapeHtml(item.value)}</td>
              </tr>
            `
          })
          .join("")}
      `
      : ""

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
            background: #ffffff;
          }

          .report-subtitle {
            font-size: 13px;
            color: #6b7280;
            text-align: center;
            background: #ffffff;
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

          .right,
          .money {
            text-align: right;
          }

          .money {
            font-weight: 700;
            color: #8d6915;
          }

          .text {
            mso-number-format: "\\@";
          }

          .status {
            text-align: center;
            font-weight: 700;
          }

          .summary-row td {
            background: #fff7e6;
            font-weight: 700;
          }
        </style>
      </head>

      <body>
        <table>
          <tr>
            <td colspan="${totalColumns}" class="report-title">
              ${escapeHtml(title)}
            </td>
          </tr>

          <tr>
            <td colspan="${totalColumns}" class="report-subtitle">
              ${escapeHtml(subtitle)}
            </td>
          </tr>

          <tr>
            <td colspan="${totalColumns}"></td>
          </tr>

          <tr>
            ${columns
              .map((column) => `<th>${escapeHtml(column.label)}</th>`)
              .join("")}
          </tr>

          ${bodyRows}

          ${summaryHtml}
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
  link.download = `${fileName}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}