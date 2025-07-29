import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrorMessage(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

// Test function to verify toast functionality
export function testToast() {
  const { toast } = require('sonner');
  toast.success('Toast test thành công!');
  toast.error('Toast test lỗi!');
}
