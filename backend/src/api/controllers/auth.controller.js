const { buildNotImplementedHandler } = require("./_template");

const signup = buildNotImplementedHandler("POST /auth/signup");
const login = buildNotImplementedHandler("POST /auth/login");
const refresh = buildNotImplementedHandler("POST /auth/refresh");
const logout = buildNotImplementedHandler("POST /auth/logout");
const me = buildNotImplementedHandler("GET /auth/me");

module.exports = {
  signup,
  login,
  refresh,
  logout,
  me,
};
