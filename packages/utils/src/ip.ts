import { z } from 'zod'
const IpV4Schema = z.string().ip()

export const validateCidrs = (cidr: string) => {
	if (cidr.includes('-')) {
		const [first, last] = cidr.split('-')

		const firstIpFormatSuccess = IpV4Schema.safeParse(first).success
		if (!firstIpFormatSuccess) {
			return false
		}

		// 192.168.0.2-192.168.0.254
		if (last.includes('.')) {
			return IpV4Schema.safeParse(last).success
		} else {
			return IpV4Schema.safeParse(
				first.slice(0, first.lastIndexOf('.') + 1).concat(last)
			).success
		}
	}

	// 192.168.0.2/24 or 192.168.0.2/255.255.255.0
	if (cidr.includes('/')) {
		const [first, last] = cidr.split('/')

		const firstIpFormatSuccess = IpV4Schema.safeParse(first).success
		if (!firstIpFormatSuccess) {
			return false
		}

		if (last.includes('.')) {
			return IpV4Schema.safeParse(last).success
		} else {
			try {
				let number = parseInt(last)

				if (number >= 0 && number <= 32) {
					return true
				} else {
					return false
				}
			} catch {
				return false
			}
		}
	}

	return IpV4Schema.safeParse(cidr).success
}
