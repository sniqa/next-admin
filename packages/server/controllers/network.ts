import type { IpAddress } from '@next-admin/types'
import * as ERROR from '@next-admin/utils/src/error'
import { z } from 'zod'
import { prisma, type Prisma } from '../db'
import { generateIpRangeFromCidr } from '../ip'

const NONE = '无'

// create
const CreateNetworkSchema = z.object({
	name: z.string().min(1, '不能为空'),
	cidr: z.array(z.string()).optional(),
	description: z.string().optional(),
	remark: z.string().optional(),
})

export type CreateNetworkType = z.infer<typeof CreateNetworkSchema>

export type Network = Prisma.NetworkCreateInput

export const create_network = async (data: CreateNetworkType) => {
	if (!CreateNetworkSchema.safeParse(data).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	if (await prisma.network.findUnique({ where: { name: data.name } })) {
		throw new Error(ERROR.REPEAT.NETWORK_IS_REPEAT)
	}

	console.log(data)

	let cidr = [{ ip: NONE }]

	if (data.cidr) {
		if (
			data.cidr.length === 1 &&
			data.cidr[0].trim().toLowerCase() === 'dhcp'
		) {
			cidr = [{ ip: 'DHCP' }]
		} else if (data.cidr.length > 0) {
			cidr = data?.cidr?.flatMap((cidr) =>
				generateIpRangeFromCidr(cidr).map((ip) => ({
					ip,
				}))
			)
		}
	}

	console.log(cidr)

	const network = await prisma.network.create({
		data: {
			...data,
			ips: {
				create: cidr,
			},
		},
	})

	return network
}

// delete
const DeleteNetworkSchema = z.object({
	id: z.string().min(1, '不能为空'),
})

type DeleteNetworkType = z.infer<typeof DeleteNetworkSchema>
export const delete_network = async (data: DeleteNetworkType) => {
	if (!DeleteNetworkSchema.safeParse(data).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	return await prisma.network.delete({ where: { id: data.id } })
}

// update
const UpdateNetworkSchema = z.object({
	id: z.string().min(1, '不能为空'),
	name: z.string().optional(),
	description: z.string().optional(),
	remark: z.string().optional(),
})

type UpdateNetworkType = z.infer<typeof UpdateNetworkSchema>

export const update_network = async (data: UpdateNetworkType) => {
	if (!UpdateNetworkSchema.safeParse(data).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	const { id, ...res } = data

	return await prisma.network.update({
		where: { id },
		data: res,
	})
}

// find
export const find_network = async () => {
	return await prisma.network.findMany({
		include: {
			ips: {
				include: {
					network: true,
					user: true,
					device: {
						include: { deviceModel: true },
					},
				},
			},
		},
	})
}

// update ip address
const UpdateIpSchema = z.object({
	id: z.string().min(1, '不能为空'),
	status: z.number().optional(),
	userId: z.string().or(z.null()),
	description: z.string().optional(),
	remark: z.string().optional(),
})

type UpdateIp = z.infer<typeof UpdateIpSchema>
export const update_ip_address = async (data: IpAddress) => {
	if (!UpdateIpSchema.safeParse(data).success) {
		throw new Error(ERROR.ARGMENTS_ERROR)
	}

	const { id, networkId, network, device, createAt, updateAt, ...res } = data

	if (device) {
		await prisma.ipAddress.update({
			where: { id },
			data: {
				device: {
					disconnect: true,
				},
			},
		})
	}

	return await prisma.ipAddress.update({
		where: { id },
		data: {
			userId: data.userId || null,
			remark: data.remark,
		},
		include: {
			network: true,
			user: true,
			device: {
				include: { deviceModel: true },
			},
		},
	})
}

export const find_ip_address = async () => {
	return await prisma.ipAddress.findMany({
		include: {
			network: true,
			user: true,
			device: {
				include: { deviceModel: true },
			},
		},
	})
}
