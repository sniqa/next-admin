import * as ERROR from '@next-admin/utils/src/error'
import { z } from 'zod'
import { prisma } from '../../db'

// create device Type
const CreateDeviceModelSchema = z.object({
	model: z.string(),
	name: z.string().optional(),
	type: z.string().optional(),
	category: z.string().optional(),
	description: z.string().optional(),
	remark: z.string().optional(),
})

type CreateDeviceModel = z.infer<typeof CreateDeviceModelSchema>

export const create_device_model = async (data: CreateDeviceModel) => {
	if (!CreateDeviceModelSchema.safeParse(data).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	if (await prisma.deviceModel.findUnique({ where: { model: data.model } })) {
		throw new Error(ERROR.REPEAT.DEVICE_MODEL_IS_REPEAT)
	}

	return await prisma.deviceModel.create({ data })
}

// find deviceType
export const find_device_model = async () => {
	return await prisma.deviceModel.findMany()
}

// delete device Type
const DeleteDeviceModelSchema = z.object({
	id: z.string().min(1, '不能为空'),
})

type DeleteDeviceModel = z.infer<typeof DeleteDeviceModelSchema>
export const delete_device_type = async (data: DeleteDeviceModel) => {
	if (!DeleteDeviceModelSchema.safeParse(data).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	return await prisma.deviceModel.delete({ where: { id: data.id } })
}

// update device Type
const UpdateDeviceModelSchema = z.object({
	id: z.string().min(1, '不能为空'),
	model: z.string().optional(),
	name: z.string().optional(),
	type: z.string().optional(),
	category: z.string().optional(),
	description: z.string().optional(),
	remark: z.string().optional(),
})

type UpdateDeviceModel = z.infer<typeof UpdateDeviceModelSchema>

export const update_device_model = async (data: UpdateDeviceModel) => {
	if (!UpdateDeviceModelSchema.safeParse(data).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	const { id, ...res } = data

	return await prisma.deviceModel.update({ where: { id }, data: res })
}
