// src/pages/PostsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const BASE_URL = "/api";

export default function PostsPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // 게시글 목록 API 호출
  // ---------------------------
  const loadPosts = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await apiFetch(`${BASE_URL}/posts`, {}, navigate);
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || data?.detail || "게시글을 불러오지 못했습니다.");
      }

      const newPosts = data.posts || data || [];
      setPosts(newPosts);
    } catch (err) {
      console.error(err);
      alert(err.message || "게시글 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 첫 로딩 1회만 실행
  // ---------------------------
  useEffect(() => {
    loadPosts();
  }, []);

  // ---------------------------
  // 렌더링
  // ---------------------------
  return (
    <div className="posts-page">
      <main className="posts-main">
        <section className="posts-panel">

          {/* 상단 툴바 */}
          <div className="posts-toolbar">
            <button
              type="button"
              className="posts-write-btn"
              onClick={() => navigate("/posts/new")}
            >
              게시글 작성
            </button>
          </div>

          {loading && <div className="posts-state-text">불러오는 중...</div>}

          {!loading && posts.length === 0 && (
            <div className="posts-state-text empty">
              아직 작성된 글이 없습니다.
            </div>
          )}

          {/* 게시글 리스트 */}
          <div className="posts-list">
            {posts.map((post) => (
              <article
                key={post.id}
                className="post-card"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <div className="post-card-top">
                  <h3 className="post-title">{post.title}</h3>
                  <span className="post-date">
                    {post.created_at || post.createdAt}
                  </span>
                </div>

                <p className="post-preview">
                  {post.content?.slice(0, 80) || "내용이 없습니다."}
                  {post.content?.length > 80 && "…"}
                </p>

                <div className="post-card-bottom">
                  <div className="post-meta">
                    <span>좋아요 {post.likes ?? 0}</span>
                    <span>댓글 {post.comments_count ?? post.comment_cnt ?? 0}</span>
                    <span>조회 {post.views ?? 0}</span>
                  </div>

                  <div className="post-author">
                    <div className="author-avatar" />
                    <span className="author-name">
                      {post.author_nickname ||
                        post.nickname ||
                        post.user_nickname ||
                        "익명"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
