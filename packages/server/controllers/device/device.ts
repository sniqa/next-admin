import type { UploadDeviceInput } from "@next-admin/types";
import { successResult, toTimeString } from "@next-admin/utils";
import * as ERROR from "@next-admin/utils/src/error";
import { z } from "zod";
import { prisma, turnEmptyStringtoNull } from "../../db";

// create device
const CreateDeviceSchema = z.object({
  serialNumber: z.string(),
  productNumber: z.string().optional(),
  name: z.string().optional(),
  location: z.string().optional(),

  userId: z.string().or(z.null()),
  deviceStatusId: z.string().or(z.null()),
  deviceModelId: z.string().or(z.null()),
  ipAddressId: z.string().or(z.null()),

  description: z.string().optional(),
  remark: z.string().optional(),
});
type CreateDevice = z.infer<typeof CreateDeviceSchema>;
export const create_device = async (requestData: CreateDevice) => {
  if (!CreateDeviceSchema.safeParse(requestData).success) {
    throw new Error(ERROR.ARGMENTS_ERROR);
  }

  const data = turnEmptyStringtoNull(
    requestData,
    "userId",
    "deviceStatusId",
    "deviceModelId",
    "ipAddressId"
  );

  if (
    await prisma.device.findUnique({
      where: { serialNumber: data.serialNumber },
    })
  ) {
    throw new Error(ERROR.REPEAT.SERIAL_NUMBER_IS_REPEAT);
  }

  if (data.ipAddressId) {
    await checkAndUpdateIp({
      ipAddressId: data.ipAddressId,
      userId: data.userId,
    });
  }

  return await prisma.device.create({ data });
};

// find
export const find_device = async () => {
  return await prisma.device.findMany({
    include: {
      ipAddress: { include: { network: true } },
      deviceModel: true,
      user: true,
      deviceStatus: true,
    },
  });
};

export const find_device_by_uesr = async ({ id }: { id: string }) => {
  return await prisma.user.findMany({
    where: {
      id: id,
    },
    include: {
      device: true,
    },
  });
};

// update
// update device
const UpdateDeviceSchema = z.object({
  id: z.string(),
  serialNumber: z.string().optional(),
  productNumber: z.string().optional(),
  name: z.string().optional(),
  location: z.string().optional(),
  status: z.number().optional(),
  mac: z.string().optional(),
  diskSerialNumber: z.string().optional(),

  userId: z.string().or(z.null()),
  deviceStatusId: z.string().or(z.null()),
  deviceModelId: z.string().or(z.null()),
  ipAddressId: z.string().or(z.null()),

  description: z.string().optional(),
  remark: z.string().optional(),
});

type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;

export const update_device = async (requestData: UpdateDevice) => {
  if (!UpdateDeviceSchema.safeParse(requestData).success) {
    throw new Error(ERROR.ARGMENTS_ERROR);
  }

  const data = turnEmptyStringtoNull(
    requestData,
    "userId",
    "deviceStatusId",
    "deviceModelId",
    "ipAddressId"
  );

  const { id, ...res } = data;

  const originData = await prisma.device.findUnique({
    where: { id },
    include: {
      deviceStatus: true,
      user: true,
      deviceModel: true,
      ipAddress: { include: { network: true } },
    },
  });

  if (originData === null) {
    throw new Error(ERROR.NOT_HAVE_THIS_DEVICE);
  }

  const saveToHistory = prisma.deviceHistory.create({
    data: {
      data: JSON.stringify(originData),
      deviceId: originData?.id!,
    },
  });

  console.log(originData.ipAddressId !== data.ipAddressId);

  // update ip
  let updateOriginIpUser = null;
  if (originData.ipAddressId !== data.ipAddressId) {
    if (originData.ipAddressId !== null) {
      updateOriginIpUser = prisma.ipAddress.update({
        where: { id: originData.ipAddressId },
        data: {
          user: { disconnect: true },
          device: { disconnect: true },
        },
      });
    }
  }

  let updateIpUser = null;
  if (data.ipAddressId) {
    updateIpUser = prisma.ipAddress.update({
      where: { id: data.ipAddressId },
      data: {
        userId: data.userId,
      },
    });
  }

  const updateDevice = prisma.device.update({
    where: { id },
    data: { ...res },
  });

  const opration = [
    saveToHistory,
    updateDevice,
    updateOriginIpUser,
    updateIpUser,
  ].filter((o) => o !== null);

  return prisma.$transaction(opration as []);
};

// delete device
const DeleteSchema = z.object({
  id: z.string().min(1, "ID不能为空"),
});

type DeleteDeviceType = z.infer<typeof DeleteSchema>;
export const delete_device = async (data: DeleteDeviceType) => {
  if (!DeleteSchema.safeParse(data).success) {
    throw new Error(ERROR.ARGMENTS_ERROR);
  }

  const originData = await prisma.device.findUnique({
    where: { id: data.id },
    include: {
      ipAddress: true,
    },
  });

  let disconnectUser = null;

  if (originData?.ipAddress?.userId) {
    disconnectUser = prisma.device.update({
      where: { id: data.id },
      data: {
        ipAddress: {
          update: {
            user: { disconnect: true },
          },
        },
        user: { disconnect: true },
      },
    });
  }

  const deleteDevice = prisma.device.delete({
    where: { id: data.id },
  });

  const deleteHistory = prisma.deviceHistory.deleteMany({
    where: {
      deviceId: data.id,
    },
  });

  const opration = [deleteHistory, disconnectUser, deleteDevice].filter(
    (o) => o !== null
  );

  return await prisma.$transaction(opration as any);
};

// devie history
export const find_device_history = async (data: { id: string | null }) => {
  console.log(data.id);

  const result = await prisma.deviceHistory.findMany({
    where: { deviceId: data.id! },
  });

  return result.map((d) => {
    const res = JSON.parse(d.data);

    return { ...res, updateAt: toTimeString(d.updateAt) };
  });
};

interface CheckAndUpdateIp {
  ipAddressId: string | null;
  userId: string | null;
}

const checkAndUpdateIp = async ({ ipAddressId, userId }: CheckAndUpdateIp) => {
  if (!ipAddressId) {
    return;
  } else {
    const target = await prisma.ipAddress.findUnique({
      where: {
        id: ipAddressId,
      },
      include: {
        device: true,
      },
    });

    if (target?.ip.toLowerCase() === "dhcp" || target?.ip === "无") {
      return;
    } else {
      if (target?.userId || target?.device) {
        throw new Error(ERROR.IP_NOT_ALLOW_ALLOCATE_TWICE);
      }
    }

    return await prisma.ipAddress.update({
      where: {
        id: ipAddressId,
      },
      data: {
        userId,
      },
    });
  }
};

export const delete_selected_device = async (data: { id: string }[]) => {
  return await prisma.device.deleteMany({
    where: {
      id: { in: data.map((id) => id.id) },
    },
  });
};

export const upload_device = async (data: UploadDeviceInput[]) => {
  // return await Promise.all(
  // 	data.map(async (row) => {
  // 		const {
  // 			username,
  // 			department,
  // 			network,
  // 			ipAddress,
  // 			deviceStatus,
  // 			model,
  // 			category,
  // 			...res
  // 		} = row

  // 		console.log(data)

  // 		// check serial number unique
  // 		if (res.serialNumber !== '') {
  // 			const repeatSerialnumber = await prisma.device.findUnique({
  // 				where: { serialNumber: res.serialNumber },
  // 			})
  // 			if (repeatSerialnumber) {
  // 				return {
  // 					success: false,
  // 					data: row,
  // 					message: ERROR.REPEAT.SERIAL_NUMBER_IS_REPEAT,
  // 				}
  // 			}
  // 		}

  // 		// check ipaddress and network provider toghter or not
  // 		let ipAddressId = null

  // 		if (network !== '' && ipAddress !== '') {
  // 			console.log('this', network)

  // 			try {
  // 				const isHaveNetwork = await prisma.network.findUnique({
  // 					where: {
  // 						name: network,
  // 					},
  // 					include: { ips: true },
  // 				})

  // 				ipAddressId =
  // 					isHaveNetwork?.ips.find((ip) => ip.ip === ipAddress)?.id || null
  // 			} catch (err) {
  // 				console.log(err)
  // 			}

  // 			if (!ipAddressId) {
  // 				return {
  // 					success: false,
  // 					data: row,
  // 					message: ERROR.NETWORK_AND_IP_ADDRESS_MUST_BE_EXIST,
  // 				}
  // 			}
  // 		} else if (network === '' && ipAddress === '') {
  // 			ipAddressId = null
  // 		} else {
  // 			return {
  // 				success: false,
  // 				data: row,
  // 				message: ERROR.NETWORK_AND_IP_ADDRESS_MUST_BE_PROVIDER_TOGHTER_OR_NOT,
  // 			}
  // 		}

  // 		console.log('this1')

  // 		const userOpration =
  // 			username &&
  // 			prisma.user.upsert({
  // 				where: { username, department },
  // 				create: { username, department },
  // 				update: {},
  // 			})

  // 		const deviceModelOpration =
  // 			model &&
  // 			prisma.deviceModel.upsert({
  // 				where: { model, category },
  // 				create: { model, category },
  // 				update: {},
  // 			})

  // 		const deviceStatusOpration =
  // 			deviceStatus &&
  // 			prisma.deviceStatus.upsert({
  // 				where: { status: deviceStatus },
  // 				create: { status: deviceStatus },
  // 				update: {},
  // 			})

  // 		const opration = [
  // 			userOpration,
  // 			deviceModelOpration,
  // 			deviceStatusOpration,
  // 		].filter((o) => o)

  // 		const oprationResult = await prisma.$transaction(opration as any)

  // 		const userId = oprationResult[0]?.id || null
  // 		const deviceModelId = oprationResult[1]?.id || null
  // 		const deviceStatusId = oprationResult[2]?.id || null

  // 		const device = await prisma.device.create({
  // 			data: { ...res, userId, deviceModelId, deviceStatusId, ipAddressId },
  // 		})

  // 		const updateUser = await prisma.ipAddress.update({
  // 			where: { id: ipAddressId || undefined },
  // 			data: { userId },
  // 		})

  // 		return device

  // 		// try {
  // 		// 	const createDevice = await prisma.device.create({
  // 		// 		data: {
  // 		// 			...res,
  // 		// 			user: {
  // 		// 				connectOrCreate: {
  // 		// 					where: { username: username },
  // 		// 					create: { username: username! },
  // 		// 				},
  // 		// 			},
  // 		// 			ipAddress: {
  // 		// 				connect: { id: ipAddressId },
  // 		// 			},
  // 		// 			deviceModel: {
  // 		// 				connectOrCreate: {
  // 		// 					where: { model, category },
  // 		// 					create: { model: model!, category: category! },
  // 		// 				},
  // 		// 			},
  // 		// 			deviceStatus: {
  // 		// 				connectOrCreate: {
  // 		// 					where: { status: deviceStatus },
  // 		// 					create: { status: deviceStatus! },
  // 		// 				},
  // 		// 			},
  // 		// 		},
  // 		// 	})

  // 		// 	console.log(createDevice, 'createDevice')

  // 		// 	if (username) {
  // 		//
  // 		// 	}
  // 		// 	return successResult(createDevice)
  // 		// } catch (err) {
  // 		// 	console.log(err)
  // 		// }
  // 	})
  // )

  return await Promise.all(
    data.map(async (d) => {
      try {
        if (d.serialNumber !== "") {
          const repeatSerialnumber = await prisma.device.findUnique({
            where: { serialNumber: d.serialNumber },
          });
          if (repeatSerialnumber) {
            return {
              success: false,
              data: d,
              message: ERROR.REPEAT.SERIAL_NUMBER_IS_REPEAT,
            };
          }
        }

        const userId =
          d.username === "" && d.department === ""
            ? null
            : (await prisma.user
                .upsert({
                  where: { username: d.username!, department: d.department },
                  create: { username: d.username!, department: d.department },
                  update: {},
                })
                .then((res) => res.id)) || null;

        const deviceModelId =
          d.model === "" && d.category === ""
            ? null
            : (await prisma.deviceModel
                .upsert({
                  where: { model: d.model, category: d.category },
                  create: { model: d.model, category: d.category },
                  update: {},
                })
                .then((res) => res.id)) || null;

        const deviceStatusId =
          d.deviceStatus === ""
            ? null
            : (await prisma.deviceStatus
                .upsert({
                  where: { status: d.deviceStatus },
                  create: { status: d.deviceStatus! },
                  update: {},
                })
                .then((res) => res.id)) || null;

        let ipAddressId = null;
        if (d.ipAddress === "" && d.network === "") {
          ipAddressId = null;
        } else if (d.ipAddress !== "" && d.network !== "") {
          ipAddressId = await prisma.ipAddress
            .findFirst({
              where: { ip: d.ipAddress, network: { name: d.network } },
            })
            .then((res) => res?.id);
        } else {
          return {
            success: false,
            data: d,
            message:
              ERROR.NETWORK_AND_IP_ADDRESS_MUST_BE_PROVIDER_TOGHTER_OR_NOT,
          };
        }

        const {
          network,
          ipAddress,
          username,
          department,
          deviceStatus,
          category,
          model,
          ...deviceInput
        } = d;

        const device = await prisma.device.create({
          data: {
            ...deviceInput,
            userId,
            deviceModelId,
            deviceStatusId,
            ipAddressId,
          },
        });

        if (ipAddressId && userId && device) {
          await prisma.ipAddress.update({
            where: { id: ipAddressId },
            data: { userId },
          });
        }

        return successResult(device);
      } catch (err) {
        return {
          success: false,
          data: d,
          message: "Unknow error",
        };
      }
    })
  );
};
