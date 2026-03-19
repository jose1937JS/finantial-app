import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../../api/services/user.service';
import { UpdateUserDto } from '../../types/api';
import { USER_KEYS } from '../queries/useUserQueries';

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) => UserService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => UserService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: USER_KEYS.detail(id) });
    },
  });
};
