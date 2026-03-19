import { useQuery } from '@tanstack/react-query';
import { CategoryService } from '../../api/services/category.service';

export const CATEGORY_KEYS = {
  all: ['categories'] as const,
  byUser: ['categories', 'user'] as const,
  detail: (id: number) => ['category', id] as const,
};

export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: CategoryService.getAll,
  });
};

export const useUserCategories = () => {
  return useQuery({
    queryKey: CATEGORY_KEYS.byUser,
    queryFn: CategoryService.getByUser,
  });
};

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: () => CategoryService.getOne(id),
    enabled: !!id,
  });
};
