import { Prisma, PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
export { type Prisma }

export const turnEmptyStringtoNull = <T extends Record<string, any>>(
	data: T,
	...keys: string[]
) => {
	if (typeof data === 'object') {
		return Object.fromEntries(
			Object.entries(data).map(([key, value]) => {
				if (keys.includes(key)) {
					return [key, value === '' ? null : value]
				}

				return [key, value]
			})
		) as T
	}

	throw new Error('Not a Object')
}
