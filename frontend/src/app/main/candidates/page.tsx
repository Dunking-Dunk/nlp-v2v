import { useState } from "react";
import { useGetCandidates, useDeleteCandidate } from "@/action/candidate";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    CalendarIcon,
    MoreHorizontal,
    PencilIcon,
    PhoneIcon,
    Search,
    Trash2,
    UserCircle,
    UserPlus,
    Mail,
    ClipboardList
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CandidatesPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [emailFilter, setEmailFilter] = useState("");
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: candidates, isPending, isFetched, refetch } = useGetCandidates(searchTerm, emailFilter);

    // Create delete mutation with dynamic ID
    const deleteCandidate = useDeleteCandidate(candidateToDelete || "", () => {
        toast("Candidate Deleted", {
            description: "The candidate has been deleted successfully.",
        });
        setIsDeleteDialogOpen(false);
        setCandidateToDelete(null);
        // Explicitly refresh the data after deletion
        setTimeout(() => {
            refetch();
        }, 300);
    });

    // Open delete confirmation dialog
    const openDeleteDialog = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCandidateToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = () => {
        if (candidateToDelete) {
            deleteCandidate.mutate({});
        }
    };

    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Calculate the number of interviews for each candidate
    const getInterviewCount = (candidateId: string) => {
        const candidate = candidates?.find(c => c.id === candidateId);
        return candidate?.interviews?.length || 0;
    };

    if (isPending) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Candidates</h1>
                    <Skeleton className="h-10 w-32" />
                </div>

                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle>Candidate List</CardTitle>
                        <CardDescription>Manage all your candidates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <Skeleton className="h-10 w-full sm:w-64" />
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead><Skeleton className="h-4 w-28" /></TableHead>
                                        <TableHead><Skeleton className="h-4 w-28" /></TableHead>
                                        <TableHead><Skeleton className="h-4 w-28" /></TableHead>
                                        <TableHead><Skeleton className="h-4 w-28" /></TableHead>
                                        <TableHead className="text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Filter candidates by search term
    const filteredCandidates = candidates?.filter(candidate => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = candidate.name?.toLowerCase().includes(searchLower);
        const emailMatch = candidate.email?.toLowerCase().includes(searchLower);
        const phoneMatch = candidate.phone?.toLowerCase().includes(searchLower);
        const skillsMatch = candidate.skills?.toLowerCase().includes(searchLower);

        return !searchTerm || nameMatch || emailMatch || phoneMatch || skillsMatch;
    });

    return (
        <div className="container mx-auto p-6">
            {/* Delete confirmation dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the candidate
                            and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCandidateToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleteCandidate.isPending}
                        >
                            {deleteCandidate.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Candidates</h1>
                <Button onClick={() => navigate("/candidates/new")}>
                    <UserPlus className="mr-2 h-4 w-4" /> New Candidate
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle>Candidate List</CardTitle>
                    <CardDescription>Manage all your candidates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search candidates..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredCandidates && filteredCandidates.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Experience</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCandidates.map((candidate) => (
                                        <TableRow key={candidate.id} onClick={() => navigate(`/candidates/${candidate.id}`)} className="cursor-pointer">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center">
                                                    <UserCircle className="h-4 w-4 text-primary mr-2" />
                                                    <span>{candidate.name || "Unnamed Candidate"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    {candidate.email && (
                                                        <div className="flex items-center text-xs">
                                                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                                            <span>{candidate.email}</span>
                                                        </div>
                                                    )}
                                                    {candidate.phone && (
                                                        <div className="flex items-center text-xs">
                                                            <PhoneIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                                                            <span>{candidate.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal text-xs">
                                                    {candidate.experience?.slice(0, 20) || "Not specified"}
                                                    {candidate.experience && candidate.experience.length > 20 ? "..." : ""}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(candidate.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/candidates/${candidate.id}`);
                                                        }}>
                                                            <UserCircle className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/candidates/${candidate.id}/edit`);
                                                        }}>
                                                            <PencilIcon className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/interviews/new?candidateId=${candidate.id}`);
                                                        }}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            Schedule Interview
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => openDeleteDialog(candidate.id, e)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            {isFetched ? (
                                <>
                                    <h3 className="font-medium mb-1">No candidates found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {searchTerm ? "Try adjusting your search" : "Get started by adding your first candidate"}
                                    </p>
                                    {!searchTerm && (
                                        <Button onClick={() => navigate("/candidates/new")}>
                                            Add Candidate
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <p>Loading candidates...</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CandidatesPage; 