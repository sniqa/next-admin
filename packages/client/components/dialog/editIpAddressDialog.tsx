'use client'

import { CommonConstant, NetowrkConstant, UserConstant } from '@/lib/constant'
import { networkSelectAtom, useAtom, usersSelectAtom } from '@/lib/jotai'
import socket from '@/lib/socket'
import { Button, Modal, ModalProps, TextInput, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IpAddress } from '@next-admin/types'
import { memo, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import SelectWithCreate from '../custom/selectWithCreate'
import CreateUserDialog from './createUserDialog'

export interface EditIpAddressDialog extends ModalProps {
	data: Partial<IpAddress> | null
}

const initialValues = {
	id: '',
	ip: '',
	networkId: null,
	userId: null,
	remark: '',
	description: '',
}

const EditIpAddressDialog = memo(({ data, ...props }: EditIpAddressDialog) => {
	console.log('editIpAddress')
	const [userDialogOpened, userDialoghandle] = useDisclosure(false)

	const [loading, setLoading] = useState(false)

	const form = useForm<IpAddress>({
		initialValues,
	})

	const [networkSelectData, setNetworkSelectData] = useAtom(networkSelectAtom)
	const [userSelectData] = useAtom(usersSelectAtom)

	const currentNetwork = useMemo(() => {
		return networkSelectData.find(
			(network) => network.value === data?.networkId
		)
	}, [networkSelectData, data])

	const onCancel = () => {
		// form.reset();
		setLoading(false)
		props.onClose()
	}

	const handleOnSubmit = (values: IpAddress) => {
		setLoading(true)

		socket.emit('update_ip_address', values, (response) => {
			setLoading(false)

			if (response.success) {
				setNetworkSelectData(response.data as IpAddress)
				toast(CommonConstant.UPDATE_SUCCESS)
				props.onClose()
			} else {
				toast(`${CommonConstant.UPDATE_FAILD}: ${response.message}`)
			}
		})
	}

	useEffect(() => {
		data && form.setValues(data)
	}, [data])

	return (
		<>
			<Modal {...props} centered title={NetowrkConstant.IP_ADDRESS}>
				<form
					onSubmit={form.onSubmit(handleOnSubmit)}
					className="flex flex-col gap-2"
				>
					<TextInput
						label={NetowrkConstant.IP_ADDRESS}
						{...form.getInputProps('ip')}
						disabled
					/>

					<TextInput
						label={NetowrkConstant.IP_ADDRESS}
						value={currentNetwork?.label || ''}
						disabled
					/>

					<SelectWithCreate
						label={UserConstant.USER}
						{...form.getInputProps('userId')}
						data={userSelectData}
						searchable
						disabled={!!data?.device}
						onCreate={userDialoghandle.open}
					/>

					<Textarea
						label={CommonConstant.REMARK}
						minRows={3}
						maxRows={3}
						autosize
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

			<CreateUserDialog
				opened={userDialogOpened}
				onClose={userDialoghandle.close}
			/>
		</>
	)
})

export default EditIpAddressDialog
