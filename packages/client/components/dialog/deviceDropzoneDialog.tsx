/* eslint-disable react/display-name */
"use client";

import { CommonConstant, DeviceConstant } from "@/lib/constant";
import socket from "@/lib/socket";
import {
  ActionIcon,
  Anchor,
  Button,
  Modal,
  ModalProps,
  Text,
  rem,
} from "@mantine/core";
import { Dropzone, FileWithPath, MS_EXCEL_MIME_TYPE } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";
// import { Result, UploadDeviceInput } from "@next-admin/types";
import {
  IconFileTypeXls,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
// import {
//   MRT_ColumnDef,
//   MantineReactTable,
//   useMantineReactTable,
// } from "mantine-react-table";
import { FormEvent, memo, useState } from "react";
import readXlsxFile, { Row } from "read-excel-file";
import { toast } from "sonner";

interface DropzoneDialogProps extends ModalProps {
  onUploadFaildResult?: (data: any) => void;
}

const DeviceDropzoneDialog = memo(
  ({ onUploadFaildResult, ...props }: DropzoneDialogProps) => {
    console.log("uploadDevice");

    const [loading, setLoading] = useState(false);

    const [file, setFile] = useState<File | null>(null);

    const onDrop = (files: FileWithPath[]) => {
      setFile(files[0]);
    };

    const onCancel = () => {
      setFile(null);
      setLoading(false);
      props.onClose();
    };

    const onSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!file) {
        return toast(CommonConstant.NOT_ALLOW_EMPTY_FILE);
      }
      setLoading(true);

      const result = await readXlsxFile(file);

      const header = result.shift();

      if (!header || !checkTableHeader(header)) {
        toast(CommonConstant.INVALID_FILE);
        return setLoading(false);
      }

      const data = getDataFromDeviceImportTableRows(result);

      socket.emit("upload_device", data, (response) => {
        setLoading(false);

        console.log(response);

        const errResult = response.filter((data) => !data.success);

        if (errResult.length === 0) {
          toast(
            `${CommonConstant.SUCCESS_IMPORT_ITEM_TOTAL}: ${errResult.length}, ${CommonConstant.FAILD_IMPORT_ITEM_TOTAL}: 0`
          );
        } else {
          toast(
            <div className="flex flex-col gap-1">
              <span>
                {`${CommonConstant.SUCCESS_IMPORT_ITEM_TOTAL}: ${
                  response.length - errResult.length
                }, ${CommonConstant.FAILD_IMPORT_ITEM_TOTAL}: ${
                  errResult.length
                }`}
              </span>

              <Anchor
                className="text-sm"
                onClick={() =>
                  onUploadFaildResult && onUploadFaildResult(errResult as any)
                }
              >
                {CommonConstant.SHOW_FAILD_IMPORT_ITEM}
              </Anchor>
            </div>
          );
        }

        setFile(null);
        props.onClose();
      });
    };

    return (
      <>
        <Modal
          {...props}
          onClose={onCancel}
          centered
          title={DeviceConstant.IMPORT_DEVICE_TO_TABLE}
        >
          <form className="flex flex-col" onSubmit={onSubmit}>
            <div className="mb-4">
              <Anchor href="/DeviceTableTemplate.xlsx">
                {DeviceConstant.DOWNLOAD_IMPORT_DEVICE_TEMPLATE}
              </Anchor>
            </div>

            <Dropzone
              loading={loading}
              onDrop={onDrop}
              onReject={(files) => console.log("rejected files", files)}
              // maxSize={5 * 1024 ** 2}
              accept={MS_EXCEL_MIME_TYPE}
              maxFiles={1}
              multiple={false}
              {...props}
            >
              <div className="flex flex-col justify-center items-center">
                <Dropzone.Accept>
                  <IconUpload
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-blue-6)",
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-red-6)",
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconFileTypeXls
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-dimmed)",
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Idle>

                <div className="mt-4">
                  <Text>
                    {file
                      ? file.name
                      : CommonConstant.DRAG_FILE_HERE_OR_CLICK_TO_SELECT_FILE}
                  </Text>
                </div>
              </div>
            </Dropzone>

            <div className="h-12 flex items-center w-full">
              {file && (
                <FileWithDelete file={file} onDelete={() => setFile(null)} />
              )}
            </div>

            <div className="flex justify-end gap-4 mt-2">
              <Button variant="outline" onClick={onCancel}>
                {CommonConstant.CANCEL}
              </Button>

              <Button type="submit" loading={loading}>
                {CommonConstant.CONFIRM}
              </Button>
            </div>
          </form>
        </Modal>
      </>
    );
  }
);

export default DeviceDropzoneDialog;

const FileWithDelete = ({
  file,
  onDelete,
}: {
  file: File | null;
  onDelete?: () => void;
}) => {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="text-sm text-sky-600">{file?.name}</div>

      <ActionIcon variant="subtle" size={`xs`} onClick={onDelete}>
        <IconTrash />
      </ActionIcon>
    </div>
  );
};

const importTableHeader = [
  "物理位置",
  "资产编号",
  "产品序列号",
  "显示器序列号",
  "使用人",
  "部门",
  "网络名称",
  "IP地址",
  "状态",
  "MAC",
  "硬盘序列号",
  "分类",
  "型号",
  "备注",
];

const checkTableHeader = (header: Row) => {
  return importTableHeader.every((h, index) => h === header[index]);
};

const turnRowEmptyValue = (val: any) =>
  val === null ? "" : val.toString().trim();

const getDataFromDeviceImportTableRows = (rows: Row[]) => {
  return rows.map((row) => ({
    location: turnRowEmptyValue(row[0]),
    serialNumber: turnRowEmptyValue(row[1]),
    productNumber: turnRowEmptyValue(row[2]),
    displaySerialNumber: turnRowEmptyValue(row[3]),
    username: turnRowEmptyValue(row[4]),
    department: turnRowEmptyValue(row[5]),
    network: turnRowEmptyValue(row[6]),
    ipAddress: turnRowEmptyValue(row[7]),
    deviceStatus: turnRowEmptyValue(row[8]),
    mac: turnRowEmptyValue(row[9]),
    diskSerialNumber: turnRowEmptyValue(row[10]),
    category: turnRowEmptyValue(row[11]),
    model: turnRowEmptyValue(row[12]),
    remark: turnRowEmptyValue(row[13]),
  }));
};
