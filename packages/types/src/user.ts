import { type Authorization } from './authorization'
import type { Common, Id, Timestring } from './common'
import type { Device } from './device'
import type { IpAddress } from './network'
import type { Workflow, WorkflowNote, WorkflowTemp } from './workflow'

export type UserCreateInput = Common & {
	username: string
	account?: string
	password?: string

	department?: string

	device?: Device

	ips?: IpAddress[]

	authorization?: Authorization

	workflow?: Workflow

	workflowTemp?: WorkflowTemp

	workflowNode?: WorkflowNote
}

export type User = UserCreateInput & Timestring & Id
