'use client'

import { CommonConstant, DeviceModalConstant } from '@/lib/constant'
import socket from '@/lib/socket'
import {
	Button,
	Modal,
	TextInput,
	Textarea,
	type ModalProps,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { DeviceModel } from '@next-admin/types'
import { zodResolver } from 'mantine-form-zod-resolver'
import { memo, useState } from 'react'
import { FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
	model: z.string().min(1, DeviceModalConstant.DEVICE_MODEL_NOT_BE_EMPTY),
	name: z.string().optional(),
	description: z.string().optional(),
	type: z.string().optional(),
	category: z.string().optional(),
	remark: z.string().optional(),
})

const CreateDeviceModelDialog = memo((props: ModalProps) => {
	console.log('createDeviceModel')

	const [loading, setLoading] = useState(false)

	const form = useForm({
		initialValues: {
			model: '',
			description: '',
			name: '',
			type: '',
			category: '',
			remark: '',
		},
		validate: zodResolver(formSchema),
	})

	const onSubmit = async (values: FieldValues) => {
		setLoading(true)
		socket.emit('create_device_model', values as DeviceModel, (response) => {
			setLoading(false)
			if (response.success) {
				toast(CommonConstant.CREATE_SUCCESS)
				reset()
				props.onClose()
			} else {
				toast(`${CommonConstant.CREATE_FAILD}: ${response.message}`)
			}
		})
	}

	const reset = () => {
		form.reset()
		setLoading(false)
	}

	const onCancel = () => {
		reset()
		props.onClose()
	}

	return (
		<Modal
			{...props}
			centered
			title={DeviceModalConstant.CREATE_DEVICE_MODEL}
			onClose={onCancel}
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<TextInput
					withAsterisk
					required
					label={DeviceModalConstant.MODEL}
					{...form.getInputProps('model')}
				/>

				<TextInput
					label={DeviceModalConstant.NAME}
					{...form.getInputProps('name')}
				/>

				<TextInput
					label={DeviceModalConstant.TYPE}
					{...form.getInputProps('type')}
				/>

				<TextInput
					label={DeviceModalConstant.CATEGORY}
					{...form.getInputProps('category')}
				/>

				<Textarea
					minRows={3}
					maxRows={3}
					autosize
					label={CommonConstant.REMARK}
					{...form.getInputProps('remark')}
					className="pb-4"
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
})

export default CreateDeviceModelDialog
