import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "../provider/theme-provider"
import { AuthStatus } from "../auth/auth-status"

type Props = {
    children: React.ReactNode
}

export const MainLayout = ({ children }: Props) => {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="flex min-h-screen flex-col">
                {children}
            </div>
            <Toaster />
        </ThemeProvider>
    )
}
