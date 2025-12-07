// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";

import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import PostsPage from "../pages/PostsPage";
import PostWritePage from "../pages/PostWritePage";     
import PostDetailPage from "../pages/PostDetailPage";   
import PostEditPage from "../pages/PostEditPage";  
import ProfileEditPage from "../pages/ProfileEdit";
import PasswordEditPage from "../pages/PasswordEditPage";


export default function AppRouter() {
  return (
    <Routes>
      {/* 루트 → 일단 /posts 로 */}
      <Route path="/" element={<Navigate to="/posts" replace />} />

      {/* 비로그인도 접근 가능 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 로그인 필수 영역 */}
      <Route
        path="/posts"
        element={
          <RequireAuth>
            <PostsPage />
          </RequireAuth>
        }
      />

      {/* 게시글 작성 페이지 (로그인 필수) */}
      <Route
        path="/posts/new"
        element={
          <RequireAuth>
            <PostWritePage />
          </RequireAuth>
        }
      />

     {/* 게시글 상세 */}
      <Route
        path="/posts/:id"
        element={
          <RequireAuth>
            <PostDetailPage />
          </RequireAuth>
        }
      />

      {/* 게시글 수정 페이지 */}
     <Route
        path="/posts/:id/edit"
        element={
          <RequireAuth>
            <PostEditPage />
          </RequireAuth>
        }
      />
      {/* 프로필 수정 */}
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfileEditPage />
          </RequireAuth>
        }
      />

      {/* 비밀번호 수정 페이지 */}
      <Route
        path="/password"
        element={
          <RequireAuth>
            <PasswordEditPage />
          </RequireAuth>
        }
      />

    </Routes>
  );
}
