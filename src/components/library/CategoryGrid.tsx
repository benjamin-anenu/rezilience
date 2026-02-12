import { categories, type Category } from '@/data/categories';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryGrid({ selectedCategory, onSelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={cn(
              'group flex flex-col items-center gap-2 rounded-sm border p-4 text-center transition-all',
              isActive
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
            )}
          >
            <cat.icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')} />
            <span className="font-display text-sm font-semibold">{cat.name}</span>
            <span className="text-xs">{cat.protocolCount} protocols</span>
          </button>
        );
      })}
    </div>
  );
}
