import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "15m"; // short-lived access token
const REFRESH_TOKEN_EXPIRY = "7d"; // longer-lived refresh token

export const generateAccessToken = (user: { id: string; email: string }) => {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

export const generateRefreshToken = (user: { id: string; email: string }) => {
  return jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

export const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};
