import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "@/action/user";

// Define the reset password schema with Zod
const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema)
    });

    // Use the reset password mutation
    const { mutate, isPending } = useResetPassword(token || "", () => {
        setStatus("success");
        setMessage("Your password has been reset successfully.");

        // Redirect to login after 3 seconds
        setTimeout(() => {
            navigate("/auth/login");
        }, 3000);
    });

    const onSubmit = async (data: ResetPasswordFormValues) => {
        setStatus("idle");
        setMessage(null);

        if (!token) {
            setStatus("error");
            setMessage("Missing reset token. Please try the reset link from your email again.");
            return;
        }

        try {
            // Call the reset password mutation with the new password
            mutate({ password: data.password });
        } catch (err) {
            setStatus("error");
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {status === "error" && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}

                        {status === "success" && (
                            <Alert className="border-green-500 text-green-500">
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending || status === "success"}
                        >
                            {isPending ? "Resetting Password..." : "Reset Password"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 