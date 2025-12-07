import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (imageFile) {
        formData.append("image_file", imageFile); // 🔥 FastAPI 파라미터 이름과 맞추기
      }

      const res = await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ⚠️ Content-Type은 넣지 말 것!
        },
        body: formData,
      });

      if (res.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        const msg = data?.message || data?.detail || "게시글 등록에 실패했습니다.";
        throw new Error(msg);
      }

      alert("게시글이 등록되었습니다.");

      // 새 글 상세로 이동하거나, 목록으로 이동
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
