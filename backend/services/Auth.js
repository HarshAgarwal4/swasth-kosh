import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "SwasthaKosh_Silicosis_Secret_2026";

async function setUser(id) {
  if (!id) return null;
  const payload = { id: id };
  const token = await jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  return token;
}

function getUser(token) {
  if (!token) {
    return false;
  }
  try {
    let r = jwt.verify(token, JWT_SECRET);
    return r;
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return false;
  }
}

export { getUser, setUser };