import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JobService } from '../../api/services/job.service';
import { CreateJobDto, CreateJobPaymentDto } from '../../types/api';
import { JOB_KEYS } from '../queries/useJobQueries';

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobDto) => JobService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.all });
    },
  });
};

export const useAddJobPaymentMutation = (jobId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobPaymentDto) => JobService.addPayment(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.all });
    },
  });
};
