import {
    MutationFunction,
    MutationKey,
    useMutation,
    useMutationState,
    useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

// Define a response type with status and data
interface ResponseWithStatus {
    status?: number;
    data?: string;
}

export const useMutationData = <TVariables = any, TData extends ResponseWithStatus = ResponseWithStatus>(
    mutationKey: MutationKey,
    mutationFn: MutationFunction<TData, TVariables>,
    queryKey?: string | string[] | string[][],
    onSuccess?: () => void
) => {
    const client = useQueryClient()
    const { mutate, isPending } = useMutation({
        mutationKey,
        mutationFn,
        onSuccess(data) {
            // Invalidate queries before calling onSuccess
            invalidateQueries();

            // Then call onSuccess if provided
            if (onSuccess) onSuccess();

            // Show toast notification
            toast(
                data?.status === 200 || data?.status === 201 ? 'Success' : 'Error',
                {
                    description: data?.data,
                }
            )
        },
        onError(error) {
            console.error("Mutation error:", error);
            toast('Error', {
                description: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    });

    // Function to invalidate queries
    const invalidateQueries = async () => {
        if (!queryKey) return;

        try {
            if (typeof queryKey === 'string') {
                await client.invalidateQueries({
                    queryKey: [queryKey],
                });
            } else if (Array.isArray(queryKey)) {
                if (Array.isArray(queryKey[0])) {
                    // Handle array of arrays case
                    for (const key of queryKey) {
                        await client.invalidateQueries({
                            queryKey: key as string[],
                        });
                    }
                } else {
                    // Handle simple array case
                    await client.invalidateQueries({
                        queryKey: queryKey as string[],
                    });
                }
            }
        } catch (err) {
            console.error("Error invalidating queries:", err);
        }
    };

    return { mutate, isPending }
}

export const useMutationDataState = <TVariables = any>(mutationKey: MutationKey) => {
    const data = useMutationState({
        filters: { mutationKey },
        select: (mutation) => {
            return {
                variables: mutation.state.variables as TVariables,
                status: mutation.state.status,
            }
        },
    })

    const latestVariables = data[data.length - 1]
    return { latestVariables }
}