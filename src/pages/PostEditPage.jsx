// src/pages/PostEditPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const BASE_URL = "/api";

export default function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token") || "";
  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [existingImagePath, setExistingImagePath] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 기존 글 불러오기
  useEffect(() => {
    const loadPost = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await apiFetch(`${BASE_URL}/posts/${id}`, {}, navigate);
        const data = await res.json();

        if (!res.ok || data?.success === false) {
          throw new Error(data?.detail || "게시글을 불러오지 못했습니다.");
        }

        const postData = data.post || data;

        // 본인 글인지 체크
        if (currentUser && postData.user_id !== currentUser.id) {
          alert("본인이 작성한 글만 수정할 수 있습니다.");
          navigate(`/posts/${id}`);
          return;
        }

        setTitle(postData.title || "");
        setContent(postData.content || "");
        setExistingImagePath(postData.image_path || null);
      } catch (err) {
        alert(err.message);
        navigate("/posts");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, navigate]);

  // 이미지 선택
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

  // 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (newImageFile) formData.append("image_file", newImageFile);

      const res = await apiFetch(
        `${BASE_URL}/posts/${id}`,
        { method: "PUT", body: formData },
        navigate
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.detail || "게시글 수정에 실패했습니다.");
      }

      alert("게시글이 수정되었습니다.");
      navigate(`/posts/${id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-panel">
          <p className="posts-state-text">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-panel">
        <div className="post-detail-topbar">
          <button
            type="button"
            className="detail-back-btn"
            onClick={() => navigate(`/posts/${id}`)}
          >
            ← 게시글로
          </button>
        </div>

        <header className="post-detail-header">
          <h1 className="post-detail-title">게시글 수정</h1>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">제목 *</label>
            <input
              type="text"
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="field">
            <label className="field-label">내용 *</label>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
            />
          </div>

          <div className="field">
            <label className="field-label">이미지</label>

            {existingImagePath && !previewUrl && (
              <div className="post-detail-image-wrap">
                <img
                  src={`${BASE_URL}/${existingImagePath}`}
                  alt="현재 이미지"
                  className="post-detail-image"
                />
              </div>
            )}

            {previewUrl && (
              <div className="post-detail-image-wrap">
                <img
                  src={previewUrl}
                  alt="새 이미지"
                  className="post-detail-image"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginTop: 6 }}
            />
          </div>

          <div className="post-edit-actions">
            <button
              type="button"
              className="detail-small-btn"
              onClick={() => navigate(`/posts/${id}`)}
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
      </div>
    </div>
  );
}
