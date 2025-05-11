import { QueryFunction, QueryKey, useQuery } from "@tanstack/react-query";

export const useQueryData = <TData = unknown>(
    queryKey: QueryKey,
    queryFn: QueryFunction<TData>,
    enabled?: boolean
) => {
    const { data, isPending, isFetched, refetch, isFetching } = useQuery({
        queryKey,
        queryFn,
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes by default
    });

    return { data, isPending, isFetched, refetch, isFetching };
}