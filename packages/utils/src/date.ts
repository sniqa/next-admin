import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

export const now = () => dayjs().format('YYYY/MM/DD HH:mm:ss')

export const toTimeString = (
	date?: string | number | Date | dayjs.Dayjs | null | undefined
) => dayjs(date).format('YYYY/MM/DD HH:mm:ss')
