import { CommonConstant } from "@/lib/constant";
import { ActionIcon, Button, ButtonProps, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

interface ComfirmButtonProps extends ButtonProps {
  message?: string;
  onConfirm?: () => void;
  type?: "button" | "icon";
}

const ConfirmButton = ({
  message,
  onConfirm,
  type = "button",
  ...props
}: ComfirmButtonProps) => {
  const openModal = () =>
    modals.openConfirmModal({
      title: CommonConstant.PLEASE_CONFIRM_YOUR_ACTION,
      size: "sm",
      radius: "md",
      withCloseButton: false,
      children: <Text size="sm">{message}</Text>,
      labels: {
        confirm: CommonConstant.CONFIRM,
        cancel: CommonConstant.CANCEL,
      },
      onConfirm,
    });

  if (type === "icon") {
    return (
      <ActionIcon onClick={openModal} variant="subtle">
        {props.children}
      </ActionIcon>
    );
  }

  return (
    <Button onClick={openModal} {...props}>
      {props.children}
    </Button>
  );
};

export default ConfirmButton;
