import { Skeleton } from '@/components/ui/skeleton'

const Loading = () => {
	return (
		<div className="flex flex-col justify-between h-full p-2 gap-4">
			<div className="flex justify-between p-2">
				<Skeleton className="h-10 w-[250px]" />
				<Skeleton className="h-10 w-[250px]" />
			</div>

			<div className="flex flex-grow flex-col p-2">
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
				<Skeleton className="h-8 w-full my-1" />
			</div>

			<div className="flex justify-end">
				<Skeleton className="h-10 w-1/4" />
			</div>
		</div>
	)
}

export default Loading
