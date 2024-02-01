'use client'

import { columns } from '@/app/device/_components/util'
import { UserConstant } from '@/lib/constant'
import { deviceAtom, useAtom } from '@/lib/jotai'
import socket from '@/lib/socket'
import { Drawer, DrawerProps } from '@mantine/core'
import { User } from '@next-admin/types'
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table'
import { useEffect, useMemo } from 'react'

export type ShowUserDeviceTableProps = DrawerProps & {
	user: User | null
}

const ShowUserDeviceTable = ({ user, ...props }: ShowUserDeviceTableProps) => {
	const [deviceData, setDeviceData] = useAtom(deviceAtom)

	const userDevices = useMemo(
		() =>
			user ? deviceData.filter((device) => device.userId === user.id) : [],
		[deviceData, user]
	)

	const table = useMantineReactTable({
		columns,
		data: userDevices,
		enableStickyHeader: true,
		enableFilters: true,
		enablePagination: false,
		enableRowVirtualization: true,
		initialState: { density: 'xs' },
		mantineTableContainerProps: { mah: 'calc(100vh - 12rem)' },
	})

	//   get data
	useEffect(() => {
		deviceData.length === 0 && socket.emit('get_data', ['find_device'])
	}, [])

	return (
		<Drawer
			{...props}
			position="bottom"
			size={'90%'}
			title={`${UserConstant.USER}: ${user?.username}`}
		>
			<MantineReactTable table={table} />
		</Drawer>
	)
}

export default ShowUserDeviceTable
