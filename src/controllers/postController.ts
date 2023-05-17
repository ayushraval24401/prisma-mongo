import { Request, Response, NextFunction } from "express";
import { postValidator } from "../helper/validator";
import { PrismaClient } from "@prisma/client";
import { DefaultResponse } from "../helper/responseHelper";
import { CustomError } from "../types/CustomError";

const prisma = new PrismaClient();

class PostController {
  async getAllPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const search: any = req.query.search;
      const page: number = Number(req.query.page);
      const limit: number = Number(req.query.limit);
      const column: any = req.query.column;
      const sortType = req.query.sort;

      let posts;
      let count;
      let queryArgs: any = {
        select: {
          id: true,
          slug: true,
          title: true,
          body: true,
          authorId: true,
          // categoryIds: true,
          categories: true,
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
        count = await prisma.post.count({
          where: {
            [column]: {
              mode: "insensitive",
              contains: search,
            },
          },
        });
      } else {
        count = await prisma.post.count();
      }

      if (!page || !limit) {
        posts = await prisma.post.findMany({
          ...queryArgs,
        });
      } else {
        posts = await prisma.post.findMany({
          ...queryArgs,
          skip: (page - 1) * limit,
          take: limit,
        });
      }

      return DefaultResponse(
        res,
        200,
        "Posts fetched successfully",
        posts,
        count,
        page
      );
    } catch (err) {
      next(err);
    }
  }

  async getPostDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const post = await prisma.post.findUnique({
        where: {
          id: id,
        },
      });

      return DefaultResponse(
        res,
        200,
        "Post details fetched successfully",
        post
      );
    } catch (err) {
      next(err);
    }
  }

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      // Check validation
      const error = postValidator.validate(req.body);

      // Validation failed
      if (error.error) {
        const err: CustomError = new CustomError(403, error.error?.message);
        return next(err);
      }

      const request: any = req;

      const { slug, body, title, categories } = req.body;

      const setData = categories
        ? categories.map((item: any) => {
            return {
              id: item,
            };
          })
        : [];

      //   Create Post for logged in user
      const post = await prisma.post.create({
        data: {
          slug: slug,
          title: title,
          body: body,
          authorId: request.user,
          categoryIds: categories || [],
          categories: {
            connect: setData,
          },
        },
      });

      return DefaultResponse(res, 201, "Post created successfully", post);
    } catch (err) {
      next(err);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const request: any = req;
      const id = req.params.id;

      const { authorId, author, ...data } = req.body;

      const post = await prisma.post.findUnique({
        where: { id: id },
      });

      //   Check If Post Is Created by Logged in User

      if (post?.authorId === request.user) {
        const setData = req.body.categoryIds.map((item: any) => {
          return {
            id: item,
          };
        });

        const updatedPost = await prisma.post.update({
          where: { id: id },
          data: {
            ...data,
            categories: {
              connect: setData,
            },
          },
        });

        return DefaultResponse(
          res,
          200,
          "Post updated successfully",
          updatedPost
        );
      } else {
        return DefaultResponse(
          res,
          403,
          "You do not have permission to edit this post"
        );
      }
    } catch (err) {
      next(err);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const request: any = req;
      const id = req.params.id;

      const post = await prisma.post.findUnique({
        where: { id: id },
        select: { authorId: true, categoryIds: true },
      });

      const setData = post?.categoryIds.map((item: any) => {
        return {
          id: item,
        };
      });

      //   Check If Post Is Created by Logged in User

      if (post?.authorId === request.user) {
        const deleted = await prisma.$transaction([
          prisma.post.update({
            where: { id: id },
            data: {
              categories: {
                disconnect: setData,
              },
            },
          }),
          prisma.post.delete({
            where: { id: id },
          }),
        ]);
        return DefaultResponse(res, 200, "Post deleted successfully");
      } else {
        return DefaultResponse(
          res,
          403,
          "You do not have permission to delete this post"
        );
      }
    } catch (err) {
      next(err);
    }
  }

  async getMyPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const request: any = req;
      const search: any = req.query.search;
      const page: number = Number(req.query.page);
      const limit: number = Number(req.query.limit);
      const column: any = req.query.column;
      const sortType = req.query.sort;

      let posts;
      let count;
      let queryArgs: any = {
        select: {
          id: true,
          slug: true,
          title: true,
          body: true,
          authorId: true,
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
            authorId: request.user,
          },
          orderBy: {
            [column]: sortType ?? "asc",
          },
        };
        count = await prisma.post.count({
          where: {
            [column]: {
              mode: "insensitive",
              contains: search,
              authorId: request.user,
            },
          },
        });
      } else {
        queryArgs = {
          ...queryArgs,
          where: {
            authorId: request.user,
          },
        };
        count = await prisma.post.count({
          where: {
            authorId: request.user,
          },
        });
      }

      if (!page || !limit) {
        posts = await prisma.post.findMany({
          ...queryArgs,
        });
      } else {
        posts = await prisma.post.findMany({
          ...queryArgs,
          skip: (page - 1) * limit,
          take: limit,
        });
      }

      return DefaultResponse(
        res,
        200,
        "Posts fetched successfully",
        posts,
        count,
        page
      );
    } catch (err) {
      next(err);
    }
  }

  async getPostsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const posts = await prisma.category.findUnique({
        where: {
          id: id,
        },
        select: {
          posts: true,
        },
      });
      return DefaultResponse(res, 200, "Posts fetched successfully", posts);
    } catch (err) {
      next(err);
    }
  }
}

export default new PostController();
