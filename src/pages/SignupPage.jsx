import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwCheck, setPwCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileFile(file);
    const url = URL.createObjectURL(file);
    setProfilePreview(url);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (pw !== pwCheck) {
      alert("비밀번호가 서로 다릅니다.");
      setLoading(false);
      return;
    }

    if (!profileFile) {
      alert("프로필 이미지를 선택해 주세요.");
      setLoading(false);
      return;
    }

    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const formData = new FormData();
    formData.append("email", email);
    formData.append("password", pw);
    formData.append("password_confirm", pwCheck);  
    formData.append("nickname", nickname);
    formData.append("profile_image", profileFile);  // 필드 이름도 docs 그대로

      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        const msg = data?.message || data?.detail || "회원가입에 실패했습니다.";
        throw new Error(msg);
      }

      alert("회원가입 성공! 이제 로그인해 주세요.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <main className="page-container">
        <div className="login-wrapper">
          <form className="login-card" onSubmit={handleSignup}>
            <h2 className="login-title">회원가입</h2>

            {/* 프로필 이미지 선택 영역 */}
            <div className="profile-wrapper">
              <label
                className="profile-circle"
                style={
                  profilePreview
                    ? {
                        backgroundImage: `url(${profilePreview})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}
                }
              >
                {!profilePreview && <span>사진 추가</span>}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleProfileChange}
                />
              </label>
              <div className="profile-subtext">
                프로필 사진을 선택해 주세요.
              </div>
            </div>

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

            <div className="field">
              <label className="field-label">비밀번호 확인</label>
              <input
                className="field-input"
                type="password"
                placeholder="비밀번호를 한 번 더 입력하세요"
                value={pwCheck}
                onChange={(e) => setPwCheck(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field-label">닉네임</label>
              <input
                className="field-input"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="button-primary"
              disabled={loading}
            >
              {loading ? "회원가입 중..." : "회원가입"}
            </button>
          </form>

          <div className="bottom-link">
            이미 계정이 있으신가요?
            <button
              type="button"
              className="button-text"
              onClick={() => navigate("/login")}
            >
              로그인하러 가기
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
