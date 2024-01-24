"use client";

import ConfirmButton from "@/components/custom/confirmButton";
import CreateUserDialog from "@/components/dialog/createUserDialog";
import EditUserDialog from "@/components/dialog/editUserDialog";
import { CommonConstant, UserConstant } from "@/lib/constant";
import { useAtom, usersAtom } from "@/lib/jotai";
import socket from "@/lib/socket";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { User } from "@next-admin/types";
import {
  IconEdit,
  IconTrash,
  IconDeviceDesktopSearch,
} from "@tabler/icons-react";
import {
  MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import "mantine-react-table/styles.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ShowUserDeviceTable from "./showUserDeviceTable";

const columns: MRT_ColumnDef<User>[] = [
  { accessorKey: "username", header: UserConstant.USERNAME },
  { accessorKey: "account", header: UserConstant.ACCOUNT },
  { accessorKey: "department", header: UserConstant.DEPARTMENT },

  { accessorKey: "remark", header: CommonConstant.REMARK },
];

const UserTable = () => {
  const [users, _] = useAtom(usersAtom);

  const [opened, { open, close }] = useDisclosure(false);

  const [editDialogOpened, editDialoghandle] = useDisclosure(false);

  const [showDeiveDialogOpened, showDeviceDialoghandle] = useDisclosure(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleEditOnClick = (values: User) => () => {
    editDialoghandle.open();
    setCurrentUser(values);
  };

  const handleOnDelete = (values: User) => () => {
    socket.emit("delete_user", values, (response) => {
      if (response.success) {
        toast(CommonConstant.DELETE_SUCCESS);
      } else {
        toast(`${CommonConstant.DELETE_FAILD}: ${response.message}`);
      }
    });
  };

  const handleOnShowUserDevice = (user: User) => () => {
    showDeviceDialoghandle.open();
    setCurrentUser(user);
  };

  const table = useMantineReactTable({
    columns,
    data: users,
    enableRowActions: true,
    enableStickyHeader: true,
    initialState: { density: "xs" },
    mantineTableContainerProps: { mah: "calc(100vh - 12rem)" },
    renderTopToolbarCustomActions: () => (
      <div className="flex gap-4">
        <Button onClick={open}>{UserConstant.CREATE_USER}</Button>
      </div>
    ),
    renderRowActions: ({ row }) => (
      <div className="flex gap-2">
        <ActionIcon onClick={handleEditOnClick(row.original)} variant="subtle">
          <Tooltip label={CommonConstant.EDIT}>
            <IconEdit />
          </Tooltip>
        </ActionIcon>

        <ConfirmButton
          type="icon"
          message={`${CommonConstant.DELETE}: ${row.original.username} ?`}
          onConfirm={handleOnDelete(row.original)}
        >
          <Tooltip label={CommonConstant.DELETE}>
            <IconTrash />
          </Tooltip>
        </ConfirmButton>

        <ActionIcon
          onClick={handleOnShowUserDevice(row.original)}
          variant="subtle"
        >
          <Tooltip label={UserConstant.SHOW_DEVICE_BY_USER}>
            <IconDeviceDesktopSearch />
          </Tooltip>
        </ActionIcon>
      </div>
    ),
  });

  useEffect(() => {
    socket.emit("get_data", ["find_user"]);
  }, []);

  return (
    <>
      <MantineReactTable table={table} />

      <CreateUserDialog opened={opened} onClose={close} />

      <EditUserDialog
        opened={editDialogOpened}
        onClose={editDialoghandle.close}
        data={currentUser}
      />

      <ShowUserDeviceTable
        opened={showDeiveDialogOpened}
        onClose={showDeviceDialoghandle.close}
        user={currentUser}
      />
    </>
  );
};

export default UserTable;
