'use client'

import {
	CommonConstant,
	DeviceConstant,
	DeviceModalConstant,
	NetowrkConstant,
	UserConstant,
} from '@/lib/constant'
import { uploadFaildResultAtom, useAtom } from '@/lib/jotai'
import socket from '@/lib/socket'
import {
	ActionIcon,
	Anchor,
	Button,
	Drawer,
	Modal,
	ModalProps,
	Text,
	rem,
} from '@mantine/core'
import { Dropzone, FileWithPath, MS_EXCEL_MIME_TYPE } from '@mantine/dropzone'
import '@mantine/dropzone/styles.css'
import { Result, UploadDeviceInput } from '@next-admin/types'
import {
	IconFileTypeXls,
	IconTrash,
	IconUpload,
	IconX,
} from '@tabler/icons-react'
import {
	MRT_ColumnDef,
	MantineReactTable,
	useMantineReactTable,
} from 'mantine-react-table'
import { FormEvent, useState } from 'react'
import readXlsxFile, { Row } from 'read-excel-file'
import { toast } from 'sonner'

interface DropzoneDialogProps extends ModalProps {}

const DeviceDropzoneDialog = ({ ...props }: DropzoneDialogProps) => {
	const [uploadResult, setUploadResult] = useAtom(uploadFaildResultAtom)
	const [errorData, setErrorData] = useState<Result<UploadDeviceInput>[]>([])

	const [loading, setLoading] = useState(false)

	const [file, setFile] = useState<File | null>(null)

	const onDrop = (files: FileWithPath[]) => {
		setFile(files[0])
	}

	const onCancel = () => {
		setFile(null)
		setLoading(false)
		props.onClose()
	}

	// const onUploadFaildClick = (data: Result<UploadDeviceInput>[]) => () => {
	// 	setErrorData(data)
	// 	setOpened(true)
	// }

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault()
		if (!file) {
			return toast(CommonConstant.NOT_ALLOW_EMPTY_FILE)
		}
		setLoading(true)

		const result = await readXlsxFile(file)

		const header = result.shift()

		if (!header || !checkTableHeader(header)) {
			toast(CommonConstant.INVALID_FILE)
			return setLoading(false)
		}

		console.log(result, 'result')

		const data = getDataFromDeviceImportTableRows(result)

		socket.emit('upload_device', data, (response) => {
			setLoading(false)

			const errResult = response.filter((data) => !data.success)

			console.log(errResult)

			if (errResult.length === 0) {
				toast(
					`${CommonConstant.SUCCESS_IMPORT_ITEM_TOTAL}: ${errResult.length}, ${CommonConstant.FAILD_IMPORT_ITEM_TOTAL}: 0`
				)
			} else {
				toast(
					<div className="flex flex-col gap-1">
						<span>
							{`${CommonConstant.SUCCESS_IMPORT_ITEM_TOTAL}: ${
								response.length - errResult.length
							}, ${CommonConstant.FAILD_IMPORT_ITEM_TOTAL}: ${
								errResult.length
							}`}
						</span>

						<Anchor
							className="text-sm"
							onClick={() => setUploadResult(errResult as any)}
						>
							{CommonConstant.SHOW_FAILD_IMPORT_ITEM}
						</Anchor>
					</div>
				)
			}
		})
	}

	return (
		<>
			<Modal
				{...props}
				onClose={onCancel}
				centered
				title={DeviceConstant.IMPORT_DEVICE_TO_TABLE}
			>
				<form className="flex flex-col" onSubmit={onSubmit}>
					<div className="mb-4">
						<Anchor href="/DeviceTableTemplate.xlsx">
							{DeviceConstant.DOWNLOAD_IMPORT_DEVICE_TEMPLATE}
						</Anchor>
					</div>

					<Dropzone
						loading={loading}
						onDrop={onDrop}
						onReject={(files) => console.log('rejected files', files)}
						// maxSize={5 * 1024 ** 2}
						accept={MS_EXCEL_MIME_TYPE}
						maxFiles={1}
						multiple={false}
						{...props}
					>
						<div className="flex flex-col justify-center items-center">
							<Dropzone.Accept>
								<IconUpload
									style={{
										width: rem(52),
										height: rem(52),
										color: 'var(--mantine-color-blue-6)',
									}}
									stroke={1.5}
								/>
							</Dropzone.Accept>
							<Dropzone.Reject>
								<IconX
									style={{
										width: rem(52),
										height: rem(52),
										color: 'var(--mantine-color-red-6)',
									}}
									stroke={1.5}
								/>
							</Dropzone.Reject>
							<Dropzone.Idle>
								<IconFileTypeXls
									style={{
										width: rem(52),
										height: rem(52),
										color: 'var(--mantine-color-dimmed)',
									}}
									stroke={1.5}
								/>
							</Dropzone.Idle>

							<div className="mt-4">
								<Text>
									{file
										? file.name
										: CommonConstant.DRAG_FILE_HERE_OR_CLICK_TO_SELECT_FILE}
								</Text>
							</div>
						</div>
					</Dropzone>

					<div className="h-12 flex items-center w-full">
						{file && (
							<FileWithDelete file={file} onDelete={() => setFile(null)} />
						)}
					</div>

					<div className="flex justify-end gap-4 mt-2">
						<Button variant="outline" onClick={onCancel}>
							{CommonConstant.CANCEL}
						</Button>

						<Button type="submit" loading={loading}>
							{CommonConstant.CONFIRM}
						</Button>
					</div>
				</form>
			</Modal>

			<Drawer
				opened={uploadResult.length > 0}
				onClose={() => setUploadResult([])}
				position="bottom"
				size={'90%'}
				zIndex={99999}
			>
				<UploadFaildResultTable data={uploadResult} />
			</Drawer>
		</>
	)
}

export default DeviceDropzoneDialog

const FileWithDelete = ({
	file,
	onDelete,
}: {
	file: File | null
	onDelete?: () => void
}) => {
	return (
		<div className="flex justify-between items-center w-full">
			<div className="text-sm text-sky-600">{file?.name}</div>

			<ActionIcon variant="subtle" size={`xs`} onClick={onDelete}>
				<IconTrash />
			</ActionIcon>
		</div>
	)
}

const importTableHeader = [
	'物理位置',
	'资产编号',
	'产品序列号',
	'使用人',
	'网络名称',
	'IP地址',
	'状态',
	'MAC',
	'硬盘序列号',
	'分类',
	'型号',
	'备注',
]

const checkTableHeader = (header: Row) => {
	return importTableHeader.every((h, index) => h === header[index])
}

const getDataFromDeviceImportTableRows = (rows: Row[]) => {
	return rows.map((row) => ({
		location: row[0] || '',
		serialNumber: row[1] || '',
		productNumber: row[2] || '',
		username: row[3] || '',
		network: row[4] || '',
		ipAddress: row[5] || '',
		deviceStatus: row[6] || '',
		mac: row[7] || '',
		diskSerialNumber: row[8] || '',
		category: row[9] || '',
		model: row[10] || '',
		remark: row[11] || '',
	}))
}

// export const exportDeviceExcelColumns = [
// 	{ accessorKey: 'location', header: DeviceConstant.LOCATION },
// 	{
// 		key: 'serialNumber',
// 		header: DeviceConstant.SERIAL_NUMBER,
// 	},
// 	{
// 		key: 'productNumber',
// 		header: DeviceConstant.PRODUCT_NUMBER,
// 	},

// 	{ key: 'username', header: UserConstant.USER },
// 	{
// 		key: 'network',
// 		header: NetowrkConstant.NETWORK_NAME,
// 	},
// 	{
// 		key: 'ipAddress',
// 		header: NetowrkConstant.IP_ADDRESS,
// 	},
// 	{
// 		key: 'deviceStatus',
// 		header: DeviceConstant.STATUS,
// 	},

// 	{ key: 'mac', header: DeviceConstant.MAC },
// 	{
// 		key: 'diskSerialNumber',
// 		header: DeviceConstant.DISK_SERIAL_NUMBER,
// 	},
// 	{
// 		key: 'category',
// 		header: DeviceModalConstant.CATEGORY,
// 	},
// 	{
// 		key: 'model',
// 		header: DeviceModalConstant.MODEL,
// 	},
// 	{ key: 'remark', header: CommonConstant.REMARK },
// ]

export const columns: MRT_ColumnDef<
	Partial<UploadDeviceInput & { message: string }>
>[] = [
	{ accessorKey: 'message', header: CommonConstant.ERROR_MESSAGE },
	{ accessorKey: 'location', header: DeviceConstant.LOCATION },
	{
		accessorKey: 'serialNumber',
		header: DeviceConstant.SERIAL_NUMBER,
	},
	{
		accessorKey: 'productNumber',
		header: DeviceConstant.PRODUCT_NUMBER,
	},

	{ accessorKey: 'username', header: UserConstant.USER },
	{
		accessorKey: 'network',
		header: NetowrkConstant.NETWORK_NAME,
	},
	{
		accessorKey: 'ipAddress',
		header: NetowrkConstant.IP_ADDRESS,
	},
	{
		accessorKey: 'deviceStatus',
		header: DeviceConstant.STATUS,
	},

	{ accessorKey: 'mac', header: DeviceConstant.MAC },
	{
		accessorKey: 'diskSerialNumber',
		header: DeviceConstant.DISK_SERIAL_NUMBER,
	},
	{
		accessorKey: 'category',
		header: DeviceModalConstant.CATEGORY,
	},
	{
		accessorKey: 'model',
		header: DeviceModalConstant.MODEL,
	},
	{ accessorKey: 'remark', header: CommonConstant.REMARK },
]

const UploadFaildResultTable = ({
	data,
}: {
	data: Result<UploadDeviceInput>[]
}) => {
	const rows = data.map((d) => ({ ...d.data, message: d.message }))

	const table = useMantineReactTable({ columns, data: rows })

	return <MantineReactTable table={table} />
}
