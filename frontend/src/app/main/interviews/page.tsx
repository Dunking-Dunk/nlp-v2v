import { useState } from "react";
import { useGetInterviews, useDeleteInterview } from "@/action/interview";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    CalendarIcon,
    CheckCircle,
    Clock,
    ClockIcon,
    MoreHorizontal,
    PencilIcon,
    Search,
    Trash2,
    UserCircle,
    UserPlus
} from "lucide-react";
import { InterviewStatus } from "@/types/index.types";
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

const InterviewsPage = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const [interviewToDelete, setInterviewToDelete] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: interviews, isPending, isFetched, refetch } = useGetInterviews(statusFilter);

    // Create delete mutation with dynamic ID
    const deleteInterview = useDeleteInterview(interviewToDelete || "", () => {
        toast("Interview Deleted", {
            description: "The interview has been deleted successfully.",
        });
        setIsDeleteDialogOpen(false);
        setInterviewToDelete(null);
        // Explicitly refresh the data after deletion with a small delay
        setTimeout(() => {
            refetch();
        }, 300);
    });

    // Open delete confirmation dialog
    const openDeleteDialog = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setInterviewToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = () => {
        if (interviewToDelete) {
            deleteInterview.mutate({});
        }
    };

    // Filter interviews by search query (position or candidate name)
    const filteredInterviews = interviews?.filter(interview => {
        const positionMatch = interview.position?.toLowerCase().includes(searchQuery.toLowerCase());
        const candidateMatch = interview.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return !searchQuery || positionMatch || candidateMatch;
    });

    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Get status badge
    const getStatusBadge = (status: InterviewStatus) => {
        switch (status) {
            case InterviewStatus.ACTIVE:
                return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
            case InterviewStatus.COMPLETED:
                return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
            case InterviewStatus.PENDING_REVIEW:
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Review</Badge>;
            case InterviewStatus.CANCELLED:
                return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>;
        }
    };

    // Get status icon
    const getStatusIcon = (status: InterviewStatus) => {
        switch (status) {
            case InterviewStatus.ACTIVE:
                return <Clock className="h-4 w-4 text-blue-500" />;
            case InterviewStatus.COMPLETED:
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case InterviewStatus.PENDING_REVIEW:
                return <ClockIcon className="h-4 w-4 text-yellow-500" />;
            case InterviewStatus.CANCELLED:
                return <UserCircle className="h-4 w-4 text-red-500" />;
        }
    };

    if (isPending) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Interviews</h1>
                    <Skeleton className="h-10 w-32" />
                </div>

                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle>Interview List</CardTitle>
                        <CardDescription>Manage all your interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <Skeleton className="h-10 w-full sm:w-64" />
                            <Skeleton className="h-10 w-full sm:w-48" />
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

    return (
        <div className="container mx-auto p-6">
            {/* Delete confirmation dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the interview
                            and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setInterviewToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleteInterview.isPending}
                        >
                            {deleteInterview.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Interviews</h1>
                <Button onClick={() => navigate("/interviews/new")}>
                    <UserPlus className="mr-2 h-4 w-4" /> New Interview
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle>Interview List</CardTitle>
                    <CardDescription>Manage all your interviews</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search interviews..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value={InterviewStatus.ACTIVE}>Active</SelectItem>
                                <SelectItem value={InterviewStatus.COMPLETED}>Completed</SelectItem>
                                <SelectItem value={InterviewStatus.PENDING_REVIEW}>Pending Review</SelectItem>
                                <SelectItem value={InterviewStatus.CANCELLED}>Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {filteredInterviews && filteredInterviews.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInterviews.map((interview) => (
                                        <TableRow key={interview.id} onClick={() => navigate(`/interviews/${interview.id}`)} className="cursor-pointer">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center">
                                                    {getStatusIcon(interview.status)}
                                                    <span className="ml-2">{interview.position || "Untitled Position"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{interview.candidate?.name || "No Candidate"}</TableCell>
                                            <TableCell>{formatDate(interview.startTime)}</TableCell>
                                            <TableCell>{getStatusBadge(interview.status)}</TableCell>
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
                                                            navigate(`/interviews/${interview.id}`);
                                                        }}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/interviews/${interview.id}/edit`);
                                                        }}>
                                                            <PencilIcon className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => openDeleteDialog(interview.id, e)}
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
                                    <h3 className="font-medium mb-1">No interviews found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {searchQuery ? "Try adjusting your search or filters" : "Get started by creating your first interview"}
                                    </p>
                                    {!searchQuery && (
                                        <Button onClick={() => navigate("/interviews/new")}>
                                            Create Interview
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <p>Loading interviews...</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default InterviewsPage; 