'use client'

import { socket } from '@/app/provider'
import { CommonConstant, NetowrkConstant } from '@/lib/constant'
import {
	Button,
	Modal,
	TextInput,
	Textarea,
	type ModalProps,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import type { NetworkCreateInput } from '@next-admin/types'
import { validateCidrs } from '@next-admin/utils'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
	name: z.string().min(1, NetowrkConstant.NETWORK_NAME_NOT_BE_EMPTY),
	description: z.string().optional(),
})

const CreateNetworkDialog = (props: ModalProps) => {
	const [loading, setLoading] = useState(false)

	const form = useForm({
		initialValues: {
			name: '',
			description: '',
			cidr: '',
		},
		validate: {
			...zodResolver(formSchema),
			cidr: (val) => {
				if (val === '') {
					return null
				} else if (val.trim().toLowerCase() === 'dhcp') {
					return null
				} else {
					return val.split('\n').every((cidr: string) => validateCidrs(cidr))
						? null
						: NetowrkConstant.NOT_ALLOW_CIDR_VALUE_OR_ERROR_FARMAT
				}
			},
		},
	})

	const onSubmit = async (values: FieldValues) => {
		const cidr =
			values.cidr === ''
				? []
				: values.cidr.split('\n').map((c: string) => c.trim())

		const data = {
			...values,
			cidr,
		}

		setLoading(true)
		socket.emit('create_network', data as NetworkCreateInput, (response) => {
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
			title={NetowrkConstant.CREATE_NETWORK_IP_RANGE}
			onClose={onCancel}
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<TextInput
					withAsterisk
					required
					label={NetowrkConstant.NETWORK_NAME}
					{...form.getInputProps('name')}
				/>

				<TextInput
					label={CommonConstant.DESCRIPTION}
					{...form.getInputProps('description')}
				/>

				<Textarea
					label={NetowrkConstant.CIDR}
					minRows={6}
					maxRows={6}
					autosize
					placeholder={`${NetowrkConstant.NEXT_LINE_WITH_NEW_IP_RANGE}:
合法值为: DHCP 或
192.168.0.1 
192.168.0.1-254
192.168.0.1/24
192.168.0.1/255.255.255.0`}
					{...form.getInputProps('cidr')}
					onKeyUp={(e) => {
						const value = form.getInputProps('cidr').value as string
						if (value === '') {
							return
						}

						if (value.toLowerCase() === 'dhcp') {
							return
						}

						if (
							!value.split('\n').every((cidr: string) => validateCidrs(cidr))
						) {
							form.setFieldError(
								'cidr',
								NetowrkConstant.NOT_ALLOW_CIDR_VALUE_OR_ERROR_FARMAT
							)
						}
					}}
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
}

export default CreateNetworkDialog
