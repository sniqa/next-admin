'use client'

import socket from '@/lib/socket'
import { useEffect } from 'react'
import DeviceTable from './_components/table'

const DevicePage = () => {
	console.log('devicePage')

	useEffect(() => {
		socket.emit('get_data', ['find_device'])
	}, [])

	return (
		<div className="p-2">
			<DeviceTable />
		</div>
	)
}

export default DevicePage
