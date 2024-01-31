"use client";

import ConfirmButton from "@/components/custom/confirmButton";
import DeviceModal from "@/components/dialog/createDeviceDialog";
import DeviceDropzonDialog from "@/components/dialog/deviceDropzoneDialog";
import EditDeviceDialog from "@/components/dialog/editDeviceDialog";
import {
  CommonConstant,
  DeviceConstant,
  DeviceModalConstant,
  NetowrkConstant,
  UserConstant,
} from "@/lib/constant";
import { exportExcelData } from "@/lib/excel";
import { deviceAtom, uploadFaildResultAtom, useAtom } from "@/lib/jotai";
import socket from "@/lib/socket";
import { ActionIcon, Button, Drawer, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Device, Result, UploadDeviceInput } from "@next-admin/types";
import { IconEdit, IconHistory, IconTrash } from "@tabler/icons-react";
import {
  MRT_ColumnDef,
  MRT_Row,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import "mantine-react-table/styles.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DeviceHistoryTable from "./historyTable";
import { columns, exportDeviceExcelColumns } from "./util";

const DeviceTable = () => {
  const [devices, _] = useAtom(deviceAtom);

  const [opened, { open, close }] = useDisclosure(false);

  const [opened1, handle1] = useDisclosure(false);

  const [historyOpened, historyHandle] = useDisclosure(false);

  const [importOpened, importHandle] = useDisclosure(false);

  const [current, setCurrent] = useState<Device | null>(null);

  const [currentHistotyOfDevice, setHistoryOfDevice] = useState<string | null>(
    null
  );

  const [uploadResult, setUploadResult] = useState([]);

  const handleEditOnClick = (values?: Device) => () => {
    if (values) {
      handle1.open();

      setCurrent(values);
    }
  };

  const handleOnDelete = (values: Device) => () => {
    socket.emit("delete_device", values, (response) => {
      if (response.success) {
        toast(CommonConstant.DELETE_SUCCESS);
      } else {
        toast(`${CommonConstant.DELETE_FAILD}: ${response.message}`);
      }
    });
  };

  const handleOnHistoryClick = (id: string | null) => () => {
    historyHandle.open();
    setHistoryOfDevice(id);
  };

  const handleOnExport = (rows: MRT_Row<Device>[]) => () => {
    exportExcelData(
      exportDeviceExcelColumns,
      rows.map((row) => ({
        location: row.original.location,
        serialNumber: row.original.serialNumber,
        productNumber: row.original.productNumber,
        username: row.original.user?.username,
        department: row.original.user?.department,
        network: row.original.ipAddress?.network?.name,
        ipAddress: row.original.ipAddress?.ip,
        deviceStatus: row.original.deviceStatus?.status,
        mac: row.original.mac,
        diskSerialNumber: row.original.diskSerialNumber,
        category: row.original.deviceModel?.category,
        model: row.original.deviceModel?.model,
        remark: row.original.remark,
      }))
    );
  };

  const handleOnDeleteSeleted = (rows: MRT_Row<Device>[]) => () => {
    const ids = rows.map((row) => ({ id: row.original.id }));
    socket.emit("delete_selected_device", ids, (response) => {
      if (response.success) {
        toast(CommonConstant.DELETE_SUCCESS);
      } else {
        toast(`${CommonConstant.DELETE_FAILD}: ${response.message}`);
      }
    });
  };

  const table = useMantineReactTable({
    columns,
    data: devices,
    enableRowActions: true,
    enableStickyHeader: true,
    enableFilters: true,
    enableSelectAll: true,
    enableRowSelection: true,
    enableRowVirtualization: true,
    positionToolbarAlertBanner: "bottom",
    initialState: { density: "xs" },
    mantineTableContainerProps: { mah: "calc(100vh - 12rem)" },
    displayColumnDefOptions: { "mrt-row-actions": { size: 120 } },
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex gap-4">
        <Button onClick={open}>{DeviceConstant.CREATE_DEVICE}</Button>
        <Button
          onClick={handleOnExport(table.getSelectedRowModel().rows)}
          disabled={table.getSelectedRowModel().rows.length <= 0}
        >
          {CommonConstant.EXPORT_SELECTED_TO_XLSX}
        </Button>
        <Button
          onClick={handleOnDeleteSeleted(table.getSelectedRowModel().rows)}
          disabled={table.getSelectedRowModel().rows.length <= 0}
        >
          {CommonConstant.DELETE_SELECTED}
        </Button>
        <Button onClick={importHandle.open}>
          {CommonConstant.IMPORT_TO_TABLE}
        </Button>
      </div>
    ),
    renderRowActions: ({ row }) => (
      <div className="flex gap-2">
        <ActionIcon onClick={handleEditOnClick(row.original)} variant="subtle">
          <Tooltip label={CommonConstant.EDIT}>
            <IconEdit />
          </Tooltip>
        </ActionIcon>

        {/* delete */}
        <ConfirmButton
          type="icon"
          message={`${CommonConstant.DELETE}: ${row.original?.serialNumber} ?`}
          onConfirm={handleOnDelete(row.original)}
        >
          <Tooltip label={CommonConstant.DELETE}>
            <IconTrash />
          </Tooltip>
        </ConfirmButton>

        {/* history */}
        <ActionIcon
          variant="subtle"
          onClick={handleOnHistoryClick(row.original.id)}
        >
          <Tooltip label={CommonConstant.UPDATE_HISTORY}>
            <IconHistory />
          </Tooltip>
        </ActionIcon>
      </div>
    ),
  });

  useEffect(() => {
    socket.emit("get_data", ["find_device"]);
  }, []);

  return (
    <>
      <MantineReactTable table={table} />

      <DeviceModal opened={opened} onClose={close} />

      <EditDeviceDialog
        opened={opened1}
        onClose={handle1.close}
        data={current}
      />

      <DeviceHistoryTable
        opened={historyOpened}
        onClose={historyHandle.close}
        deviceId={currentHistotyOfDevice}
      />

      <DeviceDropzonDialog
        opened={importOpened}
        onClose={importHandle.close}
        onUploadFaildResult={(data) => setUploadResult(data)}
      />

      <Drawer
        opened={uploadResult.length > 0}
        onClose={() => setUploadResult([])}
        position="bottom"
        size={"90%"}
      >
        <UploadFaildResultTable data={uploadResult} />
      </Drawer>
    </>
  );
};

export default DeviceTable;

export const uploadFaildColumns: MRT_ColumnDef<
  Partial<UploadDeviceInput & { message: string }>
>[] = [
  { accessorKey: "message", header: CommonConstant.ERROR_MESSAGE, size: 240 },
  { accessorKey: "location", header: DeviceConstant.LOCATION },
  {
    accessorKey: "serialNumber",
    header: DeviceConstant.SERIAL_NUMBER,
  },
  {
    accessorKey: "productNumber",
    header: DeviceConstant.PRODUCT_NUMBER,
  },

  { accessorKey: "username", header: UserConstant.USER },
  {
    accessorKey: "network",
    header: NetowrkConstant.NETWORK_NAME,
  },
  {
    accessorKey: "ipAddress",
    header: NetowrkConstant.IP_ADDRESS,
  },
  {
    accessorKey: "deviceStatus",
    header: DeviceConstant.STATUS,
  },

  { accessorKey: "mac", header: DeviceConstant.MAC },
  {
    accessorKey: "diskSerialNumber",
    header: DeviceConstant.DISK_SERIAL_NUMBER,
  },
  {
    accessorKey: "category",
    header: DeviceModalConstant.CATEGORY,
  },
  {
    accessorKey: "model",
    header: DeviceModalConstant.MODEL,
  },
  { accessorKey: "remark", header: CommonConstant.REMARK },
];

const UploadFaildResultTable = ({
  data,
}: {
  data: Result<UploadDeviceInput>[];
}) => {
  const rows = data.map((d) => ({ ...d.data, message: d.message }));

  const table = useMantineReactTable({
    columns: uploadFaildColumns,
    data: rows,
    enablePagination: false,
    enableRowVirtualization: true,
    enableStickyHeader: true,
    initialState: { density: "xs" },
  });

  return <MantineReactTable table={table} />;
};
