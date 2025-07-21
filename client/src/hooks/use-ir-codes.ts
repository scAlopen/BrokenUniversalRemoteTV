import { useQuery } from '@tanstack/react-query';
import type { TvBrand } from '@shared/schema';

export function useIrCodes() {
  const { data: brands, isLoading, error } = useQuery<TvBrand[]>({
    queryKey: ['/api/tv-brands'],
  });

  const getBrandCodes = (brandName: string) => {
    const brand = brands?.find(b => b.name === brandName);
    return brand?.irCodes as Record<string, string> | null;
  };

  const getIrCode = (brandName: string, command: string): string | null => {
    const codes = getBrandCodes(brandName);
    return codes?.[command] || null;
  };

  return {
    brands: brands || [],
    isLoading,
    error,
    getBrandCodes,
    getIrCode,
  };
}
