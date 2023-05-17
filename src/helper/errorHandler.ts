import { Request, Response, NextFunction } from "express";
import { CustomError } from "../types/CustomError";

// Custom Error Object
export const customError = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new CustomError(err.status, err.message, err.additionalInfo);
  return res.status(error.status).json({
    error: err,
    message: error.message,
    successCode: error.status,
  });
};

// 404 Not Found Error
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(404, `Path not found: ${req.originalUrl}`);
  next(error);
};
