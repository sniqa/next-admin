'use client'

import { CommonConstant, DeviceConstant } from '@/lib/constant'
import socket from '@/lib/socket'
import { Button, Modal, ModalProps, TextInput, Textarea } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { DeviceStatusCreateInput } from '@next-admin/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
	status: z.string().min(1, ''),
	remark: z.string().optional(),
})

const CreateDeviceStatusDialog = (props: ModalProps) => {
	const [loading, setLoading] = useState(false)

	const form = useForm({
		initialValues: {
			status: '',
			remark: '',
		},
		validate: zodResolver(formSchema),
	})

	const onCancel = () => {
		form.reset()
		setLoading(false)
		props.onClose()
	}

	const handleOnSubmit = (data: DeviceStatusCreateInput) => {
		setLoading(true)

		socket.emit('create_device_status', data, (response) => {
			setLoading(false)

			if (response.success) {
				toast(CommonConstant.CREATE_SUCCESS)
				form.reset()
				props.onClose()
			} else {
				toast(`${CommonConstant.CREATE_FAILD}: ${response.message}`)
			}
		})
	}

	return (
		<Modal {...props} centered title={DeviceConstant.STATUS}>
			<form onSubmit={form.onSubmit(handleOnSubmit)}>
				<TextInput
					required
					label={DeviceConstant.STATUS}
					{...form.getInputProps('status')}
				/>

				<Textarea
					label={CommonConstant.REMARK}
					{...form.getInputProps('remark')}
				/>

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
	)
}

export default CreateDeviceStatusDialog
