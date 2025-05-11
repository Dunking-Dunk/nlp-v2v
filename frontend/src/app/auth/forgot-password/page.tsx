import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequestPasswordReset } from "@/action/user";

// Define the password reset request schema with Zod
const passwordResetSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export default function ForgotPassword() {
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PasswordResetFormValues>({
        resolver: zodResolver(passwordResetSchema)
    });

    // Use the password reset request mutation
    const { mutate, isPending } = useRequestPasswordReset(() => {
        setStatus("success");
        setMessage("If an account with that email exists, password reset instructions have been sent.");
    });

    const onSubmit = async (data: PasswordResetFormValues) => {
        setStatus("idle");
        setMessage(null);

        try {
            // Call the password reset request mutation with email
            mutate({ email: data.email });
        } catch (err) {
            setStatus("error");
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password
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
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending || status === "success"}
                        >
                            {isPending ? "Sending Reset Link..." : "Send Reset Link"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            <Button
                                variant="link"
                                className="p-0"
                                onClick={() => navigate("/auth/login")}
                            >
                                Back to Login
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 