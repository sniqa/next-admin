import { PrismaClient } from "@prisma/client";
import { create_network } from "./controllers/network";
const prisma = new PrismaClient();

const find_user = async () => {
  return await prisma.user.findMany();
};

const find_network = async () => {
  return await prisma.network.findMany({
    include: { ips: true },
  });
};

const delete_network = async (id: string) => {
  return await prisma.network.delete({
    where: { id },
  });
};

const find_ip = async () => {
  return await prisma.ipAddress.findMany({});
};

// await create_network({
//   name: "sniqa",
//   cidr: ["192.168.2.8-12"],
// });
// // console.log(await delete_network("659e1cf1bd8be36b546b8827"));
// console.log(await find_network());
