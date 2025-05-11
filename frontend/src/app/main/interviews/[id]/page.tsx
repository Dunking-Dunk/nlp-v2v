import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetInterviewById, useUpdateInterview, useDeleteInterview } from "@/action/interview";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { InterviewStatus } from "@/types/index.types";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Pencil,
    Star,
    Trash2,
    User
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
import { useSocket } from "@/components/provider/SocketProvider";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const InterviewDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("details");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [transcriptEntries, setTranscriptEntries] = useState<any[]>([]);
    const [transcriptInput, setTranscriptInput] = useState("");
    const [speakerType, setSpeakerType] = useState("AGENT");
    const { socket, isConnected } = useSocket();
    const [agentConnected, setAgentConnected] = useState(false);

    const { data: interview, isPending, refetch } = useGetInterviewById(id!);

    // Initialize socket connection and join interview room
    useEffect(() => {
        if (id && socket && isConnected) {
            // Join interview room
            socket.emit('join-interview', id);

            // Listen for transcript updates
            socket.on('transcript-update', (newEntry) => {
                setTranscriptEntries(prev => {
                    // Check if this entry already exists to prevent duplicates
                    const entryExists = prev.some(entry => entry.id === newEntry.id);
                    if (entryExists) {
                        return prev;
                    }
                    return [...prev, newEntry];
                });
            });

            // Listen for evaluation updates
            socket.on('evaluation-update', (updatedInterview) => {
                refetch(); // Refetch to get the updated interview data
            });

            // Listen for agent connection events
            socket.on('agent-connected', (data) => {
                if (data.interviewId === id) {
                    setAgentConnected(true);
                    toast("Agent Connected", {
                        description: "An interview agent has joined this session.",
                    });
                }
            });

            socket.on('agent-disconnected', (data) => {
                if (data.interviewId === id) {
                    setAgentConnected(false);
                    toast("Agent Disconnected", {
                        description: "The interview agent has left this session.",
                    });
                }
            });

            return () => {
                // Cleanup listeners when component unmounts
                socket.off('transcript-update');
                socket.off('evaluation-update');
                socket.off('agent-connected');
                socket.off('agent-disconnected');
            };
        }
    }, [id, socket, isConnected, refetch]);

    // Sync transcriptEntries with interview data when it loads
    useEffect(() => {
        if (interview?.transcriptEntries) {
            // Replace the state entirely rather than appending
            setTranscriptEntries(interview.transcriptEntries);
        }
    }, [interview?.transcriptEntries]);

    const updateInterview = useUpdateInterview(id!, () => {
        refetch();
        toast("Interview Updated", {
            description: "The interview status has been updated successfully.",
        });
    });

    const deleteInterview = useDeleteInterview(id!, () => {
        toast("Interview Deleted", {
            description: "The interview has been deleted successfully.",
        });
        setTimeout(() => {
            navigate("/interviews");
        }, 300);
    });

    const handleStatusChange = (newStatus: InterviewStatus) => {
        updateInterview.mutate({ status: newStatus });
    };

    const handleDeleteInterview = () => {
        deleteInterview.mutate({});
    };

    // Handle sending new transcript entry
    const handleSendTranscript = (e: React.FormEvent) => {
        e.preventDefault();
        if (transcriptInput.trim() && id && socket && isConnected) {
            // Send to socket server
            socket.emit('new-transcript', {
                interviewId: id,
                speakerType,
                content: transcriptInput
            });
            setTranscriptInput("");
        }
    };

    // Handle real-time evaluation update
    const handleEvaluationChange = (field: string, value: any) => {
        if (id && socket && isConnected) {
            const evaluationData = { [field]: value };
            // Send to socket server
            socket.emit('update-evaluation', {
                interviewId: id,
                evaluationData
            });
        }
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
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>

                <Tabs defaultValue="details">
                    <TabsList className="mb-6">
                        <Skeleton className="h-10 w-96" />
                    </TabsList>

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
                </Tabs>
            </div>
        );
    }

    if (error || !interview) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Error Loading Interview</h1>
                <p className="mb-4 text-red-500">{error?.message || "Interview not found"}</p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate("/interviews")}>
                        Go Back to Interviews
                    </Button>
                    <Button variant="outline" onClick={() => refetch()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Format date to readable format
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
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

    const renderCandidateSection = () => {
        if (!interview || !interview.candidate) {
            return (
                <div className="text-center py-12">
                    <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-1">No candidate assigned</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        This interview doesn't have a candidate assigned to it.
                    </p>
                    <Button onClick={() => navigate(`/interviews/${id}/edit`)}>
                        Assign Candidate
                    </Button>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {/* Basic Information */}
                <div>
                    <h3 className="font-medium mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{interview.candidate.name || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{interview.candidate.email || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{interview.candidate.phone || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Experience</p>
                            <p className="font-medium">{interview.candidate.experience || "Not provided"}</p>
                        </div>
                    </div>
                </div>
                <Separator />

                {/* Skills */}
                <div>
                    <h3 className="font-medium mb-4">Skills</h3>
                    <p className="text-sm whitespace-pre-wrap">
                        {interview.candidate.skills || "No skills information provided."}
                    </p>
                </div>
                <Separator />

                {/* Education */}
                <div>
                    <h3 className="font-medium mb-4">Education</h3>
                    <p className="text-sm whitespace-pre-wrap">
                        {interview.candidate.education || "No education information provided."}
                    </p>
                </div>
                <Separator />

                {/* Resume */}
                <div>
                    <h3 className="font-medium mb-4">Resume</h3>
                    <p className="text-sm whitespace-pre-wrap">
                        {interview.candidate.resume || "No resume provided."}
                    </p>
                </div>
            </div>
        );
    };

    const renderTranscriptSection = () => {
        return (
            <>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Conversation Transcript</h3>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-muted-foreground">
                            {isConnected ? 'Real-time connected' : 'Offline mode'}
                        </span>
                    </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto mb-6">
                    {transcriptEntries && transcriptEntries.length > 0 ? (
                        transcriptEntries.map((entry) => (
                            <div key={entry.id} className="flex gap-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${entry.speakerType === "AGENT" ? "bg-primary/10 text-primary" :
                                    entry.speakerType === "CANDIDATE" ? "bg-blue-500/10 text-blue-500" :
                                        "bg-yellow-500/10 text-yellow-500"
                                    }`}>
                                    {entry.speakerType === "AGENT" ? "A" :
                                        entry.speakerType === "CANDIDATE" ? "C" : "S"}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <p className="font-medium">
                                            {entry.speakerType === "AGENT" ? "Interviewer" :
                                                entry.speakerType === "CANDIDATE" ? "Candidate" : "System"}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(entry.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1 whitespace-pre-wrap">{entry.content}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="font-medium mb-1">No transcript available</h3>
                            <p className="text-sm text-muted-foreground">
                                Start recording the interview conversation below.
                            </p>
                        </div>
                    )}
                </div>

                {/* Add new transcript entry form */}
                <div className="bg-muted/50 p-4 rounded-lg">
                    <form onSubmit={handleSendTranscript} className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-40">
                                <Select
                                    value={speakerType}
                                    onValueChange={setSpeakerType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Speaker" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AGENT">Interviewer</SelectItem>
                                        <SelectItem value="CANDIDATE">Candidate</SelectItem>
                                        <SelectItem value="SYSTEM">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <span className="text-sm text-muted-foreground">is speaking</span>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={transcriptInput}
                                onChange={(e) => setTranscriptInput(e.target.value)}
                                placeholder="Type transcript entry..."
                                className="flex-1"
                                disabled={!isConnected}
                            />
                            <Button type="submit" disabled={!transcriptInput.trim() || !isConnected}>
                                Send
                            </Button>
                        </div>
                        {!isConnected && (
                            <p className="text-xs text-red-500">
                                You are offline. Reconnect to continue the real-time conversation.
                            </p>
                        )}
                    </form>
                </div>
            </>
        );
    };

    // Add real-time evaluation handling to the Evaluation tab content
    const renderEvaluationTab = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <span>Evaluation</span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-muted-foreground">
                                {isConnected ? 'Real-time editing' : 'Offline mode'}
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/interviews/${id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>Interview evaluation and scoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Overall Score - with real-time update */}
                <div>
                    <h3 className="font-medium mb-4">Overall Rating</h3>
                    <div className="flex flex-col items-center">
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={interview?.overallScore || 0}
                            onChange={(e) => handleEvaluationChange('overallScore', parseInt(e.target.value))}
                            className="text-4xl font-bold text-center w-32 mb-2"
                            disabled={!isConnected}
                        />
                        <p className="text-muted-foreground text-sm">
                            {interview?.overallScore !== undefined ? (
                                interview.overallScore >= 75 ? "Excellent Candidate" :
                                    interview.overallScore >= 60 ? "Good Candidate" :
                                        interview.overallScore >= 40 ? "Average Candidate" :
                                            "Below Average Candidate"
                            ) : "Not Evaluated Yet"}
                        </p>
                    </div>
                </div>
                <Separator />

                {/* Detailed scores with real-time update */}
                <div>
                    <h3 className="font-medium mb-4">Score Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm">Technical Skills</p>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={interview?.technicalSkillScore || 0}
                                    onChange={(e) => handleEvaluationChange('technicalSkillScore', parseInt(e.target.value))}
                                    className="w-16 h-8 text-right"
                                    disabled={!isConnected}
                                />
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${interview?.technicalSkillScore || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm">Problem Solving</p>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={interview?.problemSolvingScore || 0}
                                    onChange={(e) => handleEvaluationChange('problemSolvingScore', parseInt(e.target.value))}
                                    className="w-16 h-8 text-right"
                                    disabled={!isConnected}
                                />
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${interview?.problemSolvingScore || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm">Communication</p>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={interview?.communicationScore || 0}
                                    onChange={(e) => handleEvaluationChange('communicationScore', parseInt(e.target.value))}
                                    className="w-16 h-8 text-right"
                                    disabled={!isConnected}
                                />
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${interview?.communicationScore || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm">Attitude</p>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={interview?.attitudeScore || 0}
                                    onChange={(e) => handleEvaluationChange('attitudeScore', parseInt(e.target.value))}
                                    className="w-16 h-8 text-right"
                                    disabled={!isConnected}
                                />
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-500 rounded-full"
                                    style={{ width: `${interview?.attitudeScore || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm">Experience Relevance</p>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={interview?.experienceRelevanceScore || 0}
                                    onChange={(e) => handleEvaluationChange('experienceRelevanceScore', parseInt(e.target.value))}
                                    className="w-16 h-8 text-right"
                                    disabled={!isConnected}
                                />
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${interview?.experienceRelevanceScore || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
                <Separator />

                {/* Add textarea for feedback with real-time update */}
                <div className="col-span-2 mt-4">
                    <h3 className="font-medium mb-2">Feedback</h3>
                    <textarea
                        defaultValue={interview?.feedback || ''}
                        onChange={(e) => handleEvaluationChange('feedback', e.target.value)}
                        className={`w-full p-2 border rounded-md min-h-[100px] ${!isConnected ? 'opacity-70' : ''}`}
                        placeholder="Enter feedback..."
                        disabled={!isConnected}
                    />
                    {!isConnected && (
                        <p className="text-xs text-red-500 mt-1">
                            You are offline. Reconnect to enable real-time evaluation editing.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    // Enhance the header section with an agent status indicator
    const renderHeader = () => (
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold">{interview?.position || "Untitled Interview"}</h1>
                <p className="text-muted-foreground">
                    {interview?.department} • {interview?.level || "Entry Level"}
                </p>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-muted-foreground">
                        {isConnected ? 'Real-time connected' : 'Offline mode'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${agentConnected ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                    <span className="text-muted-foreground">
                        {agentConnected ? 'Interview Agent Active' : 'No Agent Connected'}
                    </span>
                </div>
                <div className="flex gap-2 mt-2">
                    <Button
                        variant={interview.status === InterviewStatus.ACTIVE ? "default" : "outline"}
                        onClick={() => handleStatusChange(InterviewStatus.ACTIVE)}
                        disabled={updateInterview.isPending}
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        Active
                    </Button>
                    <Button
                        variant={interview.status === InterviewStatus.COMPLETED ? "default" : "outline"}
                        onClick={() => handleStatusChange(InterviewStatus.COMPLETED)}
                        disabled={updateInterview.isPending}
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete
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
                                    This action cannot be undone. This will permanently delete the interview
                                    and all associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteInterview} className="bg-red-500 hover:bg-red-600">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/interviews")}>
                    <ArrowLeft className="h-4 w-4" />
                    Interviews
                </Button>
                <ChevronRight className="h-4 w-4" />
                <span>{interview?.position || "Untitled Interview"}</span>
            </div>

            {renderHeader()}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">
                        <FileText className="mr-2 h-4 w-4" />
                        Details
                    </TabsTrigger>
                    <TabsTrigger value="evaluation">
                        <Star className="mr-2 h-4 w-4" />
                        Evaluation
                    </TabsTrigger>
                    <TabsTrigger value="transcript">
                        <FileText className="mr-2 h-4 w-4" />
                        Transcript
                    </TabsTrigger>
                    <TabsTrigger value="candidate">
                        <User className="mr-2 h-4 w-4" />
                        Candidate
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                <span>Interview Details</span>
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/interviews/${id}/edit`)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </CardTitle>
                            <CardDescription>View basic information about this interview</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Basic Information */}
                            <div>
                                <h3 className="font-medium mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <div>{getStatusBadge(interview.status)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Position</p>
                                        <p className="font-medium">{interview.position || "Not specified"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Department</p>
                                        <p className="font-medium">{interview.department || "Not specified"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Level</p>
                                        <p className="font-medium">{interview.level || "Not specified"}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />

                            {/* Timing */}
                            <div>
                                <h3 className="font-medium mb-4">Timing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Start Time</p>
                                        <p className="font-medium flex items-center">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {formatDate(interview.startTime)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">End Time</p>
                                        <p className="font-medium flex items-center">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {interview.endTime ? formatDate(interview.endTime) : "Not ended yet"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Separator />

                            {/* Description */}
                            <div>
                                <h3 className="font-medium mb-4">Description</h3>
                                <p className="text-sm whitespace-pre-wrap">
                                    {interview.description || "No description provided for this interview."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="evaluation">
                    {renderEvaluationTab()}
                </TabsContent>

                <TabsContent value="transcript">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Transcript</CardTitle>
                            <CardDescription>Real-time conversation history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderTranscriptSection()}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="candidate">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                <span>Candidate Information</span>
                                {interview.candidate && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate(`/candidates/${interview.candidate?.id}`)}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Candidate
                                    </Button>
                                )}
                            </CardTitle>
                            <CardDescription>Details about the interview candidate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderCandidateSection()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InterviewDetailPage; 