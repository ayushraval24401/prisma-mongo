import { Request, Response, NextFunction } from "express";
import { postValidator } from "../helper/validator";
import { PrismaClient } from "@prisma/client";
import { DefaultResponse } from "../helper/responseHelper";
import { CustomError } from "../types/CustomError";
import postServices from "../services/postServices";
import handleSingleUploadFile from "../helper/uploadHelper";
import { UploadedFile } from "../types/UploadedFile";
import blobUpload from "../services/azure/uploadFile";

const AZURE = process.env.AZURE_BLOB_STORAGE;

class PostController {
  async getAllPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const search: string = req?.query?.search as string;
      const page: number = Number(req.query.page);
      const limit: number = Number(req.query.limit);
      const column: string = req.query.column as string;
      const sortType: string = req.query.sort as string;

      const { posts, count } = await postServices.getAllPostsService(
        search,
        page,
        limit,
        column,
        sortType
      );

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

      const { post } = await postServices.getPostDetailsService(id);

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
      const request: any = req;

      let uploadResult;
      if (AZURE) {
        try {
          uploadResult = await blobUpload(req, res, next);
        } catch (err) {
          next(err);
        }
      } else {
        try {
          uploadResult = await handleSingleUploadFile(req, res);
        } catch (e) {
          next(e);
        }
      }

      const uploadedFile: UploadedFile = uploadResult.file || null;

      // Check validation
      const error = postValidator.validate(req.body);

      // Validation failed
      if (error.error) {
        const err: CustomError = new CustomError(403, error.error?.message);
        return next(err);
      }

      const { slug, body, title, categories } = req.body;

      const { post } = await postServices.addPostService(
        slug,
        title,
        body,
        categories,
        request.user,
        uploadedFile.filename
      );

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

      const resData = await postServices.updatePostService(
        id,
        request.user,
        data
      );

      if (resData) {
        return DefaultResponse(
          res,
          200,
          "Post updated successfully",
          resData.updatedPost
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

      const resData = await postServices.deletePostService(id, request.user);
      if (resData) {
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
      const search: string = req.query.search as string;
      const page: number = Number(req.query.page);
      const limit: number = Number(req.query.limit);
      const column: string = req.query.column as string;
      const sortType: string = req.query.sort as string;

      const { posts, count } = await postServices.getMyPostService(
        request.user,
        search,
        page,
        limit,
        column,
        sortType
      );

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

      const { posts } = await postServices.getPostByCategory(id);

      return DefaultResponse(res, 200, "Posts fetched successfully", posts);
    } catch (err) {
      next(err);
    }
  }
}

export default new PostController();
