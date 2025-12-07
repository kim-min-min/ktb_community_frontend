// src/pages/PostDetailPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PostDetailPage() {
  const { id } = useParams(); // /posts/:id
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [liked, setLiked] = useState(false); // 현재 화면에서의 좋아요 상태

  // 현재 로그인 유저
  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access_token") || "";

  // 유저별 좋아요 상태를 저장할 localStorage key
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
      setPost(postData);
    } catch (err) {
      console.error(err);
      alert(err.message || "게시글 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 최초 1회 상세 호출
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 게시글이 로딩된 뒤, localStorage 에서 이 글의 좋아요 여부 복원
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
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      navigate("/login");
      return;
    }

    setSavingComment(true);
    try {
      const formData = new FormData();
      formData.append("content", commentText.trim());

      const res = await fetch(`${BASE_URL}/posts/${id}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.detail || data?.message || "댓글 등록에 실패했습니다."
        );
      }

      setCommentText("");
      await loadPost(); // 댓글 등록 후 최신 상태 다시 가져오기
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
      const res = await fetch(
        `${BASE_URL}/posts/${id}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.detail || data?.message || "댓글 삭제에 실패했습니다."
        );
      }

      await loadPost();
    } catch (err) {
      console.error(err);
      alert(err.message || "댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  // -----------------------------
  // 댓글 수정 모드
  // -----------------------------
  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
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

      const res = await fetch(
        `${BASE_URL}/posts/${id}/comments/${editingCommentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.detail || data?.message || "댓글 수정에 실패했습니다."
        );
      }

      cancelEditComment();
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
    if (!post) return;
    if (!token) {
      alert("로그인 후 좋아요를 누를 수 있습니다.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/posts/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // 현재 liked 상태를 서버에 넘겨서
        // 서버가 "지금은 좋아요 취소인지 / 추가인지" 판단하도록
        body: JSON.stringify({ liked }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.message || data?.detail || "좋아요 처리에 실패했습니다."
        );
      }

      // 서버에서 계산해준 좋아요 수 / liked 플래그 반영
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: data.likes,
            }
          : prev
      );
      setLiked(data.liked);

      // localStorage 에도 반영해서, 다시 들어와도 상태 유지
      try {
        const stored = JSON.parse(
          localStorage.getItem(likedStorageKey) || "[]"
        );
        let next;
        if (data.liked) {
          // 좋아요 ON → 목록에 추가
          next = stored.includes(post.id) ? stored : [...stored, post.id];
        } else {
          // 좋아요 OFF → 목록에서 제거
          next = stored.filter((pid) => pid !== post.id);
        }
        localStorage.setItem(likedStorageKey, JSON.stringify(next));
      } catch {
        // localStorage 실패해도 기능은 돌아가게 무시
      }
    } catch (e) {
      console.error(e);
      alert(e.message || "좋아요 처리 중 오류가 발생했습니다.");
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
          <p className="posts-state-text">게시글을 찾을 수 없습니다.</p>
          <div className="post-detail-topbar">
            <button
              type="button"
              className="detail-back-btn"
              onClick={() => navigate("/posts")}
            >
              ← 목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;

  // -----------------------------
  // 실제 렌더링
  // -----------------------------
  return (
    <div className="post-detail-page">
      <div className="post-detail-panel">
        {/* 상단: 목록으로 버튼 */}
        <div className="post-detail-topbar">
          <button
            type="button"
            className="detail-back-btn"
            onClick={() => navigate("/posts")}
          >
            ← 목록으로
          </button>
        </div>

        {/* 제목 / 작성자 / 날짜 / 수정/삭제 */}
        <header className="post-detail-header">
          <div className="post-detail-title-row">
            <h1 className="post-detail-title">{post.title}</h1>
          </div>

          <div className="post-detail-meta">
            <div className="post-detail-author-area">
              <div className="author-avatar" />
              <span className="author-name">
                {post.user_nickname ||
                  post.author_nickname ||
                  post.nickname ||
                  "익명"}
              </span>
              <span className="post-detail-dot">•</span>
              <span className="post-detail-date">
                {post.created_at || post.createdAt}
              </span>
            </div>

            {isOwner && (
              <div className="post-detail-actions">
                <button
                  type="button"
                  className="detail-small-btn"
                  onClick={() => navigate(`/posts/${post.id}/edit`)}
                >
                  수정
                </button>
                <button
                type="button"
                className="detail-small-btn danger"
                onClick={async () => {
                    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;

                    try {
                    const res = await fetch(`${BASE_URL}/posts/${post.id}`, {
                        method: "DELETE",
                        headers: {
                        Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await res.json().catch(() => null);

                    if (!res.ok || data?.success === false) {
                        throw new Error(data?.message || data?.detail || "삭제 실패");
                    }

                    alert("게시글이 삭제되었습니다.");
                    navigate("/posts");
                    } catch (err) {
                    alert(err.message || "삭제 중 오류 발생");
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

        {/* 좋아요 / 조회수 / 댓글 수 */}
        <section className="post-detail-stats-row">
          <button
            type="button"
            className={`post-stat-box clickable ${
              liked ? "liked" : ""
            }`}
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

        {/* 댓글 작성 */}
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
              type="button"
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

          {Array.isArray(post.comments) &&
            post.comments.map((c) => {
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
                            type="button"
                            className="comment-action-btn"
                            onClick={handleUpdateComment}
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            className="comment-action-btn secondary"
                            onClick={cancelEditComment}
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="comment-action-btn"
                            onClick={() => startEditComment(c)}
                          >
                            수정
                          </button>
                          <button
                            type="button"
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
