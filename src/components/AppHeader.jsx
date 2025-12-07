import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const [open, setOpen] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const profileSrc = currentUser?.profile_image_path
    ? `${BASE_URL}/${currentUser.profile_image_path}`
    : "/default_profile.png";

  // 🔥 로그인 직후 / 페이지 이동 후 드롭다운 자동 닫기 (핵심 1줄)
  useEffect(() => setOpen(false), [location.pathname, currentUser?.id]);

  return (
    <header className="app-header">
      <div
        className="app-title"
        onClick={() => navigate("/posts")}
        style={{ cursor: "pointer" }}
      >
        🌙 심야톡방
      </div>

      {currentUser && (
        <div className="app-profile-area">
          <div className="profile-avatar" onClick={() => setOpen(!open)}>
            <img src={profileSrc} alt="profile" />
          </div>

          {open && (
            <div className="profile-dropdown">
              <button onClick={() => navigate("/profile")}>회원정보수정</button>
              <button onClick={() => navigate("/password")}>비밀번호수정</button>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
