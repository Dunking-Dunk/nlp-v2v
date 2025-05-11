import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/provider/theme-provider";
import SwitchTheme from "@/components/global/theme";
import { useCurrentUser } from "@/action/user";
import { useUpdateProfile } from "@/action/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Setting = () => {
    const { theme } = useTheme();
    const { data: user, isPending, refetch } = useCurrentUser();

    const [name, setName] = useState(user?.name || "");
    const [isEditing, setIsEditing] = useState(false);

    const updateMutation = useUpdateProfile(() => {
        refetch();
        setIsEditing(false);
        toast("Profile Updated", {
            description: "Your profile has been successfully updated."
        });
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleSaveProfile = () => {
        updateMutation.mutate({ name });
    };

    const handleCancelEdit = () => {
        setName(user?.name || "");
        setIsEditing(false);
    };

    return (
        <div className="mx-auto p-6">
            <Card className="w-full mx-auto mb-6">
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your account information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-3">Personal Information</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={handleNameChange}
                                                placeholder="Your name"
                                                className="max-w-md"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleSaveProfile}
                                                    size="sm"
                                                    disabled={updateMutation.isPending}
                                                >
                                                    {updateMutation.isPending ? "Saving..." : "Save"}
                                                </Button>
                                                <Button
                                                    onClick={handleCancelEdit}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 items-center">
                                            <p className="text-sm">{user?.name || "Not set"}</p>
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <p className="text-sm">{user?.email || "Not available"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {user?.isVerified
                                            ? "Your email is verified"
                                            : "Your email is not verified. Please check your inbox for verification email."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full mx-auto">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Manage your application preferences</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <div className="flex flex-col space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="theme-mode">Theme Mode</Label>
                                    <SwitchTheme />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {theme === "light" && "Using light theme for all devices."}
                                        {theme === "dark" && "Using dark theme for all devices."}
                                        {theme === "system" && "Automatically matches your device's theme setting."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-3">More Settings</h3>
                            <p className="text-sm text-muted-foreground">Additional settings will be available in future updates.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Setting;