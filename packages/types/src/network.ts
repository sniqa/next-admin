import type { Common, Id, Timestring } from './common'
import type { Device } from './device'
import type { User } from './user'

export type NetworkCreateInput = Common & {
	name: string
	cidr?: string[]
}

export type Network = Timestring &
	Id & {
		name: string
		cidr?: string[]
		ips: IpAddress[]
	}

export type IpAddress = Timestring &
	Common &
	Id & {
		ip: string
		network?: Network
		networkId: string | null
		status?: number
		userId: string | null
		user?: User
		device?: Device
	}
