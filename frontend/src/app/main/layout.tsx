import { Sidebar } from "@/components/global/sidebar"
import { Outlet } from "react-router"
import { Header } from "@/components/global/info-bar"
import { ReactNode } from "react"

interface DashboardLayoutProps {
    children?: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="w-full h-full">
            <Header toggleSidebar={() => { }} />
            <main className="mt-8">
                {children || <Outlet />}
            </main>

            {/* <Sidebar isOpen={false} onClose={() => {}} /> */}
        </div>
    )
}
export default DashboardLayout
