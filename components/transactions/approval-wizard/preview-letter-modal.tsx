"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface PreviewLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterUrl: string;
}

export const PreviewLetterModal = ({
  isOpen,
  onClose,
  letterUrl,
}: PreviewLetterModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview Surat Pengajuan</DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4"
            >
              <Icon icon="lucide:x" className="w-5 h-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="h-[calc(90vh-100px)] mt-4">
          <iframe
            src={letterUrl}
            className="w-full h-full border rounded-md"
            title="Surat Pengajuan"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}; 