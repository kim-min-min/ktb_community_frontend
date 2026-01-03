// src/pages/PostDetailPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const BASE_URL = "/api";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [liked, setLiked] = useState(false);

  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const token = localStorage.getItem("access_token") || "";
  const [hidden, setHidden] = useState(false);

  const likedStorageKey = currentUser
    ? `liked_posts_user_${currentUser.id}`
    : "liked_posts_guest";

  const isOwner =
    post && currentUser && post.user_id && post.user_id === currentUser.id;

  const didFetchRef = useRef(false);

  // -----------------------------
  // 게시글 상세 불러오기
  // -----------------------------
const loadPost = async () => {
  if (!id) return;

  setLoading(true);
  setHidden(false); 
  try {
    const res = await apiFetch(`${BASE_URL}/posts/${id}`, {}, navigate);

    // [추가 1] 숨김/권한/없는 글 처리
    if (res.status === 404 || res.status === 401 || res.status === 403) {
      setHidden(true);   // state 하나만 미리 만들어 둔 상태
      setPost(null);
      return;
    }

    // [위치 변경] 성공 케이스에서만 json 파싱
    const data = await res.json();

    if (!res.ok || data?.success === false) {
      throw new Error(
        data?.detail || data?.message || "게시글을 불러오지 못했습니다."
      );
    }

    setPost(data.post || data);
  } catch (err) {
    console.error(err);
    alert(err.message || "게시글 조회 중 오류가 발생했습니다.");
    navigate("/posts");
  } finally {
    setLoading(false);
  }
};


  // 최초 1회 상세 호출
  useEffect(() => {
    if (!didFetchRef.current) {
      didFetchRef.current = true;
      loadPost();
    }
  }, [id]);

  // 좋아요 상태 복원
  useEffect(() => {
    if (!post) return;
    try {
      const stored = JSON.parse(localStorage.getItem(likedStorageKey) || "[]");
      setLiked(stored.includes(post.id));
    } catch {
      setLiked(false);
    }
  }, [post, likedStorageKey]);

  // -----------------------------
  // 댓글 등록
  // -----------------------------
  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    setSavingComment(true);
    try {
      const formData = new FormData();
      formData.append("content", commentText.trim());

      const res = await apiFetch(
        `${BASE_URL}/posts/${id}/comments`,
        { method: "POST", body: formData },
        navigate
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.detail || "댓글 등록에 실패했습니다.");
      }

      setCommentText("");
      await loadPost();
    } catch (err) {
      console.error(err);
      alert(err.message || "댓글 등록 중 오류가 발생했습니다.");
    } finally {
      setSavingComment(false);
    }
  };

  // -----------------------------
  // 댓글 삭제
  // -----------------------------
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;

    try {
      const res = await apiFetch(
        `${BASE_URL}/posts/${id}/comments/${commentId}`,
        { method: "DELETE" },
        navigate
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.detail || "댓글 삭제에 실패했습니다.");
      }

      await loadPost();
    } catch (err) {
      console.error(err);
      alert(err.message || "댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  // -----------------------------
  // 댓글 수정 저장
  // -----------------------------
  const handleUpdateComment = async () => {
    if (!editingCommentId) return;
    if (!editingCommentText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", editingCommentText.trim());

      const res = await apiFetch(
        `${BASE_URL}/posts/${id}/comments/${editingCommentId}`,
        { method: "PUT", body: formData },
        navigate
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.detail || "댓글 수정에 실패했습니다.");
      }

      setEditingCommentId(null);
      setEditingCommentText("");
      await loadPost();
    } catch (err) {
      console.error(err);
      alert(err.message || "댓글 수정 중 오류가 발생했습니다.");
    }
  };

  // -----------------------------
  // 좋아요 토글
  // -----------------------------
  const handleToggleLike = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await apiFetch(
        `${BASE_URL}/posts/${id}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked }),
        },
        navigate
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.detail || "좋아요 처리에 실패했습니다.");
      }

      setPost((prev) => (prev ? { ...prev, likes: data.likes } : prev));
      setLiked(data.liked);

      // localStorage 반영
      try {
        const stored = JSON.parse(localStorage.getItem(likedStorageKey) || "[]");
        const next = data.liked
          ? [...new Set([...stored, post.id])]
          : stored.filter((pid) => pid !== post.id);

        localStorage.setItem(likedStorageKey, JSON.stringify(next));
      } catch {}
    } catch (err) {
      console.error(err);
      alert(err.message || "좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  // -----------------------------
  // 로딩 / 404 처리
  // -----------------------------
  if (loading && !post) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-panel">
          <p className="posts-state-text">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-panel">
          <p className="posts-state-text">
            {hidden
              ? "이 게시글은 운영 정책에 의해 숨김 처리되었습니다."
              : "게시글을 찾을 수 없습니다."}
          </p>
          <button
            type="button"
            className="detail-back-btn"
            onClick={() => navigate("/posts")}
          >
            ← 목록으로
          </button>
        </div>
      </div>
    );
  }

  const commentCount = post.comments?.length || 0;

  // -----------------------------
  // 실제 렌더링
  // -----------------------------
  return (
    <div className="post-detail-page">
      <div className="post-detail-panel">
        {/* 상단 버튼 */}
        <div className="post-detail-topbar">
          <button
            type="button"
            className="detail-back-btn"
            onClick={() => navigate("/posts")}
          >
            ← 목록으로
          </button>
        </div>

        {/* 제목/작성자 */}
        <header className="post-detail-header">
          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta">
            <div className="post-detail-author-area">
              <div className="author-avatar" />
              <span className="author-name">
                {post.user_nickname || post.nickname || "익명"}
              </span>
              <span className="post-detail-dot">•</span>
              <span className="post-detail-date">
                {post.created_at || post.createdAt}
              </span>
            </div>

            {isOwner && (
              <div className="post-detail-actions">
                <button
                  className="detail-small-btn"
                  onClick={() => navigate(`/posts/${post.id}/edit`)}
                >
                  수정
                </button>

                <button
                  className="detail-small-btn danger"
                  onClick={async () => {
                    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;

                    try {
                      const res = await apiFetch(
                        `${BASE_URL}/posts/${post.id}`,
                        { method: "DELETE" },
                        navigate
                      );

                      const data = await res.json();

                      if (!res.ok || data?.success === false) {
                        throw new Error(data?.message || "삭제 실패");
                      }

                      alert("게시글이 삭제되었습니다.");
                      navigate("/posts");
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 이미지 */}
        {post.image_path && (
          <div className="post-detail-image-wrap">
            <img
              src={`${BASE_URL}/${post.image_path}`}
              alt="post"
              className="post-detail-image"
            />
          </div>
        )}

        {/* 본문 */}
        <section className="post-detail-content">
          {post.content?.split("\n").map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </section>

        {/* 좋아요/조회수/댓글수 */}
        <section className="post-detail-stats-row">
          <button
            className={`post-stat-box clickable ${liked ? "liked" : ""}`}
            onClick={handleToggleLike}
          >
            <div className="post-stat-number">{post.likes ?? 0}</div>
            <div className="post-stat-label">좋아요</div>
          </button>

          <div className="post-stat-box">
            <div className="post-stat-number">{post.views ?? 0}</div>
            <div className="post-stat-label">조회수</div>
          </div>

          <div className="post-stat-box">
            <div className="post-stat-number">{commentCount}</div>
            <div className="post-stat-label">댓글</div>
          </div>
        </section>

        {/* 댓글 입력 */}
        <section className="comment-write">
          <textarea
            className="comment-input"
            rows={4}
            placeholder="댓글을 남겨주세요."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          <div className="comment-write-footer">
            <span className="comment-count-label">
              댓글 {commentCount}개
            </span>
            <button
              className="comment-submit-btn"
              onClick={handleAddComment}
              disabled={savingComment}
            >
              {savingComment ? "등록 중..." : "댓글 등록"}
            </button>
          </div>
        </section>

        {/* 댓글 리스트 */}
        <section className="comments-list">
          {commentCount === 0 && (
            <p className="comments-empty">아직 댓글이 없습니다.</p>
          )}

          {post.comments?.map((c) => {
            const isMyComment =
              currentUser && c.user_id && currentUser.id === c.user_id;
            const inEdit = editingCommentId === c.id;

            return (
              <article key={c.id} className="comment-item">
                <div className="comment-meta">
                  <div className="comment-avatar" />

                  <div className="comment-meta-text">
                    <div className="comment-writer-row">
                      <span className="comment-writer">
                        {c.writer || c.nickname || "익명"}
                      </span>
                      <span className="comment-date">
                        {c.created_at || c.createdAt}
                      </span>
                    </div>

                    {inEdit ? (
                      <textarea
                        className="comment-edit-input"
                        rows={3}
                        value={editingCommentText}
                        onChange={(e) =>
                          setEditingCommentText(e.target.value)
                        }
                      />
                    ) : (
                      <p className="comment-content">{c.content}</p>
                    )}
                  </div>
                </div>

                {isMyComment && (
                  <div className="comment-actions">
                    {inEdit ? (
                      <>
                        <button
                          className="comment-action-btn"
                          onClick={handleUpdateComment}
                        >
                          저장
                        </button>
                        <button
                          className="comment-action-btn secondary"
                          onClick={cancelEditComment}
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="comment-action-btn"
                          onClick={() => startEditComment(c)}
                        >
                          수정
                        </button>
                        <button
                          className="comment-action-btn danger"
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
