import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const ADMIN_AUTO_JOB_TYPES = {
  AUTO_APPROVE_LYRICS: "auto_approve_lyrics",
  AUTO_RELEASE: "auto_release",
} as const;

export type AdminAutoJobType =
  (typeof ADMIN_AUTO_JOB_TYPES)[keyof typeof ADMIN_AUTO_JOB_TYPES];

type AdminAutoJobRow = Database["public"]["Tables"]["admin_auto_jobs"]["Row"];

const QUERY_KEY = ["admin-auto-jobs"];

async function fetchAdminAutoJobs(): Promise<AdminAutoJobRow[]> {
  const { data, error } = await supabase
    .from("admin_auto_jobs")
    .select("id, job_type, enabled, updated_at, updated_by")
    .order("job_type", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminAutoJobRow[];
}

async function setJobEnabled(
  jobType: AdminAutoJobType,
  enabled: boolean
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;

  const { error } = await supabase.from("admin_auto_jobs").upsert(
    {
      job_type: jobType,
      enabled,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    } as Database["public"]["Tables"]["admin_auto_jobs"]["Insert"],
    { onConflict: "job_type" }
  );

  if (error) throw error;
}

export function useAdminAutoJobs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAdminAutoJobs,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: ({
      jobType,
      enabled,
    }: {
      jobType: AdminAutoJobType;
      enabled: boolean;
    }) => setJobEnabled(jobType, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const jobs = query.data ?? [];
  const getJob = (jobType: AdminAutoJobType): AdminAutoJobRow | undefined =>
    jobs.find((j) => j.job_type === jobType);
  const isEnabled = (jobType: AdminAutoJobType): boolean =>
    getJob(jobType)?.enabled ?? false;

  const setEnabled = (jobType: AdminAutoJobType, enabled: boolean) =>
    mutation.mutateAsync({ jobType, enabled });

  return {
    jobs,
    getJob,
    isEnabled,
    setEnabled,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isUpdating: mutation.isPending,
  };
}

export function useAdminAutoJobRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("admin_auto_jobs_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_auto_jobs",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
