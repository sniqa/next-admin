export interface Result<T = any> {
	success: boolean
	data?: T
	message?: string
	timestring: string
}
