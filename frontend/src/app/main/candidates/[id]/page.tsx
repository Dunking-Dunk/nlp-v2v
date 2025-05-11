import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetCandidateById, useDeleteCandidate } from "@/action/candidate";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    ArrowLeft,
    ChevronRight,
    Mail,
    Phone,
    PencilIcon,
    School,
    Briefcase,
    FileText,
    Trash2,
    Calendar
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CandidateDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: candidate, isPending, refetch } = useGetCandidateById(id!);

    const deleteCandidate = useDeleteCandidate(id!, () => {
        toast("Candidate Deleted", {
            description: "The candidate has been deleted successfully.",
        });
        navigate("/candidates");
    });

    const handleDeleteCandidate = () => {
        deleteCandidate.mutate({});
    };

    if (isPending) {
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

                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-5 w-32 mb-4" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
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

    // Format date to readable format
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/candidates")}>
                    <ArrowLeft className="h-4 w-4" />
                    Candidates
                </Button>
                <ChevronRight className="h-4 w-4" />
                <span>{candidate.name || "Unnamed Candidate"}</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{candidate.name || "Unnamed Candidate"}</h1>
                    {candidate.email && <p className="text-muted-foreground">{candidate.email}</p>}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/interviews/new?candidateId=${candidate.id}`)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Interview
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/candidates/${id}/edit`)}>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the candidate
                                    and all associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteCandidate} className="bg-red-500 hover:bg-red-600">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Candidate Information</CardTitle>
                    <CardDescription>Detailed information about this candidate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Contact Information */}
                    <div>
                        <h3 className="font-medium mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium flex items-center">
                                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {candidate.email || "Not provided"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium flex items-center">
                                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {candidate.phone || "Not provided"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Separator />

                    {/* Experience */}
                    <div>
                        <h3 className="font-medium mb-4">Experience</h3>
                        <div className="flex items-start gap-2">
                            <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <p className="text-sm whitespace-pre-wrap">
                                {candidate.experience || "No experience information provided."}
                            </p>
                        </div>
                    </div>
                    <Separator />

                    {/* Education */}
                    <div>
                        <h3 className="font-medium mb-4">Education</h3>
                        <div className="flex items-start gap-2">
                            <School className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <p className="text-sm whitespace-pre-wrap">
                                {candidate.education || "No education information provided."}
                            </p>
                        </div>
                    </div>
                    <Separator />

                    {/* Skills */}
                    <div>
                        <h3 className="font-medium mb-4">Skills</h3>
                        <p className="text-sm whitespace-pre-wrap">
                            {candidate.skills || "No skills information provided."}
                        </p>
                    </div>
                    <Separator />

                    {/* Resume */}
                    <div>
                        <h3 className="font-medium mb-4">Resume</h3>
                        <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <p className="text-sm whitespace-pre-wrap">
                                {candidate.resume || "No resume provided."}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Interviews section could be added here */}
            {candidate.interviews && candidate.interviews.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Interview History</CardTitle>
                        <CardDescription>Previous and upcoming interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground py-4">
                            This candidate has {candidate.interviews.length} interview{candidate.interviews.length > 1 ? 's' : ''}.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/interviews?candidateId=" + candidate.id)}
                        >
                            View Interviews
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CandidateDetailPage; 