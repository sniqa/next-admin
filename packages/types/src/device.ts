import type { Common, Id, Timestring } from './common'
import type { IpAddress } from './network'
import type { User } from './user'

export type DeviceCreateInput = Common & {
	serialNumber: string
	productNumber?: string
	name?: string
	location?: string
	status?: number
	mac?: string
	diskSerialNumber?: string

	deviceStatus?: DeviceStatus
	deviceStatusId: string | null

	user?: User
	userId: string | null

	deviceModel?: DeviceModel
	deviceModelId: string | null

	ipAddress?: IpAddress
	ipAddressId: string | null
}

export type Device = Id & Timestring & DeviceCreateInput

export type DeviceModelCreateInput = Common & {
	model: string
	name?: string
	type?: string
	category?: string
}

export type DeviceModel = Id & Timestring & DeviceModelCreateInput

// device status
export type DeviceStatusCreateInput = Common & {
	status: string
}

export type DeviceStatus = Id & Timestring & DeviceStatusCreateInput

export type DeviceHistory = Id &
	Timestring &
	Common & {
		deviceId: string | null
		data: string
	}
