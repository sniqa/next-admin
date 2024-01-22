import { ReactNode } from 'react'

const UserLayout = ({ children }: { children: ReactNode }) => {
	return <div className="h-full">{children}</div>
}

export default UserLayout
