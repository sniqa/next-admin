'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Header = () => {
	const pathname = usePathname()

	return (
		<div className="w-full h-16 border-b flex justify-between items-center px-4">
			<div>Logo</div>

			<nav className="flex gap-2">
				<Link
					href={'/user'}
					className={`${
						pathname.includes('user')
							? 'border-b-2 border-sky-600 text-sky-600'
							: ''
					}`}
				>
					User
				</Link>
				<Link
					href={'/network'}
					className={`${
						pathname.includes('network')
							? 'border-b-2 border-sky-600 text-sky-600'
							: ''
					}`}
				>
					Network
				</Link>

				<Link
					href={'/device'}
					className={`${
						pathname.includes('device')
							? 'border-b-2 border-sky-600 text-sky-600'
							: ''
					}`}
				>
					Device
				</Link>
			</nav>
		</div>
	)
}

export default Header
