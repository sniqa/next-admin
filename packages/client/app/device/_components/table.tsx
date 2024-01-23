'use client'

import ConfirmButton from '@/components/custom/confirmButton'
import DeviceModal from '@/components/dialog/createDeviceDialog'
import DeviceDropzonDialog from '@/components/dialog/deviceDropzoneDialog'
import EditDeviceDialog from '@/components/dialog/editDeviceDialog'
import { CommonConstant, DeviceConstant } from '@/lib/constant'
import { exportExcelData } from '@/lib/excel'
import { deviceAtom, useAtom } from '@/lib/jotai'
import socket from '@/lib/socket'
import { ActionIcon, Button, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { Device } from '@next-admin/types'
import { IconEdit, IconHistory, IconTrash } from '@tabler/icons-react'
import {
	MRT_Row,
	MantineReactTable,
	useMantineReactTable,
} from 'mantine-react-table'
import 'mantine-react-table/styles.css'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DeviceHistoryTable from './historyTable'
import { columns, exportDeviceExcelColumns } from './util'

const DeviceTable = () => {
	const [devices, _] = useAtom(deviceAtom)

	const [opened, { open, close }] = useDisclosure(false)

	const [opened1, handle1] = useDisclosure(false)

	const [historyOpened, historyHandle] = useDisclosure(false)

	const [importOpened, importHandle] = useDisclosure(false)

	const [current, setCurrent] = useState<Device | null>(null)

	const [currentHistotyOfDevice, setHistoryOfDevice] = useState<string | null>(
		null
	)

	const handleEditOnClick = (values?: Device) => () => {
		if (values) {
			handle1.open()

			setCurrent(values)
		}
	}

	const handleOnDelete = (values: Device) => () => {
		socket.emit('delete_device', values, (response) => {
			if (response.success) {
				toast(CommonConstant.DELETE_SUCCESS)
			} else {
				toast(`${CommonConstant.DELETE_FAILD}: ${response.message}`)
			}
		})
	}

	const handleOnHistoryClick = (id: string | null) => () => {
		historyHandle.open()
		setHistoryOfDevice(id)
	}

	const handleOnExport = (rows: MRT_Row<Device>[]) => () => {
		exportExcelData(
			exportDeviceExcelColumns,
			rows.map((row) => ({
				location: row.original.location,
				serialNumber: row.original.serialNumber,
				productNumber: row.original.productNumber,
				username: row.original.user?.username,
				network: row.original.ipAddress?.network?.name,
				ipAddress: row.original.ipAddress?.ip,
				deviceStatus: row.original.deviceStatus?.status,
				mac: row.original.mac,
				diskSerialNumber: row.original.diskSerialNumber,
				category: row.original.deviceModel?.category,
				model: row.original.deviceModel?.model,
				remark: row.original.remark,
			}))
		)
	}
	const table = useMantineReactTable({
		columns,
		data: devices,
		enableRowActions: true,
		enableStickyHeader: true,
		enableFilters: true,
		enableSelectAll: true,
		enableRowSelection: true,
		positionToolbarAlertBanner: 'bottom',
		initialState: { density: 'xs' },
		mantineTableContainerProps: { mah: 'calc(100vh - 12rem)' },
		renderTopToolbarCustomActions: ({ table }) => (
			<div className="flex gap-4">
				<Button onClick={open}>{DeviceConstant.CREATE_DEVICE}</Button>
				<Button
					onClick={handleOnExport(table.getSelectedRowModel().rows)}
					disabled={table.getSelectedRowModel().rows.length <= 0}
				>
					{CommonConstant.EXPORT_SELECTED_TO_XLSX}
				</Button>
				<Button onClick={importHandle.open}>
					{CommonConstant.IMPORT_TO_TABLE}
				</Button>
			</div>
		),
		renderRowActions: ({ row }) => (
			<div className="flex gap-2">
				<ActionIcon onClick={handleEditOnClick(row.original)} variant="subtle">
					<Tooltip label={CommonConstant.EDIT}>
						<IconEdit />
					</Tooltip>
				</ActionIcon>

				{/* delete */}
				<ConfirmButton
					type="icon"
					message={`${CommonConstant.DELETE}: ${row.original?.serialNumber} ?`}
					onConfirm={handleOnDelete(row.original)}
				>
					<Tooltip label={CommonConstant.DELETE}>
						<IconTrash />
					</Tooltip>
				</ConfirmButton>

				{/* history */}
				<ActionIcon
					variant="subtle"
					onClick={handleOnHistoryClick(row.original.id)}
				>
					<Tooltip label={CommonConstant.UPDATE_HISTORY}>
						<IconHistory />
					</Tooltip>
				</ActionIcon>
			</div>
		),
	})

	useEffect(() => {
		socket.emit('get_data', ['find_device'])
	}, [])

	return (
		<>
			<MantineReactTable table={table} />

			<DeviceModal opened={opened} onClose={close} />

			<EditDeviceDialog
				opened={opened1}
				onClose={handle1.close}
				data={current}
			/>

			<DeviceHistoryTable
				opened={historyOpened}
				onClose={historyHandle.close}
				deviceId={currentHistotyOfDevice}
			/>

			<DeviceDropzonDialog opened={importOpened} onClose={importHandle.close} />
		</>
	)
}

export default DeviceTable
