'use client'

import {
	deviceAtom,
	deviceModelAtom,
	deviceStatusAtom,
	networksAtom,
	useAtom,
	usersAtom,
} from '@/lib/jotai'
import type {
	ClientToServerEvents,
	Device,
	DeviceModel,
	DeviceStatus,
	Network,
	Result,
	ServerToClientEvents,
	User,
} from '@next-admin/types'

import { Input, MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import { ModalsProvider } from '@mantine/modals'
import { ReactNode, useEffect } from 'react'
import { Manager, Socket } from 'socket.io-client'

const hostname = window.location.hostname
const protocol = window.location.protocol
const port = 3001

const url = `${protocol}//${hostname}:${port}`

const manager = new Manager(url)

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
	manager.socket('/')

const Provider = ({ children }: { children: ReactNode }) => {
	const theme = createTheme({
		components: {
			InputWrapper: Input.Wrapper.extend({
				defaultProps: {
					inputWrapperOrder: ['label', 'input', 'description', 'error'],
				},
			}),
		},
	})

	const [, setUsers] = useAtom(usersAtom)
	const [, setNetworks] = useAtom(networksAtom)
	const [, setDeviceModels] = useAtom(deviceModelAtom)
	const [, setDevices] = useAtom(deviceAtom)
	const [, setDeviceStatus] = useAtom(deviceStatusAtom)

	useEffect(() => {
		const onConnect = () => {
			console.log('connect')
		}

		const onDisconnect = () => {
			console.log('disconnect')
		}

		const onFindUser = (response: Result<User[]>) => {
			const { success, data } = response
			success && data && setUsers(data)
		}

		const onFindNetwork = (response: Result<Network[]>) => {
			const { success, data } = response
			success && data && setNetworks(data)
		}

		const onFindDeviceModels = (response: Result<DeviceModel[]>) => {
			const { success, data } = response
			success && data && setDeviceModels(data)
		}

		const onFindDevices = (response: Result<Device[]>) => {
			const { success, data } = response
			success && data && setDevices(data)
		}

		const onFindDeviceStatus = (response: Result<DeviceStatus[]>) => {
			const { success, data } = response
			success && data && setDeviceStatus(data)
		}

		socket.on('find_user', onFindUser)
		socket.on('find_network', onFindNetwork)
		socket.on('find_device', onFindDevices)
		socket.on('find_device_model', onFindDeviceModels)
		socket.on('find_device_status', onFindDeviceStatus)

		socket.on('connect', onConnect)
		socket.on('disconnect', onDisconnect)

		return () => {
			socket.off('connect', onConnect)
			socket.off('disconnect', onDisconnect)

			socket.off('find_user', onFindUser)
			socket.off('find_network', onFindNetwork)
			socket.off('find_device_model', onFindDeviceModels)
			socket.off('find_device', onFindDevices)
			socket.off('find_device_status', onFindDeviceStatus)
		}
	}, [])

	return (
		<MantineProvider theme={theme}>
			<ModalsProvider>{children}</ModalsProvider>
		</MantineProvider>
	)
}

export default Provider