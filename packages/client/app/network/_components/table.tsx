'use client'

import ComfirmButton from '@/components/custom/confirmButton'
import {
	CommonConstant,
	DeviceConstant,
	NetowrkConstant,
	UserConstant,
} from '@/lib/constant'
import socket from '@/lib/socket'
import { ActionIcon, Button, Select } from '@mantine/core'
import type { IpAddress } from '@next-admin/types'

import CreateNetworkDialog from '@/components/dialog/createNetworkDialog'
import EditIpAddressDialog from '@/components/dialog/editIpAddressDialog'
import { networkSelectAtom, useAtom } from '@/lib/jotai'
import { useDisclosure } from '@mantine/hooks'
import { IconEdit } from '@tabler/icons-react'
import {
	MRT_ColumnDef,
	MantineReactTable,
	useMantineReactTable,
} from 'mantine-react-table'
import 'mantine-react-table/styles.css'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const columns: MRT_ColumnDef<IpAddress>[] = [
	{ accessorKey: 'ip', header: NetowrkConstant.IP_ADDRESS },
	{ accessorKey: 'network.name', header: NetowrkConstant.NETWORK_NAME },
	{ accessorKey: 'user.username', header: UserConstant.USER },
	{ accessorKey: 'device.serialNumber', header: DeviceConstant.SERIAL_NUMBER },
	{ accessorKey: 'device.deviceModel.model', header: '设备型号' },
	{ accessorKey: 'remark', header: CommonConstant.REMARK },
]

const Table = () => {
	const router = useRouter()

	const [opened, { open, close }] = useDisclosure(false)

	const [ipAddressDialogOpened, ipAddressDialogHandle] = useDisclosure(false)

	const [networkSelectData] = useAtom(networkSelectAtom)

	const [currentSelectValue, setCurrentSelectValue] = useState<string | null>(
		''
	)

	const tableData = useMemo(
		() =>
			networkSelectData.find((d) => d.value === currentSelectValue)?.ips ||
			setCurrentSelectValue(networkSelectData[0]?.value) ||
			[],
		[currentSelectValue, networkSelectData]
	)

	// ip modal

	const [currentIp, setCurrentIp] = useState<IpAddress | null>(null)

	const handleOnEdit = (data: IpAddress) => {
		return () => {
			ipAddressDialogHandle.open()
			setCurrentIp(data)
		}
	}

	// table options
	const table = useMantineReactTable({
		columns,
		data: tableData || [],
		enableRowActions: true,
		enableStickyHeader: true,
		initialState: { density: 'xs' },
		mantineTableContainerProps: {
			mah: 'calc(100vh - 12rem)',
		},
		renderTopToolbarCustomActions: () => (
			<div className="flex gap-4">
				<Button onClick={open}>{NetowrkConstant.CREATE_NETWORK}</Button>
				<Select
					data={networkSelectData}
					allowDeselect={false}
					value={currentSelectValue}
					placeholder={NetowrkConstant.SELECT_NETWORK}
					onChange={(val) => {
						val && setCurrentSelectValue(val)
					}}
				/>

				{currentSelectValue && (
					<ComfirmButton
						color="gray"
						message={`${CommonConstant.CONFIRM}${
							NetowrkConstant.DELETE_NETWORK
						}: ${
							networkSelectData.find((d) => d.value === currentSelectValue)
								?.label
						}`}
						onConfirm={deleteNetwork}
					>
						{NetowrkConstant.DELETE_NETWORK}
					</ComfirmButton>
				)}
			</div>
		),

		// ip edit
		renderRowActions: ({ row }) => (
			<div className="flex gap-2">
				<ActionIcon variant="subtle" onClick={handleOnEdit(row.original)}>
					<IconEdit />
				</ActionIcon>
			</div>
		),
	})

	// get data
	useEffect(() => {
		socket.emit('get_data', ['find_network', 'find_user'])
	}, [])

	// delete data
	const deleteNetwork = async () => {
		currentSelectValue &&
			socket.emit('delete_network', { id: currentSelectValue }, (response) => {
				if (response.success) {
					toast(CommonConstant.DELETE_SUCCESS)
					setCurrentSelectValue(null)
				} else {
					toast(`${CommonConstant.DELETE_FAILD}: ${response.message}`)
				}
			})
	}

	return (
		<>
			<MantineReactTable table={table} />

			<CreateNetworkDialog opened={opened} onClose={close} />

			<EditIpAddressDialog
				opened={ipAddressDialogOpened}
				onClose={ipAddressDialogHandle.close}
				data={currentIp}
			/>
		</>
	)
}

export default Table
