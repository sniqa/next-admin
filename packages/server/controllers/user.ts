import * as ERROR from "@next-admin/utils/src/error";
import { z } from "zod";
import { prisma } from "../db";

// create
const CreateUserSchema = z.object({
  username: z.string().min(1, "不能为空"),
  account: z.string().optional(),
  password: z.string().optional(),
  department: z.string().optional(),
  description: z.string().optional(),
  remark: z.string().optional(),
});

type CreateUser = z.infer<typeof CreateUserSchema>;

export const create_user = async (data: CreateUser) => {
  if (!CreateUserSchema.safeParse(data)) {
    throw new Error(ERROR.ARGMENTS_ERROR);
  }

  if (await prisma.user.findUnique({ where: { username: data.username } })) {
    throw new Error(ERROR.REPEAT.USERNAME_IS_REPEAT);
  }

  return await prisma.user.create({ data });
};

//   find
export const find_user = async () => {
  return await prisma.user.findMany();
};

// delete
const DeleteSchema = z.object({
  id: z.string().min(1, "不能为空"),
});

type DeleteUserType = z.infer<typeof DeleteSchema>;

export const delete_user = async (data: DeleteUserType) => {
  if (!DeleteSchema.safeParse(data)) {
    throw new Error(ERROR.ARGMENTS_ERROR);
  }

  return await prisma.user.delete({ where: { id: data.id } });
};

// update
const UpdateUserSchema = z.object({
  id: z.string().min(1, "不能为空"),
  username: z.string().optional(),
  account: z.string().optional(),
  password: z.string().optional(),
  department: z.string().optional(),
  description: z.string().optional(),
  remark: z.string().optional(),
});

type UpdateUserType = z.infer<typeof UpdateUserSchema>;

export const update_user = async (data: UpdateUserType) => {
  if (!UpdateUserSchema.safeParse(data).success) {
    throw new Error(ERROR.ARGMENTS_ERROR);
  }

  const { id, ...res } = data;

  return await prisma.user.update({ where: { id }, data: res });
};
