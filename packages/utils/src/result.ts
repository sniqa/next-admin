import type { Result } from '@next-admin/types'
import { now } from './date'

export const successResult = <T,>(data: T): Result<T> => ({
	success: true,
	data,
	timestring: now(),
})

export const faildResult = (message: string): Result => ({
	success: false,
	message,
	timestring: now(),
})
