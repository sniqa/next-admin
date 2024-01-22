import {
	CommonConstant,
	DeviceConstant,
	DeviceModalConstant,
	NetowrkConstant,
	UserConstant,
} from '@/lib/constant'
import { Device } from '@next-admin/types'
import { MRT_ColumnDef } from 'mantine-react-table'

export const columns: MRT_ColumnDef<Device>[] = [
	{ accessorKey: 'location', header: DeviceConstant.LOCATION },
	{
		accessorKey: 'serialNumber',
		header: DeviceConstant.SERIAL_NUMBER,
	},
	{
		accessorKey: 'productNumber',
		header: DeviceConstant.PRODUCT_NUMBER,
	},

	{ accessorKey: 'user.username', header: UserConstant.USER },
	{
		accessorKey: 'ipAddress.network.name',
		header: NetowrkConstant.NETWORK_NAME,
	},
	{
		accessorKey: 'ipAddress.ip',
		header: NetowrkConstant.IP_ADDRESS,
	},
	{
		accessorKey: 'deviceStatus.status',
		header: DeviceConstant.STATUS,
	},

	{ accessorKey: 'mac', header: DeviceConstant.MAC },
	{
		accessorKey: 'diskSerialNumber',
		header: DeviceConstant.DISK_SERIAL_NUMBER,
	},
	{
		accessorKey: 'deviceModel.category',
		header: DeviceModalConstant.CATEGORY,
	},
	{
		accessorKey: 'deviceModel.model',
		header: DeviceModalConstant.MODEL,
	},
	{ accessorKey: 'remark', header: CommonConstant.REMARK },
]
