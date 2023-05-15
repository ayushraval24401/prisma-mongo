import { Request, Response, NextFunction } from "express";
import { loginValidator, registerValidator } from "../helper/validator";
import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword } from "../helper/passwordHelper";
import { DefaultResponse } from "../helper/responseHelper";
import { CustomError } from "../types/CustomError";
import { generateJWTToken } from "../helper/tokenHelper";

const prisma = new PrismaClient();

class Authcontroller {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Check validation
      const error = registerValidator.validate(req.body);

      // Validation failed
      if (error.error) {
        const err: CustomError = new CustomError(403, error.error?.message);
        return next(err);
      }

      const email = req.body.email;
      const name = req.body.name;
      const password: string = req.body.password;
      const address = req.body.address;

      // Check if the user is already registered

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      // User already registered
      if (existingUser) {
        return DefaultResponse(res, 400, "User already registered");
      }

      //   Encrypt Password
      const hashedPassword: any = await hashPassword(password);

      //   Create A New User
      const user = await prisma.user.create({
        data: {
          email: email,
          name: name,
          password: hashedPassword,
          address: address,
        },
      });

      return DefaultResponse(res, 201, "User created successfully", user);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      //   Check validation
      const error = loginValidator.validate(req.body);

      //   Validation failed
      if (error.error) {
        const err: CustomError = new CustomError(403, error.error?.message);
        return next(err);
      }

      //   Find User By Email Address
      const existing_user = await prisma.user.findUnique({
        where: { email: req.body.email },
      });

      //   User not Found
      if (!existing_user) {
        return DefaultResponse(res, 403, "Invalid credentials");
      }

      //   User Found - Check Password
      const isValid = await comparePassword(
        req.body.password,
        existing_user.password
      );

      //   Invalid Password
      if (!isValid) {
        return DefaultResponse(res, 403, "Invalid credentials");
      }

      //   Generate JWT Token
      const token = await generateJWTToken({
        id: existing_user.id,
        email: existing_user.email,
      });

      return DefaultResponse(res, 200, "Login successful", { token: token });
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const search: any = req.query.search;
      const page: number = Number(req.query.page);
      const limit: number = Number(req.query.limit);
      const column: any = req.query.column;
      const sortType = req.query.sort;

      let users;
      let count;
      let queryArgs: any = {
        select: {
          id: true,
          email: true,
          name: true,
          posts: true,
          created_at: true,
        },
      };

      if (column) {
        queryArgs = {
          ...queryArgs,
          where: {
            [column]: {
              mode: "insensitive",
              contains: search,
            },
          },
          orderBy: {
            [column]: sortType ?? "asc",
          },
        };
        count = await prisma.user.count({
          where: {
            [column]: {
              mode: "insensitive",
              contains: search,
            },
          },
        });
      } else {
        count = await prisma.user.count();
      }

      if (!page || !limit) {
        users = await prisma.user.findMany({
          ...queryArgs,
        });
      } else {
        users = await prisma.user.findMany({
          ...queryArgs,
          skip: (page - 1) * limit,
          take: limit,
        });
      }

      return DefaultResponse(
        res,
        200,
        "Users fetched successfully",
        users,
        count,
        page
      );
    } catch (err) {
      next(err);
    }
  }

  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      // Find User By Id

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          created_at: true,
        },
      });

      //   User Not Found
      if (!user) {
        return DefaultResponse(res, 404, "User not found");
      }

      return DefaultResponse(res, 200, "User fetched successfully", user);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      // Find and update User By Id

      const { email, ...data } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: data,
        select: {
          id: true,
          email: true,
          name: true,
          created_at: true,
        },
      });

      return DefaultResponse(res, 200, "User updated successfully", user);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      // Find User By Id

      const user = await prisma.user.delete({
        where: { id },
      });

      return DefaultResponse(res, 200, "User deleted successfully");
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const request: any = req;

      // Fetch Logged In User Profile

      const profile = await prisma.user.findUnique({
        where: { id: request.user },
        select: {
          id: true,
          email: true,
          name: true,
          created_at: true,
          updated_at: true,
        },
      });

      return DefaultResponse(res, 200, "Profile fetched successfully", profile);
    } catch (err) {
      next(err);
    }
  }
}

export default new Authcontroller();
