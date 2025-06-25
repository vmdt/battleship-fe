import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import { useState } from "react"

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    return (
        <div className="flex h-full">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-1 flex-col">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    )
}

export default HomeLayout