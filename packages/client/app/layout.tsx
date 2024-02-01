import { Toaster } from '@/components/ui/sonner'
import { Provider as JotaiProvider } from 'jotai'
import type { Metadata } from 'next'
import Header from './_components/header'
import './globals.css'
import Provider from './provider'

export const metadata: Metadata = {
	title: 'Hamster Project',
	description: 'Hamster Assests Mangers',
	icons: ['/hamster.ico'],
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className="flex flex-col h-full">
				<JotaiProvider>
					<Provider>
						<Header />
						{children}
						<Toaster />
					</Provider>
				</JotaiProvider>
			</body>
		</html>
	)
}
