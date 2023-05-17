import { Request, Response, NextFunction } from "express";
import { loginValidator, registerValidator } from "../helper/validator";
import { DefaultResponse } from "../helper/responseHelper";
import { CustomError } from "../types/CustomError";
import userServices from "../services/userServices";
import authServices from "../services/authServices";

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

      var email: string = req.body.email as string;
      const name: string = req.body.name as string;
      const password: string = req.body.password as string;
      const address: {} = req.body.address;

      const { user } = await authServices.registerUserService(
        email,
        name,
        password,
        address
      );

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

      const { token } = await authServices.loginUserService(
        req.body.email,
        req.body.password
      );

      return DefaultResponse(res, 200, "Login successful", { token: token });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const request: any = req;

      const { profile } = await authServices.getMyProfileService(request.user);

      return DefaultResponse(res, 200, "Profile fetched successfully", profile);
    } catch (err) {
      next(err);
    }
  }
}

export default new Authcontroller();
