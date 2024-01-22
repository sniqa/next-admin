'use client'

import { Modal, ModalProps } from '@mantine/core'

export type MantineModalProps = {
	onCancel?: () => void
	onComfirm?: () => void
	loading?: boolean
} & ModalProps

const MantineModal = ({
	onCancel,
	onComfirm,
	loading,
	...props
}: MantineModalProps) => {
	return (
		<Modal {...props} centered>
			{props.children}
		</Modal>
	)
}

export default MantineModal
