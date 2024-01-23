import { timestamp } from '@next-admin/utils'
import ExcelJS from 'exceljs'

const c: Partial<ExcelJS.Column>[] = [{ key: '', header: '' }]

export const exportExcelData = async (
	columns: Partial<ExcelJS.Column>[],
	rows: any[],
	filename?: string
) => {
	'use client'
	const workbook = new ExcelJS.Workbook()
	const sheet = workbook.addWorksheet('Sheet 1')
	sheet.properties.defaultRowHeight = 24

	sheet.columns = columns

	sheet.addRows(rows)

	const data = await workbook.xlsx.writeBuffer()

	const blob = new Blob([data], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	})
	const url = window.URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = filename || timestamp()
	anchor.click()
	window.URL.revokeObjectURL(url)
}
