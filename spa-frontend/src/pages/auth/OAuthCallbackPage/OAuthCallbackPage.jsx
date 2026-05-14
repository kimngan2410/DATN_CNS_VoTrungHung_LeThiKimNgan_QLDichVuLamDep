import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { saveAuthData } from "../../../services/authApi"

function OAuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const accessToken = params.get("access_token")
    const tokenType = params.get("token_type") || "bearer"
    const userRaw = params.get("user")

    if (!accessToken || !userRaw) {
      navigate("/dang-nhap", { replace: true })
      return
    }

    try {
      const user = JSON.parse(userRaw)

      saveAuthData({
        access_token: accessToken,
        token_type: tokenType,
        user,
      })

      if (user.vaiTro === "Admin") {
        navigate("/admin/tong-quan", { replace: true })
        return
      }

      if (user.vaiTro === "NhanVien") {
        navigate("/staff/tong-quan", { replace: true })
        return
      }

      navigate("/trang-chu", { replace: true })
    } catch {
      navigate("/dang-nhap", { replace: true })
    }
  }, [navigate])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      Đang đăng nhập...
    </div>
  )
}

export default OAuthCallbackPage