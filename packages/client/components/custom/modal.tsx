import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Button } from "../ui/button";

export interface ModalProps {
  trigger: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  closeArea?: ReactNode;
  className?: string;
}

const CANCLE = "取消";
const COMFIRM = "确认";

export const Modal = ({
  trigger,
  title,
  description,
  children,
  closeArea,
  className,
}: ModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        <DialogFooter>
          <DialogClose asChild>
            <Button>close</Button>
          </DialogClose>

          {closeArea && (
            <DialogClose asChild>
              <Button onClick={(e) => e.preventDefault()}>close</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
