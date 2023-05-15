import bcrypt from "bcrypt";

export const hashPassword = async (plaintextPassword: string) => {
  const hash = await bcrypt.hash(plaintextPassword, 10); // Store hash in the database
  return hash;
};

// compare password
export const comparePassword = async (
  plaintextPassword: string,
  hash: string
) => {
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
};
