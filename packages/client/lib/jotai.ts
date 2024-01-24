import type {
	Device,
	DeviceModel,
	DeviceStatus,
	IpAddress,
	Network,
	Result,
	UploadDeviceInput,
	User,
} from '@next-admin/types'

import { atom, useAtom } from 'jotai'

export { useAtom }

//
export const usersAtom = atom<User[]>([])

export const usersSelectAtom = atom((get) =>
	get(usersAtom).map((user) => ({
		value: user.id,
		label: user.username,
	}))
)

// network
export const networksAtom = atom<Network[]>([])

export const networkSelectAtom = atom(
	(get) =>
		get(networksAtom).map((network) => ({
			value: network.id,
			label: network.name,
			ips: network.ips,
		})),
	(get, set, newValue: IpAddress) => {
		const networks = get(networksAtom)

		const g = (network: Network, ipAddress: IpAddress) => {
			return network.ips.map((ip) => (ip.id === ipAddress.id ? ipAddress : ip))
		}
		const newNetworks = networks.map((network) =>
			network.id === newValue.networkId
				? { ...network, ips: g(network, newValue) }
				: network
		)

		const newNetworkSelectData = newNetworks.map((network) => ({
			value: network.id,
			label: network.name,
			ips: network.ips,
		}))

		set(networksAtom, newNetworks)

		return newNetworkSelectData
	}
)

// ip address
export const ipAddressAtom = atom<IpAddress[]>([])

// device
export const deviceAtom = atom<Device[]>([])

// device model
export const deviceModelAtom = atom<DeviceModel[]>([])

export const deviceModelSelectAtom = atom((get) =>
	get(deviceModelAtom).map((model) => ({
		value: model.id,
		label: model.model,
	}))
)

// device status
export const deviceStatusAtom = atom<DeviceStatus[]>([])

export const deviceStatusSelectAtom = atom((get) =>
	get(deviceStatusAtom).map((status) => ({
		value: status.id,
		label: status.status,
	}))
)

export const uploadFaildResultAtom = atom<Result<UploadDeviceInput>[]>([])
