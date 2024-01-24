"use client";

import { CommonConstant, DeviceConstant } from "@/lib/constant";
import {
  ActionIcon,
  Anchor,
  Button,
  Group,
  Modal,
  ModalProps,
  Text,
  rem,
} from "@mantine/core";
import { Dropzone, FileWithPath, MS_EXCEL_MIME_TYPE } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";
import {
  IconPhoto,
  IconUpload,
  IconX,
  IconFileTypeXls,
  IconTrash,
} from "@tabler/icons-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import readXlsxFile, { Row } from "read-excel-file";

interface DropzoneDialogProps extends ModalProps {}

const DeviceDropzoneDialog = ({ ...props }: DropzoneDialogProps) => {
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

    console.log(result);
  };

  return (
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
  );
};

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
  "使用人",
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
