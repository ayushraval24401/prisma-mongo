import { Request, Response, NextFunction } from "express";
import { categoryValidator } from "../helper/validator";
import { PrismaClient } from "@prisma/client";
import { DefaultResponse } from "../helper/responseHelper";
import { CustomError } from "../types/CustomError";

const prisma = new PrismaClient();

class CategoryController {
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany();

      return DefaultResponse(
        res,
        200,
        "Fetched categories successfully",
        categories
      );
    } catch (err) {
      next(err);
    }
  }

  async getCategoryDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const category = await prisma.category.findUnique({
        where: { id: id },
      });

      return DefaultResponse(
        res,
        200,
        "Fetched Category Details successfully",
        category
      );
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      // Check validation
      const error = categoryValidator.validate(req.body);

      // Validation failed
      if (error.error) {
        const err: CustomError = new CustomError(403, error.error?.message);
        return next(err);
      }
      const category = await prisma.category.create({
        data: req.body,
      });

      return DefaultResponse(
        res,
        201,
        "Category created successfully",
        category
      );
    } catch (err) {
      next(err);
    }
  }

  async editCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const updatedCategory = await prisma.category.update({
        where: { id: id },
        data: req.body,
      });

      return DefaultResponse(
        res,
        200,
        "Category updated successfully",
        updatedCategory
      );
    } catch (err) {
      next(err);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const deletedCategory = await prisma.category.delete({
        where: { id: id },
      });
      return DefaultResponse(res, 200, "Category deleted successfully");
    } catch (err) {
      next(err);
    }
  }
}

export default new CategoryController();
