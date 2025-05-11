import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateInterview } from "@/action/interview";
import { useGetCandidates } from "@/action/candidate";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JobLevel } from "@/types/index.types";

const NewInterviewPage = () => {
    const navigate = useNavigate();
    const [position, setPosition] = useState("");
    const [department, setDepartment] = useState("");
    const [level, setLevel] = useState<string>(JobLevel.ENTRY);
    const [description, setDescription] = useState("");
    const [candidateId, setCandidateId] = useState<string | undefined>(undefined);

    const { data: candidates, isPending: isCandidatesLoading } = useGetCandidates();

    const createInterview = useCreateInterview(() => {
        toast("Interview Created", {
            description: "The interview has been created successfully.",
        });
        navigate("/interviews");
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!position || !department) {
            toast("Missing Fields", {
                description: "Please fill out all required fields.",
            });
            return;
        }

        const finalCandidateId = candidateId === "none" ? undefined : candidateId;

        createInterview.mutate({
            position,
            department,
            level,
            description,
            candidateId: finalCandidateId
        });
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/interviews")}>
                    <ArrowLeft className="h-4 w-4" />
                    Interviews
                </Button>
                <ChevronRight className="h-4 w-4" />
                <span>New Interview</span>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Create New Interview</h1>
                <p className="text-muted-foreground">Set up a new interview session</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Details</CardTitle>
                        <CardDescription>Fill in the basic information for this interview</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="position">Position <span className="text-red-500">*</span></Label>
                                <Input
                                    id="position"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    placeholder="e.g. Frontend Developer"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                                <Input
                                    id="department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    placeholder="e.g. Engineering"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="level">Job Level</Label>
                                <Select value={level} onValueChange={setLevel}>
                                    <SelectTrigger id="level">
                                        <SelectValue placeholder="Select job level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={JobLevel.ENTRY}>Entry Level</SelectItem>
                                        <SelectItem value={JobLevel.MID}>Mid Level</SelectItem>
                                        <SelectItem value={JobLevel.SENIOR}>Senior Level</SelectItem>
                                        <SelectItem value={JobLevel.LEAD}>Team Lead</SelectItem>
                                        <SelectItem value={JobLevel.MANAGER}>Manager</SelectItem>
                                        <SelectItem value={JobLevel.EXECUTIVE}>Executive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="candidate">Candidate</Label>
                                <Select
                                    value={candidateId || "none"}
                                    onValueChange={(value) => setCandidateId(value === "none" ? undefined : value)}
                                >
                                    <SelectTrigger id="candidate">
                                        <SelectValue placeholder="Select a candidate (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Candidate</SelectItem>
                                        {isCandidatesLoading ? (
                                            <div className="flex items-center justify-center py-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="ml-2">Loading candidates...</span>
                                            </div>
                                        ) : candidates && candidates.length > 0 ? (
                                            candidates.map((candidate) => (
                                                <SelectItem key={candidate.id} value={candidate.id}>
                                                    {candidate.name || candidate.email || "Unnamed Candidate"}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-candidates" disabled>
                                                No candidates available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add details about this interview session..."
                                className="min-h-24"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/interviews")}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createInterview.isPending || !position || !department}
                        >
                            {createInterview.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Interview"
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default NewInterviewPage; 