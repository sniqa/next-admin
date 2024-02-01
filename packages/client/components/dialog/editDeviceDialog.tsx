'use client'

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
import socket from '@/lib/socket'
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
import { memo, useEffect, useMemo, useState } from 'react'
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

export interface DeviceDialogProps extends ModalProps {
	data: Partial<Device> | null
}

const initialValues = {
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
}

// jsx
const EditDeviceDialog = memo(({ data, ...props }: DeviceDialogProps) => {
	console.log('editDevice')
	const form = useForm({
		initialValues,
		validate: zodResolver(formSchema),
	})
	// console.log(form.values, "form.values");

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
		// form.setFieldValue("ipAddressId", null);
		const target = networkSelectData.find(
			(network) => network.value === currentSelectNetwork
		)

		return target
			? target.ips
					.filter(
						(ip) =>
							(!ip.userId && !ip.device) ||
							ip.id === data?.ipAddressId ||
							ip.ip === '无' ||
							ip.ip.toLowerCase() === 'dhcp'
					)
					.map((ip) => ({ value: ip.id, label: ip.ip }))
			: []
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentSelectNetwork, networkSelectData, data])

	const [loading, setLoading] = useState(false)

	// create
	const onSubmit = async (values: FieldValues) => {
		setLoading(true)

		const { user, ipAddress, deviceModel, deviceStatus, ...data } = values

		const requestData = {
			...data,
			deviceStatusId: data.deviceStatusId === '' ? null : data.deviceStatusId,
			userId: data.userId === '' ? null : data.userId,
			ipAddressId: data.ipAddressId === '' ? null : data.ipAddressId,
			deviceModelId: data.deviceModelId === '' ? null : data.deviceModelId,
		}

		socket.emit('update_device', requestData as Device, (response) => {
			setLoading(false)

			if (response.success) {
				toast(CommonConstant.UPDATE_SUCCESS)
				props.onClose()
			} else {
				console.log(response)

				toast(`${CommonConstant.UPDATE_FAILD}: ${response.message}`)
			}
		})
	}

	const reset = () => {
		form.reset()
		setLoading(false)
	}

	const onCancel = () => {
		// form.reset();
		formReset()
		setLoading(false)
		props.onClose()
	}

	const formReset = () => {
		if (data === null) {
			return form.setValues(initialValues)
		} else {
			form.setValues(data as any)

			setCurrentSelectNetwork(data.ipAddress?.networkId || null)
		}
	}

	useEffect(() => {
		formReset()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	// get data
	useEffect(() => {
		socket.emit('get_data', ['find_device_model', 'find_network', 'find_user'])
	}, [])

	return (
		<>
			<Modal
				{...props}
				centered
				title={DeviceConstant.EDIT_DEVICE}
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
							value={data?.ipAddress?.networkId || ''}
							onChange={(value) => {
								setCurrentSelectNetwork(value)
								form.setFieldValue('ipAddressId', null)
							}}
							onCreate={networkDialoghandle.open}
						/>

						<Select
							label={NetowrkConstant.IP_ADDRESS}
							{...form.getInputProps('ipAddressId')}
							searchable
							//   placeholder={CommonConstant.SEARCH_VALUE}
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
})

export default EditDeviceDialog
