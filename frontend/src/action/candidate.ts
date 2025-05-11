import { useQueryData } from "@/hooks/useQueryData";
import { useMutationData } from "@/hooks/useMutationData";
import api from "@/lib/api";
import { API_CONFIG } from "@/lib/config";
import { Candidate, CreateCandidateRequest } from "@/types/index.types";

// Get all candidates
export const useGetCandidates = (name?: string, email?: string) => {
    let queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (email) queryParams.append('email', email);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    return useQueryData<Candidate[]>(
        ['candidates', name, email],
        async () => {
            try {
                const response = await api.get(`${API_CONFIG.CANDIDATES.BASE}${queryString}`);
                return response.data;
            } catch (error: any) {
                if (error.response) {
                    throw new Error(error.response.data.message || 'Failed to get candidates');
                }
                throw error;
            }
        }
    );
};

// Get candidate by ID
export const useGetCandidateById = (id: string) => {
    return useQueryData<Candidate>(
        ['candidate', id],
        async () => {
            try {
                const response = await api.get(`${API_CONFIG.CANDIDATES.BASE}/${id}`);
                return response.data;
            } catch (error: any) {
                if (error.response) {
                    throw new Error(error.response.data.message || 'Failed to get candidate');
                }
                throw error;
            }
        }
    );
};

// Create new candidate
export const useCreateCandidate = (onSuccess?: () => void) => {
    return useMutationData(
        ['createCandidate'],
        async (data: CreateCandidateRequest) => {
            try {
                const response = await api.post(API_CONFIG.CANDIDATES.BASE, data);
                return {
                    status: response.status,
                    data: 'Candidate created successfully',
                    candidate: response.data
                };
            } catch (error: any) {
                if (error.response) {
                    return {
                        status: error.response.status,
                        data: error.response.data.message || 'Failed to create candidate',
                    };
                }
                throw error;
            }
        },
        'candidates',
        onSuccess
    );
};

// Update candidate
export const useUpdateCandidate = (id: string, onSuccess?: () => void) => {
    return useMutationData(
        ['updateCandidate', id],
        async (data: Partial<CreateCandidateRequest>) => {
            try {
                const response = await api.put(`${API_CONFIG.CANDIDATES.BASE}/${id}`, data);
                return {
                    status: response.status,
                    data: 'Candidate updated successfully',
                    candidate: response.data
                };
            } catch (error: any) {
                if (error.response) {
                    return {
                        status: error.response.status,
                        data: error.response.data.message || 'Failed to update candidate',
                    };
                }
                throw error;
            }
        },
        ['candidates', 'candidate', id],
        onSuccess
    );
};

// Delete candidate
export const useDeleteCandidate = (id: string, onSuccess?: () => void) => {
    return useMutationData(
        ['deleteCandidate', id],
        async () => {
            try {
                const response = await api.delete(`${API_CONFIG.CANDIDATES.BASE}/${id}`);
                return {
                    status: response.status,
                    data: response.data.message || 'Candidate deleted successfully'
                };
            } catch (error: any) {
                if (error.response) {
                    return {
                        status: error.response.status,
                        data: error.response.data.message || 'Failed to delete candidate',
                    };
                }
                throw error;
            }
        },
        ['candidates'],
        onSuccess
    );
}; 