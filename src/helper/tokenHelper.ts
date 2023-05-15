import jwt from "jsonwebtoken";

export const generateJWTToken = (payload: any) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY || "123456", {
    expiresIn: "2d",
  });
  return token;
};

export const verifyJWTToken = (token: any) => {
  const virified = jwt.verify(token, process.env.JWT_SECRET_KEY || "123456");
  return virified;
};
