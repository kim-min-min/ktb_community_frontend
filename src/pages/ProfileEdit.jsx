// src/pages/ProfileEditPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileEditPage() {
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access_token") || "";

  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");

  const [existingImagePath, setExistingImagePath] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // -----------------------------------------------------------------------------------
  // 초기 유저 데이터 로드 (PostEditPage와 동일한 방식)
  // -----------------------------------------------------------------------------------
  useEffect(() => {
    if (!currentUser || !token) {
      alert("로그인 후 이용 가능합니다.");
      navigate("/login");
      return;
    }

    setEmail(currentUser.email);
    setNickname(currentUser.nickname);
    setExistingImagePath(currentUser.profile_image_path || null);

    setLoading(false);
  }, []);

  // 이미지 변경 처리
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setNewImageFile(null);
      setPreviewUrl(null);
      return;
    }
    setNewImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // ObjectURL 메모리 해제
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // -----------------------------------------------------------------------------------
  // 수정 요청
  // -----------------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("nickname", nickname.trim());

      if (newImageFile) {
        formData.append("profile_image", newImageFile);
      }

      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        alert(data?.detail || data?.message || "회원정보 수정 실패");
        return; 
      }

      // localStorage 업데이트
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("회원정보가 수정되었습니다.");
      navigate("/posts");
    } catch (err) {
      console.error(err);
      alert(err.message || "회원정보 수정 중 오류 발생");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------------------------------------
  // 회원탈퇴
  // -----------------------------------------------------------------------------------
  const handleDelete = async () => {
    if (!confirm("정말 탈퇴하시겠습니까?\n작성한 게시글과 댓글이 모두 삭제됩니다.")) return;

    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "회원 탈퇴 실패");
      }

      localStorage.clear();
      alert("탈퇴가 완료되었습니다.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // -----------------------------------------------------------------------------------
  // 로딩 화면
  // -----------------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-panel">
          <p className="posts-state-text">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------------------
  // 화면 UI (PostEditPage 스타일 그대로 유지)
  // -----------------------------------------------------------------------------------
  return (
    <div className="post-detail-page">
      <div className="post-detail-panel">
        {/* 상단 */}
        <div className="post-detail-topbar">
          <button
            type="button"
            className="detail-back-btn"
            onClick={() => navigate("/posts")}
          >
            ← 뒤로가기
          </button>
        </div>

        <header className="post-detail-header">
          <div className="post-detail-title-row">
            <h1 className="post-detail-title">회원정보수정</h1>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
        {/* 프로필 이미지 영역 */}
        <div className="field profile-image-box">
          <label className="profile-image-wrapper">
            <img
              src={
                previewUrl
                  ? previewUrl
                  : existingImagePath
                  ? `${BASE_URL}/${existingImagePath}`
                  : "/default_profile.png"
              }
              alt="profile"
              className="profile-edit-image"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
            <span className="profile-image-overlay">변경</span>
          </label>
        </div>


          {/* 이메일 (읽기전용) */}
          <div className="field">
            <label className="field-label">이메일</label>
            <input type="text" className="field-input" value={email} disabled />
          </div>

          {/* 닉네임 입력 */}
          <div className="field">
            <label className="field-label">닉네임</label>
            <input
              type="text"
              className="field-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
            />
          </div>

          {/* 수정 버튼 */}
          <div className="post-edit-actions">
            <button
              type="button"
              className="detail-small-btn"
              onClick={() => navigate("/posts")}
            >
              취소
            </button>
            <button type="submit" className="comment-submit-btn" disabled={saving}>
              {saving ? "수정 중..." : "수정하기"}
            </button>
          </div>
        </form>

        {/* 회원 탈퇴 */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            className="detail-small-btn"
            style={{ background: "#444", color: "#fff" }}
            onClick={handleDelete}
          >
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
