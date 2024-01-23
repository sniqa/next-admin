'use client'

import { CommonConstant } from '@/lib/constant'
import socket from '@/lib/socket'
import { Drawer, DrawerProps } from '@mantine/core'
import { Device } from '@next-admin/types'
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table'
import { useEffect, useState } from 'react'
import { columns } from './util'

export type DeviceHistoryTableProps = DrawerProps & {
	deviceId: string | null
}

const DeviceHistoryTable = ({
	deviceId,
	...props
}: DeviceHistoryTableProps) => {
	const [deviceData, setDeviceData] = useState<Device[]>([])

	const table = useMantineReactTable({
		columns: [
			{ accessorKey: 'updateAt', header: CommonConstant.LAST_UPDATE_TIME },
			...columns,
		],
		data: deviceData,
		enableStickyHeader: true,
		enableFilters: true,
		initialState: { density: 'xs' },
		mantineTableContainerProps: { mah: 'calc(100vh - 12rem)' },
	})

	// get data
	useEffect(() => {
		if (deviceId !== null) {
			socket.emit('find_device_history', { id: deviceId }, (response) => {
				if (response.success) {
					console.log(response.data, 'data')

					setDeviceData(response?.data || [])
					// toast(CommonConstant.DELETE_SUCCESS)
				} else {
					// toast(`${CommonConstant.DELETE_FAILD}: ${response.message}`)
				}
			})
		}
	}, [deviceId])

	return (
		<Drawer {...props} position="bottom" size={'90%'}>
			<MantineReactTable table={table} />
		</Drawer>
	)
}

export default DeviceHistoryTable
