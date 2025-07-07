
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const handleFilterChange = (categoryName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryName) {
      params.set('category', categoryName.toLowerCase());
    } else {
      params.delete('category');
    }
    // Use replace to avoid polluting browser history
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={!selectedCategory ? 'secondary' : 'ghost'}
        onClick={() => handleFilterChange(null)}
        className="justify-start"
      >
        All Products
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.name.toLowerCase() ? 'secondary' : 'ghost'}
          onClick={() => handleFilterChange(category.name)}
          className="justify-start"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
