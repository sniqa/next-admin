'use client'

import { CommonConstant, UserConstant } from '@/lib/constant'
import socket from '@/lib/socket'
import {
	Button,
	Modal,
	TextInput,
	Textarea,
	type ModalProps,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import type { UserCreateInput } from '@next-admin/types'
import { zodResolver } from 'mantine-form-zod-resolver'
import { memo, useState } from 'react'
import { FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
	username: z.string().min(1, UserConstant.USERNAME_NOT_BE_EMPTY),
	account: z.string().optional(),
	password: z.string().optional(),
	department: z.string().optional(),
	remark: z.string().optional(),
})

const CreateUserDialog = memo((props: ModalProps) => {
	console.log('createUser')

	const [loading, setLoading] = useState(false)

	const form = useForm({
		initialValues: {
			username: '',
			account: '',
			password: '',
			department: '',
			remark: '',
		},
		validate: zodResolver(formSchema),
	})

	const onSubmit = async (values: FieldValues) => {
		setLoading(true)

		socket.emit('create_user', values as UserCreateInput, (response) => {
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
			title={UserConstant.CREATE_USER}
			onClose={onCancel}
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<TextInput
					withAsterisk
					required
					label={UserConstant.USERNAME}
					{...form.getInputProps('username')}
				/>

				<TextInput
					label={UserConstant.ACCOUNT}
					{...form.getInputProps('account')}
				/>

				<TextInput
					label={UserConstant.PASSWORD}
					{...form.getInputProps('password')}
				/>

				<TextInput
					label={UserConstant.DEPARTMENT}
					{...form.getInputProps('department')}
				/>

				<Textarea
					label={CommonConstant.REMARK}
					minRows={3}
					maxRows={3}
					autosize
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

export default CreateUserDialog
