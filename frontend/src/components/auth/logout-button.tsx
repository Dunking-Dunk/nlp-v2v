import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLogout } from "@/action/user";
import { ButtonHTMLAttributes } from "react";

interface LogoutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    showIcon?: boolean;
    children?: React.ReactNode;
}

export function LogoutButton({
    variant = "ghost",
    showIcon = true,
    children,
    ...props
}: LogoutButtonProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const { mutate } = useLogout(() => {
        setIsLoggingOut(false);
        navigate("/auth/login");
    });

    const handleLogout = () => {
        setIsLoggingOut(true);
        mutate({});
    };

    return (
        <Button
            variant={variant}
            onClick={handleLogout}
            disabled={isLoggingOut}
            {...props}
        >
            {showIcon && <LogOut className="mr-2 h-4 w-4" />}
            {children || "Logout"}
        </Button>
    );
} 