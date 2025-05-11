import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateCandidate } from "@/action/candidate";
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

const NewCandidatePage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [experience, setExperience] = useState("");
    const [skills, setSkills] = useState("");
    const [education, setEducation] = useState("");
    const [resume, setResume] = useState("");

    const createCandidate = useCreateCandidate(() => {
        toast("Candidate Created", {
            description: "The candidate has been created successfully.",
        });
        navigate("/candidates");
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name && !email && !phone) {
            toast("Missing Fields", {
                description: "Please provide at least a name, email, or phone number.",
            });
            return;
        }

        createCandidate.mutate({
            name,
            email,
            phone,
            experience,
            skills,
            education,
            resume
        });
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/candidates")}>
                    <ArrowLeft className="h-4 w-4" />
                    Candidates
                </Button>
                <ChevronRight className="h-4 w-4" />
                <span>New Candidate</span>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Add New Candidate</h1>
                <p className="text-muted-foreground">Create a new candidate profile</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Candidate Details</CardTitle>
                        <CardDescription>Fill in the information for this candidate</CardDescription>
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
                            onClick={() => navigate("/candidates")}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createCandidate.isPending || (!name && !email && !phone)}
                        >
                            {createCandidate.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Candidate"
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default NewCandidatePage; 