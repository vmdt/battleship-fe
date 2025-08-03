import { ReactNode } from "react";
import { Button } from "./button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  closeOnBackdropClick?: boolean;
  backdropType?: "default" | "solid" | "blur";
  id?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  showCloseButton = true,
  className,
  contentClassName,
  closeOnBackdropClick = true,
  backdropType = "default",
  id
}: ModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  let backdropClass = "";
  if (backdropType === "solid") {
    backdropClass = "modal-backdrop-solid";
  } else if (backdropType === "blur") {
    backdropClass = "modal-backdrop-blur";
  } else {
    backdropClass = "modal-backdrop-default";
  }

  return (
    <div
      id={id}
      className={cn("fixed inset-0 flex items-center justify-center z-50", backdropClass, className)}
      onClick={handleBackdropClick}
    >
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4", contentClassName)}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          {showCloseButton && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
} 