// src/utils/passwordDemo.js
import bcrypt from "bcryptjs";

/** Returns { salt, hash } using bcrypt. */
export async function demoHashPassword(password, cost = 10) {
  const salt = await bcrypt.genSalt(cost);
  const hash = await bcrypt.hash(password, salt);
  return { salt, hash };
}

/** Compares a plaintext password to a bcrypt hash. */
export async function demoVerify(password, hash) {
  return bcrypt.compare(password, hash);
}
