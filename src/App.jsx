// src/App.jsx
import AppRouter from "./routes/AppRouter";
import AppHeader from "./components/AppHeader";

export default function App() {
  return (
    <>
      <AppHeader />   {/* 모든 페이지에서 공통으로 보이는 헤더 */}
      <AppRouter />   {/* 실제 페이지 라우팅 */}
    </>
  );
}
