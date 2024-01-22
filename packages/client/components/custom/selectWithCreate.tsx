'use client'

import { CommonConstant } from '@/lib/constant'
import { Button, Combobox, InputBase, useCombobox } from '@mantine/core'
import { ReactNode, useEffect, useState } from 'react'

export interface SelectItemProps {
	value: string
	label: string
}

export interface ComboboxSelectProps {
	data: SelectItemProps[]
	onCreate?: () => void
	className?: string
	label?: ReactNode
	value?: string
	onChange?: (value: string) => void
	searchable?: boolean
	disabled?: boolean
}

const SelectWithCreate = ({
	data,
	onCreate,
	onChange,
	label,
	value,
	searchable,
	disabled,
	className = 'w-full',
}: ComboboxSelectProps) => {
	const [search, setSearch] = useState('')

	const [text, setText] = useState<string | null>(null)

	//   console.log(data);

	useEffect(() => {
		if (value) {
			setSearch(data.find((d) => d.value === value)?.label || '')
			setText(value)
		}
	}, [value, data])

	const options = data.filter((d) =>
		d.label.toLowerCase().trim().includes(search.toLowerCase().trim())
	)

	const combobox = useCombobox({
		onDropdownClose: () => {
			combobox.resetSelectedOption()
		},
		onDropdownOpen: () => {
			// combobox.focusSearchInput();
		},
	})

	return (
		<Combobox
			store={combobox}
			withinPortal={false}
			onOptionSubmit={(val) => {
				setText(val)

				const label = data.find((d) => d.value === val)?.label || ''

				setSearch(label)

				onChange && onChange(val)

				combobox.closeDropdown()
			}}
		>
			<Combobox.Target>
				<InputBase
					label={label}
					rightSection={<Combobox.Chevron />}
					value={search}
					disabled={disabled}
					onChange={(event) => {
						combobox.openDropdown()
						combobox.updateSelectedOptionIndex()
						setSearch(event.currentTarget.value)
					}}
					onClick={() => combobox.openDropdown()}
					onFocus={() => {
						combobox.openDropdown()
					}}
					onBlur={() => {
						combobox.closeDropdown()
						const label = data.find((d) => d.value === text)?.label || ''

						setSearch(label || '')
					}}
					placeholder={CommonConstant.SEARCH_VALUE}
					rightSectionPointerEvents="none"
				/>
			</Combobox.Target>

			<Combobox.Dropdown>
				<Combobox.Options>
					<div className="flex gap-2">
						{onCreate && (
							<Button variant="light" size="xs" fullWidth onClick={onCreate}>
								{CommonConstant.CREATE}
							</Button>
						)}

						<Button
							size="xs"
							variant="light"
							fullWidth
							onClick={() => {
								setSearch('')
								setText(null)
								onChange && onChange('')
							}}
						>
							{CommonConstant.RESET}
						</Button>
					</div>

					<Combobox.Group label={CommonConstant.OPTION}>
						{options.length > 0 ? (
							options.map((d) => (
								<Combobox.Option key={d.value} value={d.value}>
									{d.label}
								</Combobox.Option>
							))
						) : (
							<Combobox.Empty>{CommonConstant.NOTHING_FOUND}</Combobox.Empty>
						)}
					</Combobox.Group>
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	)
}

export default SelectWithCreate
