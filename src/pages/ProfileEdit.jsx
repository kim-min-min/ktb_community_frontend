// src/pages/ProfileEditPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const BASE_URL = "/api";

export default function ProfileEditPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");

  const [existingImagePath, setExistingImagePath] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // -----------------------------
  // 유저 정보 불러오기 (초기 1회)
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("access_token") || "";
    const rawUser = localStorage.getItem("user");
    const currentUser = rawUser ? JSON.parse(rawUser) : null;

    if (!currentUser || !token) {
      navigate("/login");
      return;
    }

    setEmail(currentUser.email || "");
    setNickname(currentUser.nickname || "");
    setExistingImagePath(currentUser.profile_image_path || null);

    setLoading(false);
  }, [navigate]);

  // -----------------------------
  // 이미지 변경
  // -----------------------------
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setNewImageFile(null);
      setPreviewUrl(null);
      return;
    }

    setNewImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 미리보기 URL 정리(누수 방지)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // -----------------------------
  // 회원정보 수정 요청
  // -----------------------------
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
      if (newImageFile) formData.append("profile_image", newImageFile);

      const res = await apiFetch(
        `${BASE_URL}/auth/profile`,
        { method: "PUT", body: formData },
        navigate
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.detail || "회원정보 수정 실패");
      }

      // localStorage 갱신 (앱 전체에서 최신 유저정보 쓰게)
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

  // -----------------------------
  // 회원 탈퇴
  // -----------------------------
  const handleDelete = async () => {
    if (
      !confirm(
        "정말 탈퇴하시겠습니까?\n작성한 게시글과 댓글이 모두 삭제됩니다."
      )
    )
      return;

    try {
      const res = await apiFetch(
        `${BASE_URL}/auth/profile`,
        { method: "DELETE" },
        navigate
      );

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

  // -----------------------------
  // 로딩 화면
  // -----------------------------
  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-panel">
          <p className="posts-state-text">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // 렌더링
  // -----------------------------
  return (
    <div className="post-detail-page">
      <div className="post-detail-panel">
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
          {/* 프로필 이미지 */}
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
                hidden
                onChange={handleFileChange}
              />
              <span className="profile-image-overlay">변경</span>
            </label>
          </div>

          {/* 이메일 (읽기전용) */}
          <div className="field">
            <label className="field-label">이메일</label>
            <input
              type="text"
              className="field-input"
              value={email}
              disabled
            />
          </div>

          {/* 닉네임 */}
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

          <div className="post-edit-actions">
            <button
              type="button"
              className="detail-small-btn"
              onClick={() => navigate("/posts")}
              disabled={saving}
            >
              취소
            </button>

            <button
              type="submit"
              className="comment-submit-btn"
              disabled={saving}
            >
              {saving ? "수정 중..." : "수정하기"}
            </button>
          </div>
        </form>

        {/* 회원 탈퇴 */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            type="button"
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
