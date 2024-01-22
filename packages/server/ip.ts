import { CIDR_FORMAT_ERROR, IP_V4_FORMAT_ERROR } from '@next-admin/utils'
import * as ip from 'ip'
import { z } from 'zod'

const IpV4Schema = z.string().ip()
const PrefixLenSchema = z.number().min(0).max(32)

const validIpV4 = (ipAddress: string) => {
	if (IpV4Schema.safeParse(ipAddress).success) {
		return ipAddress
	} else {
		throw new Error(IP_V4_FORMAT_ERROR)
	}
}

const validPrefixLen = (prefix: number) => {
	if (PrefixLenSchema.safeParse(prefix).success) {
		return prefix
	} else {
		throw new Error(IP_V4_FORMAT_ERROR)
	}
}

export const generateIpRangeFromCidr = (cidr: string) => {
	// 192.168.0.2-254 or 192.168.0.2-192.168.0.254
	if (cidr.includes('-')) {
		return generateIpRangeFromCidrWithDash(cidr)
	}

	// 192.168.0.2/24 or 192.168.0.2/255.255.255.0
	if (cidr.includes('/')) {
		return generateIpRangeFromCidrWithSlash(cidr)
	}

	return [validIpV4(cidr)]
}

// 192.168.0.2-254 or 192.168.0.2-192.168.0.254
export const generateIpRangeFromCidrWithDash = (cidr: string) => {
	const [first, last] = cidr.split('-')

	const firstIp = validIpV4(first)
	let lastIp: string

	// 192.168.0.2-192.168.0.254
	if (last.includes('.')) {
		lastIp = validIpV4(last)
	} else {
		lastIp = validIpV4(first.slice(0, first.lastIndexOf('.') + 1).concat(last))
	}

	return generateIpRange(firstIp, lastIp)
}

// 192.168.0.2/24 or 192.168.0.2/255.255.255.0
export const generateIpRangeFromCidrWithSlash = (cidr: string) => {
	const [first, last] = cidr.split('/')

	const firstIp = validIpV4(first)

	if (last.includes('.')) {
		const lastIp = validIpV4(last)

		const { firstAddress, lastAddress } = ip.subnet(firstIp, lastIp)

		return generateIpRange(firstAddress, lastAddress)
	} else {
		validPrefixLen(parseInt(last))

		const { firstAddress, lastAddress } = ip.cidrSubnet(cidr)

		return generateIpRange(firstAddress, lastAddress)
	}
}

const generateIpRange = (firstIp: string, lastIp: string, isValid = false) => {
	if (isValid) {
		validIpV4(firstIp)
		validIpV4(lastIp)
	}

	const firstIpLong = ip.toLong(firstIp)

	const len = ip.toLong(lastIp) - firstIpLong + 1

	if (len < 0) {
		throw new Error(CIDR_FORMAT_ERROR)
	}

	return Array.from({ length: len }, (_, index) =>
		ip.fromLong(firstIpLong + index)
	)
}
