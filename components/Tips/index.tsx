import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

export function Tips() {
    const [tipsOpen, setTipsOpen] = useState(false);

    return (
        // button
        <nav id="tips-pannel">
            {!tipsOpen && (

                <button onClick={() => setTipsOpen(!tipsOpen)}
                    className="fixed flex flex-col items-center justify-center right-0 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-[#2c3e50] p-2 rounded-l-4xl shadow hover:bg-gray-300 z-20 border-2 border-gray-300 dark:border-gray-600"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm">Tips</span>
                </button>
            )}

            <div
                className={clsx(
                "fixed top-0 right-0 h-full bg-white dark:bg-[#2c3e50] shadow-lg transition-transform duration-300 z-30 border-l-2 border-gray-300 dark:border-gray-600",
                tipsOpen ? "translate-x-0" : "translate-x-full",
                "w-1/3 max-w-md"
                )}
            >
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">Tips</h2>
                </div>
                
                    {tipsOpen && (
                    <button 
                        onClick={() => setTipsOpen(false)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-gray-200 dark:bg-[#2c3e50] p-2 rounded-l-full shadow hover:bg-gray-300 border-2 border-gray-300 dark:border-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    )}
                    
                    <div className="p-4 overflow-y-auto">
                    {/* Nội dung tips ở đây */}
                    <p>- Tip 1: Bạn có thể...</p>
                    <p>- Tip 2: Nhấn để...</p>
                </div>
            </div>
        </nav>
    )
}