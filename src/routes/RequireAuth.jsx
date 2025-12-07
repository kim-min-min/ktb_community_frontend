// src/routes/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const rawUser = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");
  const location = useLocation();

  const isLoggedIn = !!rawUser && !!token;

  // 로그인 안 돼 있으면 경고창 없이 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}   // 나중에 로그인 후 원래 페이지로 돌아가고 싶으면 사용
      />
    );
  }

  // ✅ 로그인 되어 있으면 원래 페이지 렌더링
  return children;
}
