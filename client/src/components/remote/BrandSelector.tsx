import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TvBrand } from '@shared/schema';

interface BrandSelectorProps {
  brands: TvBrand[];
  selectedBrand: string | null;
  onBrandChange: (brand: string) => void;
  isLoading: boolean;
}

export function BrandSelector({ brands, selectedBrand, onBrandChange, isLoading }: BrandSelectorProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">TV Brand</label>
      <Select value={selectedBrand || ""} onValueChange={onBrandChange} disabled={isLoading}>
        <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium">
          <SelectValue placeholder="Select your TV brand" />
        </SelectTrigger>
        <SelectContent>
          {brands.map((brand) => (
            <SelectItem key={brand.name} value={brand.name}>
              {brand.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
