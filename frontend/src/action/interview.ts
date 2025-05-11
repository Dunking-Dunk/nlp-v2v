import { useQueryData } from "@/hooks/useQueryData";
import { useMutationData } from "@/hooks/useMutationData";
import api from "@/lib/api";
import { API_CONFIG } from "@/lib/config";
import {
    Interview,
    InterviewTranscript,
    CreateInterviewRequest,
    UpdateInterviewRequest,
    CreateTranscriptRequest
} from "@/types/index.types";

// Get all interviews
export const useGetInterviews = (status?: string, candidateId?: string) => {
    let queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (candidateId) queryParams.append('candidateId', candidateId);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    return useQueryData<Interview[]>(
        ['interviews', status, candidateId],
        async () => {
            try {
                const response = await api.get(`${API_CONFIG.INTERVIEWS.BASE}${queryString}`);
                return response.data;
            } catch (error: any) {
                if (error.response) {
                    throw new Error(error.response.data.message || 'Failed to get interviews');
                }
                throw error;
            }
        }
    );
};

// Get interview by ID
export const useGetInterviewById = (id: string) => {
    return useQueryData<Interview>(
        ['interview', id],
        async () => {
            try {
                const response = await api.get(`${API_CONFIG.INTERVIEWS.BASE}/${id}`);
                return response.data;
            } catch (error: any) {
                if (error.response) {
                    throw new Error(error.response.data.message || 'Failed to get interview');
                }
                throw error;
            }
        }
    );
};

// Create new interview
export const useCreateInterview = (onSuccess?: () => void) => {
    return useMutationData(
        ['createInterview'],
        async (data: CreateInterviewRequest) => {
            try {
                const response = await api.post(API_CONFIG.INTERVIEWS.BASE, data);
                return {
                    status: response.status,
                    data: 'Interview created successfully',
                    interview: response.data
                };
            } catch (error: any) {
                if (error.response) {
                    return {
                        status: error.response.status,
                        data: error.response.data.message || 'Failed to create interview',
                    };
                }
                throw error;
            }
        },
        'interviews',
        onSuccess
    );
};

// Update interview
export const useUpdateInterview = (id: string, onSuccess?: () => void) => {
    return useMutationData(
        ['updateInterview', id],
        async (data: UpdateInterviewRequest) => {
            try {
                const response = await api.put(`${API_CONFIG.INTERVIEWS.BASE}/${id}`, data);
                return {
                    status: response.status,
                    data: 'Interview updated successfully',
                    interview: response.data
                };
            } catch (error: any) {
                if (error.response) {
                    return {
                        status: error.response.status,
                        data: error.response.data.message || 'Failed to update interview',
                    };
                }
                throw error;
            }
        },
        ['interviews', 'interview', id],
        onSuccess
    );
};

// Delete interview
export const useDeleteInterview = (id: string, onSuccess?: () => void) => {
    return useMutationData(
        ['deleteInterview', id],
        async () => {
            try {
                const response = await api.delete(`${API_CONFIG.INTERVIEWS.BASE}/${id}`);
                return {
                    status: response.status,
                    data: response.data.message || 'Interview deleted successfully'
                };
            } catch (error: any) {
                if (error.response) {
                    return {
                        status: error.response.status,
                        data: error.response.data.message || 'Failed to delete interview',
                    };
                }
                throw error;
            }
        },
        ['interviews', 'interview', id],
        onSuccess
    );
};

// Add transcript entry
export const useAddTranscriptEntry = (interviewId: string, onSuccess?: () => void) => {
    return useMutationData(
        ['addTranscript', interviewId],
        async (data: CreateTranscriptRequest) => {
            try {
                const response = await api.post(
                    API_CONFIG.INTERVIEWS.TRANSCRIPT(interviewId),
                    data
                );
                return {
                    status: response.status,
                    data: 'Transcript entry added successfully',
                    transcriptEntry: response.data
                };
            } catch (error: any) {
                if (error.response) {
                    return {
                        status: error.response.status,
                        data: error.response.data.message || 'Failed to add transcript entry',
                    };
                }
                throw error;
            }
        },
        ['interview', interviewId],
        onSuccess
    );
}; 