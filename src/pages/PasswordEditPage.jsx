// src/pages/PasswordEditPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PasswordEditPage() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access_token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [errors, setErrors] = useState({
    password: "",
    passwordConfirm: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 프론트 검증
    setErrors({ password: "", passwordConfirm: "" });

    if (!password.trim()) {
      setErrors((prev) => ({
        ...prev,
        password: "* 비밀번호를 입력해주세요.",
      }));
      return;
    }

    // 백엔드가 8~20자로 검사하니까 맞춰줌
    if (password.length < 8 || password.length > 20) {
      setErrors((prev) => ({
        ...prev,
        password: "* 비밀번호는 8~20자여야 합니다.",
      }));
      return;
    }

    if (password !== passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: "* 비밀번호와 비밀번호 확인이 일치하지 않습니다.",
      }));
      return;
    }

    // === API 요청 (FormData + new_password / new_password_confirm) ===
    const formData = new FormData();
    formData.append("new_password", password);
    formData.append("new_password_confirm", passwordConfirm);

    try {
      const res = await fetch(`${BASE_URL}/auth/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // Content-Type 넣지 말기
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // detail / message 우선으로 에러 표시
        let msg = "비밀번호 변경 실패";

        if (data?.detail) {
          if (typeof data.detail === "string") {
            msg = data.detail;
          } else if (Array.isArray(data.detail)) {
            msg = data.detail
              .map((item) => item.msg || item.message || JSON.stringify(item))
              .join("\n");
          } else if (typeof data.detail === "object") {
            msg =
              data.detail.msg ||
              data.detail.message ||
              JSON.stringify(data.detail);
          }
        } else if (data?.message) {
          msg = data.message;
        }

        alert(msg);
        return;
      }

      alert(data?.message || "비밀번호가 성공적으로 변경되었습니다.");
      navigate("/posts"); // 원하면 "/profile" 로 바꿔도 됨
    } catch (err) {
      console.error(err);
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="post-detail-page">
      <div className="post-detail-panel">
        {/* 뒤로가기 버튼 */}
        <div className="post-detail-topbar">
          <button
            type="button"
            className="detail-back-btn"
            onClick={() => navigate("/posts")}
          >
            ← 뒤로가기
          </button>
        </div>

        {/* 제목 */}
        <header className="post-detail-header">
          <div className="post-detail-title-row">
            <h1 className="post-detail-title">비밀번호 수정</h1>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">비밀번호</label>
            <input
              type="password"
              className="field-input"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="field-helper-text">{errors.password}</p>
            )}
          </div>

          <div className="field">
            <label className="field-label">비밀번호 확인</label>
            <input
              type="password"
              className="field-input"
              placeholder="비밀번호를 한 번 더 입력하세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            {errors.passwordConfirm && (
              <p className="field-helper-text">{errors.passwordConfirm}</p>
            )}
          </div>

          <div className="post-edit-actions">
            <button type="submit" className="comment-submit-btn">
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
