import { useQuery } from '@tanstack/react-query';
import { UserService } from '../../api/services/user.service';

export const USER_KEYS = {
  detail: (id: number) => ['user', id] as const,
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => UserService.getOne(id),
    enabled: !!id,
  });
};
