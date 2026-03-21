const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const { AppError } = require("../../core/http/errors");
const { env } = require("../../config/env");

const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
});

/* ---------------------------
   POST /auth/signup
--------------------------- */
const signup = async (req, res, next) => {
  try {
    const { email, password, role, display_name, phone } = req.body;

    if (!email || !password || !role || !display_name) {
      return next(new AppError(400, "MISSING_FIELDS", "email, password, role, and display_name are required."));
    }

    if (!["buyer", "seller"].includes(role)) {
      return next(new AppError(400, "INVALID_ROLE", "role must be 'buyer' or 'seller'."));
    }

    const existing = await pool.query(
      `SELECT id FROM users WHERE email=$1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return next(new AppError(409, "EMAIL_TAKEN", "An account with this email already exists."));
    }

    const password_hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, display_name, phone)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, email, role, display_name, phone, created_at`,
      [email, password_hash, role, display_name, phone || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   POST /auth/login
--------------------------- */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError(400, "MISSING_FIELDS", "email and password are required."));
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, role, display_name, is_active
       FROM users WHERE email=$1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return next(new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password."));
    }

    if (!user.is_active) {
      return next(new AppError(403, "ACCOUNT_DISABLED", "This account has been disabled."));
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return next(new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password."));
    }

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      env.jwtAccessSecret,
      { expiresIn: env.accessTokenTtl }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      env.jwtRefreshSecret,
      { expiresIn: env.refreshTokenTtl }
    );

    res.json({
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          display_name: user.display_name,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   POST /auth/refresh
--------------------------- */
const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return next(new AppError(400, "MISSING_FIELDS", "refresh_token is required."));
    }

    let payload;
    try {
      payload = jwt.verify(refresh_token, env.jwtRefreshSecret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new AppError(401, "TOKEN_EXPIRED", "Refresh token has expired. Please log in again."));
      }
      return next(new AppError(401, "INVALID_TOKEN", "Refresh token is invalid."));
    }

    // Fetch current role from DB in case it changed
    const result = await pool.query(
      `SELECT id, role, is_active FROM users WHERE id=$1`,
      [payload.sub]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return next(new AppError(401, "UNAUTHENTICATED", "User not found or disabled."));
    }

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      env.jwtAccessSecret,
      { expiresIn: env.accessTokenTtl }
    );

    res.json({ data: { access_token: accessToken } });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   POST /auth/logout
--------------------------- */
const logout = async (_req, res, next) => {
  try {
    // Tokens are stateless (JWT). The client must discard both tokens.
    res.json({ message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------
   GET /auth/me
--------------------------- */
const me = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, display_name, phone, created_at
       FROM users WHERE id=$1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return next(new AppError(404, "NOT_FOUND", "User not found."));
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
  me,
};
