import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetCandidateById, useUpdateCandidate } from "@/action/candidate";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const EditCandidatePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [experience, setExperience] = useState("");
    const [skills, setSkills] = useState("");
    const [education, setEducation] = useState("");
    const [resume, setResume] = useState("");

    const { data: candidate, isPending: isLoadingCandidate } = useGetCandidateById(id!);

    const updateCandidate = useUpdateCandidate(id!, () => {
        toast("Candidate Updated", {
            description: "The candidate has been updated successfully.",
        });
        navigate(`/candidates/${id}`);
    });

    // Populate form with candidate data when loaded
    useEffect(() => {
        if (candidate) {
            setName(candidate.name || "");
            setEmail(candidate.email || "");
            setPhone(candidate.phone || "");
            setExperience(candidate.experience || "");
            setSkills(candidate.skills || "");
            setEducation(candidate.education || "");
            setResume(candidate.resume || "");
        }
    }, [candidate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name && !email && !phone) {
            toast("Missing Fields", {
                description: "Please provide at least a name, email, or phone number.",
            });
            return;
        }

        updateCandidate.mutate({
            name,
            email,
            phone,
            experience,
            skills,
            education,
            resume
        });
    };

    if (isLoadingCandidate) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                    <Button variant="ghost" size="sm" className="gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                    </Button>
                    <ChevronRight className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                </div>

                <div className="mb-6">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-40" />
                </div>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>

                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Candidate Not Found</h1>
                <p className="mb-4 text-red-500">The requested candidate could not be found.</p>
                <Button onClick={() => navigate("/candidates")}>
                    Go Back to Candidates
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate(`/candidates/${id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Candidate
                </Button>
                <ChevronRight className="h-4 w-4" />
                <span>Edit Candidate</span>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Edit Candidate</h1>
                <p className="text-muted-foreground">Update candidate information</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Candidate Details</CardTitle>
                        <CardDescription>Update the information for this candidate</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. (123) 456-7890"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience</Label>
                            <Textarea
                                id="experience"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                placeholder="Describe the candidate's work experience..."
                                className="min-h-24"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills</Label>
                            <Textarea
                                id="skills"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="List the candidate's skills..."
                                className="min-h-24"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="education">Education</Label>
                            <Textarea
                                id="education"
                                value={education}
                                onChange={(e) => setEducation(e.target.value)}
                                placeholder="Describe the candidate's educational background..."
                                className="min-h-24"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resume">Resume</Label>
                            <Textarea
                                id="resume"
                                value={resume}
                                onChange={(e) => setResume(e.target.value)}
                                placeholder="Paste resume content or notes here..."
                                className="min-h-24"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/candidates/${id}`)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateCandidate.isPending || (!name && !email && !phone)}
                        >
                            {updateCandidate.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default EditCandidatePage; 