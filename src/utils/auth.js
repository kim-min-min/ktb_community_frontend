// src/utils/auth.js

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}
