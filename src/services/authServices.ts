import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword } from "../helper/passwordHelper";
import { CustomError } from "../types/CustomError";
import { generateJWTToken } from "../helper/tokenHelper";

const prisma = new PrismaClient();

class AuthServices {
  async registerUserService(
    email: string,
    name: string,
    password: string,
    address: {}
  ) {
    // Check if the user is already registered

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // User already registered
    if (existingUser) {
      const err = new Error("User already registered");
      throw err;
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

    return { user };
  }

  async loginUserService(email: string, password: string) {
    //   Find User By Email Address
    const existing_user = await prisma.user.findUnique({
      where: { email: email },
    });

    //   User not Found
    if (!existing_user) {
      const error = new CustomError();
      error.message = "Invalid Credential";
      error.status = 403;
      throw error;
    }

    //   User Found - Check Password
    const isValid = await comparePassword(password, existing_user.password);

    //   Invalid Password
    if (!isValid) {
      const error = new CustomError();
      error.message = "Invalid Credential";
      error.status = 403;
      throw error;
    }

    //   Generate JWT Token
    const token = await generateJWTToken({
      id: existing_user.id,
      email: existing_user.email,
    });

    return { token };
  }

  async getMyProfileService(user: string) {
    // Fetch Logged In User Profile

    const profile = await prisma.user.findUnique({
      where: { id: user },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    });

    return { profile };
  }
}

export default new AuthServices();
