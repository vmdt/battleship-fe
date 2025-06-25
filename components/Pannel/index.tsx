import { ReactNode } from "react";

export default function Pannel({ children }: { children: ReactNode }) {
  return (
    <div className="bg-emerald-50 dark:bg-gray-900 text-black dark:text-white p-4 rounded-3xl transition-all duration-300">
      {children}
    </div>
  )
}