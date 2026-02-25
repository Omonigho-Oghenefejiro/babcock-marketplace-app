const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
const MAX_REFRESH_TOKENS_PER_USER = Number(process.env.MAX_REFRESH_TOKENS_PER_USER || 5);

const createAccessToken = ({ userId, role }) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });

const createRefreshToken = () => crypto.randomBytes(64).toString('hex');

const hashRefreshToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const getRefreshTokenExpiryDate = () =>
  new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

const pruneRefreshTokens = (refreshTokens = []) => {
  const now = Date.now();
  const valid = refreshTokens
    .filter((entry) => new Date(entry.expiresAt).getTime() > now)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return valid.slice(0, MAX_REFRESH_TOKENS_PER_USER);
};

module.exports = {
  ACCESS_TOKEN_EXPIRES_IN,
  MAX_REFRESH_TOKENS_PER_USER,
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiryDate,
  pruneRefreshTokens,
};
