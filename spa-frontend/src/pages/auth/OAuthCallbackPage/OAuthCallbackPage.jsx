import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { saveAuthData } from "../../../services/authApi"

function OAuthCallbackPage() {
  const navigate = useNavigate()

  const [message, setMessage] = useState("Đang xử lý đăng nhập...")

  useEffect(() => {
    let timer = null

    const redirectByRole = (user) => {
      timer = setTimeout(() => {
        if (user?.vaiTro === "Admin") {
          navigate("/admin/tong-quan", { replace: true })
          return
        }

        if (user?.vaiTro === "NhanVien") {
          navigate("/staff/tong-quan", { replace: true })
          return
        }

        navigate("/trang-chu", { replace: true })
      }, 1600)
    }

    const params = new URLSearchParams(window.location.search)

    const accessToken = params.get("access_token")
    const tokenType = params.get("token_type") || "bearer"
    const userRaw = params.get("user")

    if (!accessToken || !userRaw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage("Đăng nhập thất bại. Đang quay lại trang đăng nhập...")

      timer = setTimeout(() => {
        navigate("/dang-nhap", { replace: true })
      }, 1600)

      return () => {
        if (timer) clearTimeout(timer)
      }
    }

    try {
      const user = JSON.parse(userRaw)

      saveAuthData({
        access_token: accessToken,
        token_type: tokenType,
        user,
      })

      setMessage("Đăng nhập thành công. Đang chuyển trang...")

      redirectByRole(user)
    } catch {
      setMessage("Có lỗi khi xử lý đăng nhập. Đang quay lại...")

      timer = setTimeout(() => {
        navigate("/dang-nhap", { replace: true })
      }, 1600)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [navigate])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#faf8f4",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          width: 330,
          padding: "34px 28px",
          borderRadius: 24,
          background: "#ffffff",
          border: "1px solid #ece7e1",
          boxShadow: "0 24px 70px rgba(44, 39, 35, 0.18)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            margin: "0 auto 18px",
            borderRadius: "50%",
            border: "4px solid #f1e5c7",
            borderTopColor: "#d7a93f",
            animation: "oauth-callback-spin 0.8s linear infinite",
          }}
        ></div>

        <h3
          style={{
            margin: 0,
            color: "#2f2a27",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Serenity Spa
        </h3>

        <p
          style={{
            margin: "8px 0 0",
            color: "#8a7f72",
            fontSize: 15,
          }}
        >
          {message}
        </p>

        <style>
          {`
            @keyframes oauth-callback-spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    </div>
  )
}

export default OAuthCallbackPage