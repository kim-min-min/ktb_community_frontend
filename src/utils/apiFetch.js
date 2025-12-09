// src/utils/apiClient.js
import { logout } from "./auth";

export async function apiFetch(path, options = {}, navigate) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(path, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    logout();
    navigate("/login", { replace: true });
    throw new Error("로그인이 만료되었습니다. 다시 로그인해주세요.");
  }

  return res;
}
