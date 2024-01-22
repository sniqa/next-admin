import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { ReactNode } from 'react'
import { ControllerRenderProps, FieldValues } from 'react-hook-form'

export interface FormInputProps {
	name: string
	control?: any
	label?: ReactNode
	description?: ReactNode
	renderItem: (field: ControllerRenderProps<FieldValues, string>) => ReactNode
}

export const FormInput = ({
	name,
	control,
	label,
	description,
	renderItem,
}: FormInputProps) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					{label && <FormLabel>{label}</FormLabel>}
					<FormControl>{renderItem(field)}</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}

// export interface FormProps  {
// 	form: UseFormReturn
// }

// const Form = ({form}: FormProps) => {

// 	return (
// 		<Form {...form}>
// 			<form onSubmit={form.handleSubmit(handleOnSubmit)}>
// 				<FormInput
// 					control={form.control}
// 					name="password"
// 					renderItem={(field) => <Input placeholder="shadcn" {...field} />}
// 				/>

// 				<FormField
// 					control={form.control}
// 					name="username"
// 					render={({ field }) => (
// 						<FormItem>
// 							<FormLabel>Username</FormLabel>
// 							<FormControl>
// 								<Input placeholder="shadcn" {...field} />
// 							</FormControl>
// 							<FormDescription>
// 								This is your public display name.
// 							</FormDescription>
// 							<FormMessage />
// 						</FormItem>
// 					)}
// 				/>

// 				<Button type="submit">login</Button>
// 			</form>
// 		</Form>
// 	)
// }
