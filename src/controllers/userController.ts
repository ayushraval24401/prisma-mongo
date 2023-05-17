import { Request, Response, NextFunction } from "express";
import { DefaultResponse } from "../helper/responseHelper";
import userServices from "../services/userServices";

class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const search: string = req.query.search as string;
      const page: number = Number(req.query.page);
      const limit: number = Number(req.query.limit);
      const column: string = req.query.column as string;
      const sortType: string = req.query.sort as string;

      const { users, count } = await userServices.getAllUsersService(
        search,
        page,
        limit,
        column,
        sortType
      );

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

      const user = await userServices.getUserDetailsService(id);

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

      const { user } = await userServices.updateUserService(id, data);

      return DefaultResponse(res, 200, "User updated successfully", user);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      // Find User By Id

      // const postsData = await prisma.post.findMany({
      //   where: { authorId: id },
      //   select: { categoryIds: true },
      // });

      // let totalCats: any = [];
      // postsData.forEach((post) => {
      //   const final = post.categoryIds.map((item) => {
      //     return { id: item };
      //   });
      //   totalCats = [...totalCats, ...final];
      // });

      // const updateQuery: any = {
      //   categoryIds: {
      //     disconnect: totalCats,
      //   },
      // };

      // const deleteFromCategory = await prisma.post.updateMany({
      //   where: { authorId: id },
      //   data: updateQuery,
      // });

      await userServices.deleteUserService(id);

      return DefaultResponse(res, 200, "User deleted successfully");
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
