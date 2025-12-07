import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: pw,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || data?.success === false) {
      const msg = data?.message || data?.detail || "로그인에 실패했습니다.";
      throw new Error(msg);
    }

    // 토큰 저장
    localStorage.setItem("access_token", data.access_token);

    // 유저 정보도 저장
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("로그인 성공!");
    navigate("/posts");

  } catch (err) {
    console.error(err);
    alert(err.message || "로그인 중 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};


  return (
    <>

      {/* 가운데 로그인 카드 */}
      <main className="page-container">
        <form className="login-card" onSubmit={handleLogin}>
          <h2 className="login-title">로그인</h2>

          {/* 이메일 */}
          <div className="field">
            <label className="field-label">이메일</label>
            <input
              className="field-input"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* 비밀번호 */}
          <div className="field">
            <label className="field-label">비밀번호</label>
            <input
              className="field-input"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </main>

      {/* 하단 회원가입 링크 */}
      <div className="bottom-link">
        아직 회원이 아니신가요?
        <button
          type="button"
          className="button-text"
          onClick={() => navigate("/signup")}
        >
          회원가입
        </button>
      </div>
    </>
  );
}
