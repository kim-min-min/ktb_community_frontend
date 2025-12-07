// src/pages/PostEditPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
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

  // 기존 글 불러오기 (처음 진입 / id 변경 시 한 번만)
  useEffect(() => {
    const loadPost = async () => {
      if (!token) {
        alert("로그인 후 이용 가능합니다.");
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/login");
          return;
        }

        const data = await res.json().catch(() => null);

        if (!res.ok || data?.success === false) {
          throw new Error(
            data?.detail || data?.message || "게시글을 불러오지 못했습니다."
          );
        }

        const postData = data.post || data;

        // 본인 글인지 체크
        if (
          currentUser &&
          postData.user_id &&
          currentUser.id !== postData.user_id
        ) {
          alert("본인이 작성한 글만 수정할 수 있습니다.");
          navigate(`/posts/${id}`);
          return;
        }

        setTitle(postData.title || "");
        setContent(postData.content || "");
        setExistingImagePath(postData.image_path || null);
      } catch (err) {
        console.error(err);
        alert(err.message || "게시글 조회 중 오류가 발생했습니다.");
        navigate("/posts");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
    // 의도적으로 id 기준으로만 한 번 호출
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 이미지 선택
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

      // 새 이미지를 선택한 경우에만 전송
      if (newImageFile) {
        formData.append("image_file", newImageFile);
      }

      const res = await fetch(`${BASE_URL}/posts/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.detail || data?.message || "게시글 수정에 실패했습니다."
        );
      }

      alert("게시글이 수정되었습니다.");
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error(err);
      alert(err.message || "게시글 수정 중 오류가 발생했습니다.");
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
        {/* 상단: 뒤로가기 */}
        <div className="post-detail-topbar">
          <button
            type="button"
            className="detail-back-btn"
            onClick={() => navigate(`/posts/${id}`)}
          >
            ← 게시글로
          </button>
        </div>

        {/* 제목 영역 */}
        <header className="post-detail-header">
          <div className="post-detail-title-row">
            <h1 className="post-detail-title">게시글 수정</h1>
          </div>
        </header>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 제목 */}
          <div className="field">
            <label className="field-label">
              제목 <span style={{ color: "#ff9a9a", fontSize: 12 }}>*</span>
            </label>
            <input
              type="text"
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div className="field">
            <label className="field-label">
              내용 <span style={{ color: "#ff9a9a", fontSize: 12 }}>*</span>
            </label>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
            />
          </div>

          {/* 이미지 */}
          <div className="field">
            <label className="field-label">이미지</label>

            {/* 기존 이미지 */}
            {existingImagePath && !previewUrl && (
              <div className="post-detail-image-wrap" style={{ marginTop: 6 }}>
                <img
                  src={`${BASE_URL}/${existingImagePath}`}
                  alt="현재 이미지"
                  className="post-detail-image"
                />
              </div>
            )}

            {/* 새 이미지 미리보기 */}
            {previewUrl && (
              <div className="post-detail-image-wrap" style={{ marginTop: 6 }}>
                <img
                  src={previewUrl}
                  alt="새 이미지 미리보기"
                  className="post-detail-image"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              style={{ marginTop: 8, fontSize: 13, color: "#f0f0ff" }}
              onChange={handleFileChange}
            />
            <div style={{ fontSize: 12, marginTop: 4, color: "#d0d0ff" }}>
              이미지를 변경하지 않으려면 파일을 선택하지 않아도 됩니다.
            </div>
          </div>

          {/* 버튼 영역 */}
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
