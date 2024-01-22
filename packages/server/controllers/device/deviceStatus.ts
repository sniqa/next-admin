import type { DeviceStatusCreateInput } from '@next-admin/types'
import * as ERROR from '@next-admin/utils/src/error'
import { z } from 'zod'
import { prisma } from '../../db'

const CreateDeviceStatusSchema = z.object({
	status: z.string(),

	description: z.string().optional(),
	remark: z.string().optional(),
})

export const create_device_status = async (data: DeviceStatusCreateInput) => {
	if (!CreateDeviceStatusSchema.safeParse(data).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}
	if (
		await prisma.deviceStatus.findUnique({
			where: { status: data.status },
		})
	) {
		throw new Error(ERROR.REPEAT.DEVICE_STATUS_IS_REPEAT)
	}

	return await prisma.deviceStatus.create({ data })
}

export const delete_device_status = async () => {}

export const find_device_status = async () => {
	return await prisma.deviceStatus.findMany()
}
