import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class UserServices {
  async getAllUsersService(
    search: string,
    page: number,
    limit: number,
    column: string,
    sortType: string
  ) {
    let users;
    let count;
    let queryArgs: any = {
      select: {
        id: true,
        email: true,
        name: true,
        posts: {
          select: {
            id: true,
          },
        },
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

    return { users, count };
  }

  async getUserDetailsService(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
      },
    });
    return user;
  }

  async updateUserService(id: string, data: any) {
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
    return { user };
  }

  async deleteUserService(id: string) {
    const deleteUser = await prisma.user.delete({
      where: { id },
    });
    return;
  }

  async getProfileService() {}
}

export default new UserServices();
