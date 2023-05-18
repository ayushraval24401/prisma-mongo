import { PrismaClient } from "@prisma/client";
import { STORED_AT } from "../types/enum";

const AZURE = process.env.AZURE_BLOB_STORAGE;

const prisma = new PrismaClient();

class PostServices {
  async getAllPostsService(
    search?: string,
    page?: number,
    limit?: number,
    column?: string,
    sortType?: string
  ) {
    let posts;
    let count;
    let queryArgs: {} = {
      select: {
        id: true,
        slug: true,
        title: true,
        body: true,
        image: true,
        authorId: true,
        categoryIds: true,
        // categories: true,
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

    return { count, posts };
  }

  async getPostDetailsService(id: string) {
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });

    return { post };
  }

  async addPostService(
    slug: string,
    title: string,
    body: string,
    categories: [],
    user: string,
    image?: string
  ) {
    const setData = categories
      ? categories.map((item: any) => {
          return {
            id: item,
          };
        })
      : [];

    const stored_at = AZURE ? "AZURE" : "SERVER";

    //   Create Post for logged in user
    const post = await prisma.post.create({
      data: {
        slug: slug,
        title: title,
        body: body,
        authorId: user,
        categoryIds: categories || [],
        categories: {
          connect: setData,
        },
        image: image,
        stored_at: stored_at,
      },
    });

    return { post };
  }

  async updatePostService(id: string, user: string, data: any) {
    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    if (post?.authorId === user) {
      const setData = data.categoryIds.map((item: any) => {
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

      return { updatedPost };
    } else {
      return false;
    }
  }

  async deletePostService(id: string, user: string) {
    const post = await prisma.post.findUnique({
      where: { id: id },
      select: { authorId: true, categoryIds: true },
    });

    //   Check If Post Is Created by Logged in User

    if (post?.authorId === user) {
      const setData = post?.categoryIds.map((item: any) => {
        return {
          id: item,
        };
      });

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
      return true;
    } else {
      return false;
    }
  }

  async getMyPostService(
    user: string,
    search: string,
    page: number,
    limit: number,
    column: string,
    sortType: string
  ) {
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
          authorId: user,
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
            authorId: user,
          },
        },
      });
    } else {
      queryArgs = {
        ...queryArgs,
        where: {
          authorId: user,
        },
      };
      count = await prisma.post.count({
        where: {
          authorId: user,
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

    return { posts, count };
  }

  async getPostByCategory(categoryId: string) {
    const posts = await prisma.post.findMany({
      where: {
        categoryIds: {
          has: categoryId,
        },
      },
    });
    return { posts };
  }
}

export default new PostServices();
