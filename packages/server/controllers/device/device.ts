import { toTimeString } from '@next-admin/utils'
import * as ERROR from '@next-admin/utils/src/error'
import { z } from 'zod'
import { prisma, turnEmptyStringtoNull } from '../../db'

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
})
type CreateDevice = z.infer<typeof CreateDeviceSchema>
export const create_device = async (requestData: CreateDevice) => {
	if (!CreateDeviceSchema.safeParse(requestData).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	const data = turnEmptyStringtoNull(
		requestData,
		'userId',
		'deviceStatusId',
		'deviceModelId',
		'ipAddressId'
	)

	if (
		await prisma.device.findUnique({
			where: { serialNumber: data.serialNumber },
		})
	) {
		throw new Error(ERROR.REPEAT.SERIAL_NUMBER_IS_REPEAT)
	}

	if (data.ipAddressId) {
		await checkAndUpdateIp({
			ipAddressId: data.ipAddressId,
			userId: data.userId,
		})
	}

	return await prisma.device.create({ data })
}

// find
export const find_device = async () => {
	return await prisma.device.findMany({
		include: {
			ipAddress: { include: { network: true } },
			deviceModel: true,
			user: true,
			deviceStatus: true,
		},
	})
}

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
})

type UpdateDevice = z.infer<typeof UpdateDeviceSchema>

export const update_device = async (requestData: UpdateDevice) => {
	if (!UpdateDeviceSchema.safeParse(requestData).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	const data = turnEmptyStringtoNull(
		requestData,
		'userId',
		'deviceStatusId',
		'deviceModelId',
		'ipAddressId'
	)

	const { id, ...res } = data

	const originData = await prisma.device.findUnique({
		where: { id },
		include: {
			deviceStatus: true,
			user: true,
			deviceModel: true,
			ipAddress: { include: { network: true } },
		},
	})

	if (originData === null) {
		throw new Error(ERROR.NOT_HAVE_THIS_DEVICE)
	}

	const saveToHistory = prisma.deviceHistory.create({
		data: {
			data: JSON.stringify(originData),
			deviceId: originData?.id!,
		},
	})

	console.log(originData.ipAddressId !== data.ipAddressId)

	// update ip
	let updateOriginIpUser = null
	if (originData.ipAddressId !== data.ipAddressId) {
		if (originData.ipAddressId !== null) {
			updateOriginIpUser = prisma.ipAddress.update({
				where: { id: originData.ipAddressId },
				data: {
					user: { disconnect: true },
					device: { disconnect: true },
				},
			})
		}
	}

	let updateIpUser = null
	if (data.ipAddressId) {
		updateIpUser = prisma.ipAddress.update({
			where: { id: data.ipAddressId },
			data: {
				userId: data.userId,
			},
		})
	}

	const updateDevice = prisma.device.update({
		where: { id },
		data: { ...res },
	})

	const opration = [
		saveToHistory,
		updateDevice,
		updateOriginIpUser,
		updateIpUser,
	].filter((o) => o !== null)

	return prisma.$transaction(opration as [])
}

// delete device
const DeleteSchema = z.object({
	id: z.string().min(1, 'ID不能为空'),
})

type DeleteDeviceType = z.infer<typeof DeleteSchema>
export const delete_device = async (data: DeleteDeviceType) => {
	if (!DeleteSchema.safeParse(data).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	const originData = await prisma.device.findUnique({
		where: { id: data.id },
		include: {
			ipAddress: true,
		},
	})

	let disconnectUser = null

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
		})
	}

	const deleteDevice = prisma.device.delete({
		where: { id: data.id },
	})

	const deleteHistory = prisma.deviceHistory.deleteMany({
		where: {
			deviceId: data.id,
		},
	})

	const opration = [deleteHistory, disconnectUser, deleteDevice].filter(
		(o) => o !== null
	)

	return await prisma.$transaction(opration as any)
}

// devie history
export const find_device_history = async (data: { id: string | null }) => {
	console.log(data.id)

	const result = await prisma.deviceHistory.findMany({
		where: { deviceId: data.id! },
	})

	return result.map((d) => {
		const res = JSON.parse(d.data)

		return { ...res, updateAt: toTimeString(d.updateAt) }
	})
}

interface CheckAndUpdateIp {
	ipAddressId: string | null
	userId: string | null
}

const checkAndUpdateIp = async ({ ipAddressId, userId }: CheckAndUpdateIp) => {
	if (!ipAddressId) {
		return
	} else {
		const target = await prisma.ipAddress.findUnique({
			where: {
				id: ipAddressId,
			},
			include: {
				device: true,
			},
		})

		if (target?.ip.toLowerCase() === 'dhcp' || target?.ip === '无') {
			return
		} else {
			if (target?.userId || target?.device) {
				throw new Error(ERROR.IP_NOT_ALLOW_ALLOCATE_TWICE)
			}
		}

		return await prisma.ipAddress.update({
			where: {
				id: ipAddressId,
			},
			data: {
				userId,
			},
		})
	}
}
