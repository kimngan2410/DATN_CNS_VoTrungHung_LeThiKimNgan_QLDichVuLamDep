const ACTIVE_APPOINTMENT_STATUSES = ["pending", "confirmed"]

export const getActiveAppointmentCount = (appointments = []) => {
  return appointments.filter((item) =>
    ACTIVE_APPOINTMENT_STATUSES.includes(item.status)
  ).length
}

export const getAppointmentCountStorageKey = (idTaiKhoan) => {
  return `customer_active_appointment_count_${idTaiKhoan || "guest"}`
}

export const getCachedAppointmentCount = (idTaiKhoan) => {
  const key = getAppointmentCountStorageKey(idTaiKhoan)
  const value = sessionStorage.getItem(key)

  if (value === null || value === undefined) return 0

  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

export const saveCachedAppointmentCount = (idTaiKhoan, count) => {
  const key = getAppointmentCountStorageKey(idTaiKhoan)
  sessionStorage.setItem(key, String(count))
}