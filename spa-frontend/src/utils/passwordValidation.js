export const PASSWORD_HINT =
  "Mật khẩu phải có tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt."

export function getStrongPasswordError(password) {
  const value = password || ""

  if (!value.trim()) {
    return "Vui lòng nhập mật khẩu."
  }

  if (value.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự."
  }

  if (/\s/.test(value)) {
    return "Mật khẩu không được chứa khoảng trắng."
  }

  if (!/[A-Z]/.test(value)) {
    return "Mật khẩu phải có ít nhất 1 chữ hoa."
  }

  if (!/[a-z]/.test(value)) {
    return "Mật khẩu phải có ít nhất 1 chữ thường."
  }

  if (!/[0-9]/.test(value)) {
    return "Mật khẩu phải có ít nhất 1 chữ số."
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
    return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt."
  }

  return ""
}