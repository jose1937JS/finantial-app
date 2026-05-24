import { useQuery } from '@tanstack/react-query';
import { JobService } from '../../api/services/job.service';

export const JOB_KEYS = {
  all: ['jobs'] as const,
  detail: (id: number) => ['job', id] as const,
};

export const useJobs = () => {
  return useQuery({
    queryKey: JOB_KEYS.all,
    queryFn: JobService.getAll,
  });
};

export const useJob = (id: number) => {
  return useQuery({
    queryKey: JOB_KEYS.detail(id),
    queryFn: () => JobService.getOne(id),
    enabled: !!id,
  });
};
