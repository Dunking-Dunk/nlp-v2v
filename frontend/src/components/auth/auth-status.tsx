import { useCurrentUser } from "@/action/user";
import { LogoutButton } from "./logout-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";

export function AuthStatus() {
    const { data: user, isPending } = useCurrentUser();
    const navigate = useNavigate();

    if (isPending) {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate("/auth/login")}
                    className="text-sm font-medium hover:underline"
                >
                    Sign in
                </button>
                <span className="text-muted-foreground">/</span>
                <button
                    onClick={() => navigate("/auth/signup")}
                    className="text-sm font-medium hover:underline"
                >
                    Sign up
                </button>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 outline-none">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>
                            {user.name
                                ? `${user.name.charAt(0).toUpperCase()}`
                                : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                        <span className="font-medium">
                            {user.name || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {user.email}
                        </span>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <LogoutButton className="w-full justify-start cursor-pointer" variant="ghost" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 