import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class CategoryServices {
  async getAllcategoriesService() {
    const categories = await prisma.category.findMany();
    return { categories };
  }

  async getCategoryDetailsService(id: string) {
    const category = await prisma.category.findUnique({
      where: { id: id },
    });
    console.log(category);
    return { category };
  }

  async createCategoryService(name: string) {
    const category = await prisma.category.create({
      data: { name },
    });
    return { category };
  }

  async editCategoryService(id: string, name: string) {
    const updatedCategory = await prisma.category.update({
      where: { id: id },
      data: { name: name },
    });
    return { updatedCategory };
  }

  async deleteCategoryService(id: string) {
    const deletedCategory = await prisma.category.delete({
      where: { id: id },
    });
    return;
  }
}

export default new CategoryServices();
