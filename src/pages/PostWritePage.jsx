// src/pages/PostWritePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const BASE_URL = "/api";

export default function PostWritePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (title.trim().length > 26) {
      alert("제목은 최대 26자까지 작성 가능합니다.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (imageFile) {
        formData.append("image_file", imageFile);
      }

      const res = await apiFetch(
        `${BASE_URL}/posts`,
        {
          method: "POST",
          body: formData, // Content-Type 자동 설정됨
        },
        navigate
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || data?.detail || "게시글 등록에 실패했습니다.");
      }

      alert("게시글이 등록되었습니다.");

      if (data.post?.id) {
        navigate(`/posts/${data.post.id}`);
      } else {
        navigate("/posts");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "게시글 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="posts-page">
      <main className="posts-main">
        <section className="posts-panel">
          <div className="posts-toolbar">
            <button
              type="button"
              className="posts-write-btn"
              onClick={() => navigate(-1)}
            >
              ← 목록으로
            </button>
          </div>

          <h2 style={{ marginBottom: 16 }}>게시글 작성</h2>

          <form className="post-form" onSubmit={handleSubmit}>
            {/* 제목 */}
            <div className="field">
              <label className="field-label">제목</label>
              <input
                className="field-input"
                type="text"
                maxLength={50}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
              />
            </div>

            {/* 내용 */}
            <div className="field">
              <label className="field-label">내용</label>
              <textarea
                className="field-input"
                style={{ minHeight: 180, resize: "vertical" }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="이야기를 남겨보세요"
              />
            </div>

            {/* 이미지 첨부 */}
            <div className="field">
              <label className="field-label">이미지 (선택)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            <button
              type="submit"
              className="button-primary"
              disabled={loading}
            >
              {loading ? "등록 중..." : "게시글 등록"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
