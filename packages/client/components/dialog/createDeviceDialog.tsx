'use client'

import { socket } from '@/app/provider'
import SelectWithCreate from '@/components/custom/selectWithCreate'
import CreateDeviceModelDialog from '@/components/dialog/createDeviceModelDialog'
import CreateNetworkDialog from '@/components/dialog/createNetworkDialog'
import CreateUserDialog from '@/components/dialog/createUserDialog'
import {
	CommonConstant,
	DeviceConstant,
	DeviceModalConstant,
	NetowrkConstant,
	UserConstant,
} from '@/lib/constant'
import {
	deviceModelSelectAtom,
	deviceStatusSelectAtom,
	networkSelectAtom,
	useAtom,
	usersSelectAtom,
} from '@/lib/jotai'
import {
	Button,
	Modal,
	ModalProps,
	Select,
	SimpleGrid,
	TextInput,
	Textarea,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import type { Device } from '@next-admin/types'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import CreateDeviceStatusDialog from './createDeviceStatusDialog'
// import {} from ''

const formSchema = z.object({
	serialNumber: z.string().min(1, DeviceConstant.SERIAL_NUMBER_NOT_BE_EMPTY),
	productNumber: z.string().optional(),
	name: z.string().optional(),
	location: z.string().optional(),

	remark: z.string().optional(),
})

// jsx
const CreateDeviceDialog = (props: ModalProps) => {
	const router = useRouter()

	const form = useForm({
		initialValues: {
			serialNumber: '',
			productNumber: '',
			name: '',
			location: '',
			mac: '',
			diskSerialNumber: '',
			deviceStatusId: null,
			userId: null,
			ipAddressId: null,
			deviceModelId: null,
			description: '',
			remark: '',
		},
		validate: zodResolver(formSchema),
	})

	const [userDialogOpened, userDialoghandle] = useDisclosure(false)
	const [networkDialogOpened, networkDialoghandle] = useDisclosure(false)
	const [deviceModelDialogopened, deviceModelDialoghandle] =
		useDisclosure(false)

	const [deviceStatusDialogOpened, deviceStatusDialogHandle] =
		useDisclosure(false)

	const [userSelectData] = useAtom(usersSelectAtom)
	const [networkSelectData] = useAtom(networkSelectAtom)
	const [deviceModelSelectData] = useAtom(deviceModelSelectAtom)
	const [deviceStatusSelectData] = useAtom(deviceStatusSelectAtom)

	const [currentSelectNetwork, setCurrentSelectNetwork] = useState<
		string | null
	>('')

	const ipAddressSelectData = useMemo(() => {
		form.setFieldValue('ipAddressId', null)
		const target = networkSelectData.find(
			(network) => network.value === currentSelectNetwork
		)

		console.log(target)

		return target
			? target.ips
					.filter((ip) => {
						const val =
							(!ip.userId && !ip.device) ||
							ip.ip === '无' ||
							ip.ip.toLowerCase() === 'dhcp'

						console.log(ip, val)

						return val
					})
					.map((ip) => ({ value: ip.id, label: ip.ip }))
			: []
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentSelectNetwork, networkSelectData])

	const [loading, setLoading] = useState(false)

	// create
	const onSubmit = async (values: FieldValues) => {
		setLoading(true)

		socket.emit('create_device', values as Device, (response) => {
			setLoading(false)

			if (response.success) {
				toast(CommonConstant.CREATE_SUCCESS)

				form.reset()
				router.refresh()

				props.onClose()
			} else {
				console.log(response)

				toast(`${CommonConstant.CREATE_FAILD}: ${response.message}`)
			}
		})
	}

	const onCancel = () => {
		form.reset()
		setLoading(false)
		props.onClose()
	}

	// get data
	useEffect(() => {
		socket.emit('get_data', [
			'find_device_model',
			'find_network',
			'find_user',
			'find_device_status',
		])
	}, [])

	return (
		<>
			<Modal
				{...props}
				centered
				title={DeviceConstant.CREATE_DEVICE}
				onClose={onCancel}
			>
				<form onSubmit={form.onSubmit(onSubmit)}>
					<SimpleGrid cols={2} spacing={`xs`}>
						<TextInput
							withAsterisk
							label={DeviceConstant.SERIAL_NUMBER}
							{...form.getInputProps('serialNumber')}
						/>

						<TextInput
							label={DeviceConstant.PRODUCT_NUMBER}
							{...form.getInputProps('productNumber')}
						/>

						<TextInput
							label={DeviceConstant.NAME}
							{...form.getInputProps('name')}
						/>

						<TextInput
							label={DeviceConstant.LOCATION}
							{...form.getInputProps('location')}
						/>

						<SelectWithCreate
							label={UserConstant.USER}
							{...form.getInputProps('userId')}
							data={userSelectData}
							searchable
							onCreate={userDialoghandle.open}
						/>

						<SelectWithCreate
							label={NetowrkConstant.NETWORK_NAME}
							data={networkSelectData}
							searchable
							onChange={(value) => setCurrentSelectNetwork(value)}
							onCreate={networkDialoghandle.open}
						/>

						<Select
							label={NetowrkConstant.IP_ADDRESS}
							{...form.getInputProps('ipAddressId')}
							searchable
							placeholder={CommonConstant.SEARCH_VALUE}
							data={ipAddressSelectData}
						/>

						<SelectWithCreate
							label={DeviceModalConstant.MODEL}
							{...form.getInputProps('deviceModelId')}
							data={deviceModelSelectData}
							searchable
							onCreate={deviceModelDialoghandle.open}
						/>

						<SelectWithCreate
							label={DeviceConstant.STATUS}
							{...form.getInputProps('deviceStatusId')}
							data={deviceStatusSelectData}
							searchable
							onCreate={deviceStatusDialogHandle.open}
						/>
					</SimpleGrid>

					<div className="flex flex-col gap-2 mt-2">
						<TextInput
							label={DeviceConstant.MAC}
							{...form.getInputProps('mac')}
						/>

						<TextInput
							label={DeviceConstant.DISK_SERIAL_NUMBER}
							{...form.getInputProps('diskSerialNumber')}
						/>

						<Textarea
							label={CommonConstant.REMARK}
							minRows={3}
							maxRows={3}
							autosize
							{...form.getInputProps('remark')}
						/>
					</div>

					<div className="flex justify-end gap-4 mt-4">
						<Button variant="outline" onClick={onCancel}>
							{CommonConstant.CANCEL}
						</Button>

						<Button type="submit" loading={loading}>
							{CommonConstant.CONFIRM}
						</Button>
					</div>
				</form>
			</Modal>

			<CreateDeviceModelDialog
				opened={deviceModelDialogopened}
				onClose={deviceModelDialoghandle.close}
			/>
			<CreateUserDialog
				opened={userDialogOpened}
				onClose={userDialoghandle.close}
			/>
			<CreateNetworkDialog
				opened={networkDialogOpened}
				onClose={networkDialoghandle.close}
			/>

			<CreateDeviceStatusDialog
				opened={deviceStatusDialogOpened}
				onClose={deviceStatusDialogHandle.close}
			/>
		</>
	)
}

export default CreateDeviceDialog
