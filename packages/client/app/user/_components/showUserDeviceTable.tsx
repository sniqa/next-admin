"use client";

import { CommonConstant, DeviceConstant, UserConstant } from "@/lib/constant";
import socket from "@/lib/socket";
import { Drawer, DrawerProps } from "@mantine/core";
import { Device, User } from "@next-admin/types";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { columns } from "@/app/device/_components/util";
import { deviceAtom, useAtom } from "@/lib/jotai";

export type ShowUserDeviceTableProps = DrawerProps & {
  user: User | null;
};

const ShowUserDeviceTable = ({ user, ...props }: ShowUserDeviceTableProps) => {
  const [deviceData, setDeviceData] = useAtom(deviceAtom);

  const userDevices = useMemo(
    () =>
      user ? deviceData.filter((device) => device.userId === user.id) : [],
    [deviceData, user]
  );

  const table = useMantineReactTable({
    columns,
    data: userDevices,
    enableStickyHeader: true,
    enableFilters: true,
    initialState: { density: "xs" },
    mantineTableContainerProps: { mah: "calc(100vh - 12rem)" },
  });

  //   get data
  useEffect(() => {
    socket.emit("get_data", ["find_device"]);
  }, []);

  return (
    <Drawer
      {...props}
      position="bottom"
      size={"90%"}
      title={`${UserConstant.USER}: ${user?.username}`}
    >
      <MantineReactTable table={table} />
    </Drawer>
  );
};

export default ShowUserDeviceTable;
