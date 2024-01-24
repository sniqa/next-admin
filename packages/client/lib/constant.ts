export enum CommonConstant {
	CREATE_SUCCESS = '创建成功',
	CREATE_FAILD = '创建失败',
	DELETE_SUCCESS = '删除成功',
	DELETE_FAILD = '删除失败',
	UPDATE_SUCCESS = '更新成功',
	UPDATE_FAILD = '更新失败',

	SEARCH_VALUE = '搜索...',
	OPTION = '选项',
	NOTHING_FOUND = '空',

	CREATE = '新建',

	CANCEL = '取消',
	CONFIRM = '确认',
	DELETE = '删除',
	EDIT = '编辑',

	RESET = '重置',

	PLEASE_CONFIRM_YOUR_ACTION = '请确认操作',

	REMARK = '备注',
	DESCRIPTION = '描述',

	UPDATE_HISTORY = '历史变更记录',

	LAST_UPDATE_TIME = '最后更新时间',

	EXPORT_SELECTED_TO_XLSX = '导出选中至xlsx',
	IMPORT_TO_TABLE = '导入',

	DRAG_FILE_HERE_OR_CLICK_TO_SELECT_FILE = '拖放或点击选择文件',

	NOT_ALLOW_EMPTY_FILE = '不允许空文件',

	INVALID_FILE = '非法文件',
	SUCCESS_IMPORT_ITEM_TOTAL = '导入成功条目',
	FAILD_IMPORT_ITEM_TOTAL = '导入失败条目',
	SHOW_FAILD_IMPORT_ITEM = '查看导入失败条目',
	ERROR_MESSAGE = '错误消息',
}

export enum NetowrkConstant {
	CREATE_NETWORK_IP_RANGE = '创建网络地址段',
	NEXT_LINE_WITH_NEW_IP_RANGE = '另起一行表示新的地址段',

	NOT_ALLOW_CIDR_VALUE_OR_ERROR_FARMAT = '不允许的值或错误的格式',

	ENTER_NETWORK_NAME = '',
	ENTER_NETWORK_DESCRITION = '',
	NETWORK_NAME_NOT_BE_EMPTY = '网络名称不能为空',
	SELECT_NETWORK = '选择网络',
	CREATE_NETWORK = '创建网络',
	DELETE_NETWORK = '删除网络',
	IP_ADDRESS = 'IP地址',
	NETWORK_NAME = '网络名称',
	CIDR = '网络地址',
}

export enum UserConstant {
	USERNAME_NOT_BE_EMPTY = '名称不能为空',
	USER = '使用人',
	USERNAME = '用户名',
	ACCOUNT = '账户',
	PASSWORD = '密码',
	CONFIRM_PASSWORD = '确认密码',
	DEPARTMENT = '部门',

	CREATE_USER = '创建用户',
	EDIT_USER = '编辑用户',
	DELETE_USER = '删除用户',

	SHOW_DEVICE_BY_USER = '显示用户的设备',
}

export enum DeviceConstant {
	DEVICE_NOT_BE_EMPTY = '名称不能为空',
	SERIAL_NUMBER_NOT_BE_EMPTY = '序列号不能为空',
	CREATE_DEVICE = '创建设备',
	EDIT_DEVICE = '编辑设备',
	IMPORT_DEVICE_TO_TABLE = '导入设备',
	DOWNLOAD_IMPORT_DEVICE_TEMPLATE = '下载导入设备模板',

	DEVICE_TABLE = '设备表格',

	MAC = 'MAC',
	DISK_SERIAL_NUMBER = '硬盘序列号',

	LOCATION = '物理位置',
	SERIAL_NUMBER = '资产编号',
	PRODUCT_NUMBER = '产品序列号',
	NAME = '名称',
	STATUS = '状态',

	DEVICE_LIST = '设备列表',
}

export enum DeviceModalConstant {
	DEVICE_MODEL_NOT_BE_EMPTY = '型号不能为空',
	CREATE_DEVICE_MODEL = '创建设备型号',
	MODEL = '型号',
	NAME = '名称',
	TYPE = '类别',
	CATEGORY = '分类',
}
