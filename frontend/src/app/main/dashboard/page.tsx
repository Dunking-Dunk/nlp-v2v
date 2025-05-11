import { useGetInterviews } from "@/action/interview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InterviewStatus } from "@/types/index.types";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckCircle, CheckCircle2, Clock, ClockIcon, FileHeart, User, UserCircle, UserPlus } from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
    const { data: interviews, isPending, isFetched, refetch } = useGetInterviews();
    const navigate = useNavigate();
    const [error, setError] = useState<Error | null>(null);

    // Calculate statistics
    const getStats = () => {
        if (!interviews) return {
            total: 0,
            active: 0,
            completed: 0,
            pending: 0,
            cancelled: 0,
            averageScore: 0
        };

        const total = interviews.length;
        const active = interviews.filter(i => i.status === InterviewStatus.ACTIVE).length;
        const completed = interviews.filter(i => i.status === InterviewStatus.COMPLETED).length;
        const pending = interviews.filter(i => i.status === InterviewStatus.PENDING_REVIEW).length;
        const cancelled = interviews.filter(i => i.status === InterviewStatus.CANCELLED).length;

        // Calculate average score for completed interviews
        const completedInterviews = interviews.filter(
            i => i.status === InterviewStatus.COMPLETED && i.overallScore !== undefined
        );

        const averageScore = completedInterviews.length > 0
            ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedInterviews.length)
            : 0;

        return { total, active, completed, pending, cancelled, averageScore };
    };

    const stats = getStats();

    if (isPending) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <CardTitle><Skeleton className="h-4 w-24" /></CardTitle>
                                <CardDescription><Skeleton className="h-3 w-16" /></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle><Skeleton className="h-4 w-40" /></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[200px] w-full" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle><Skeleton className="h-4 w-40" /></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
                <p className="mb-4 text-red-500">{error.message}</p>
                <Button onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Interview Dashboard</h1>
                <Button onClick={() => navigate("/interviews/new")}>
                    <UserPlus className="mr-2 h-4 w-4" /> New Interview
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                        <CardDescription>All time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
                        <CardDescription>In progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-blue-500" />
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CardDescription>Finished interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            <div className="text-2xl font-bold">{stats.completed}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <CardDescription>Completed interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <FileHeart className="mr-2 h-4 w-4 text-purple-500" />
                            <div className="text-2xl font-bold">{stats.averageScore}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Interviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {interviews && interviews.length > 0 ? (
                            <div className="space-y-4">
                                {interviews.slice(0, 5).map(interview => (
                                    <div
                                        key={interview.id}
                                        className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md"
                                        onClick={() => navigate(`/interviews/${interview.id}`)}
                                    >
                                        <div className="flex items-center">
                                            <div className="mr-4">
                                                {interview.status === InterviewStatus.ACTIVE && (
                                                    <Clock className="h-5 w-5 text-blue-500" />
                                                )}
                                                {interview.status === InterviewStatus.COMPLETED && (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                )}
                                                {interview.status === InterviewStatus.PENDING_REVIEW && (
                                                    <ClockIcon className="h-5 w-5 text-yellow-500" />
                                                )}
                                                {interview.status === InterviewStatus.CANCELLED && (
                                                    <UserCircle className="h-5 w-5 text-red-500" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{interview.position || 'Untitled Position'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {interview.candidate?.name || 'No Candidate'} • {new Date(interview.startTime).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {interview.overallScore !== undefined && (
                                                <div className="text-sm font-medium">
                                                    Score: {interview.overallScore}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {interviews.length > 5 && (
                                    <Button
                                        variant="link"
                                        className="w-full mt-2"
                                        onClick={() => navigate("/interviews")}
                                    >
                                        View All Interviews
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <h3 className="font-medium mb-1">No interviews yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">Get started by creating your first interview</p>
                                <Button onClick={() => navigate("/interviews/new")}>
                                    Create Interview
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Interview Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                                        <span>Active</span>
                                    </div>
                                    <span className="font-medium">{stats.active}</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                        <span>Completed</span>
                                    </div>
                                    <span className="font-medium">{stats.completed}</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                                        <span>Pending Review</span>
                                    </div>
                                    <span className="font-medium">{stats.pending}</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 rounded-full"
                                        style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                                        <span>Cancelled</span>
                                    </div>
                                    <span className="font-medium">{stats.cancelled}</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 rounded-full"
                                        style={{ width: `${stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;