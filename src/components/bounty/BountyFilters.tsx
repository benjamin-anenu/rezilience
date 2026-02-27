import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const STATUSES = ['all', 'open', 'claimed', 'submitted', 'approved', 'rejected'] as const;

interface BountyFiltersProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function BountyFilters({ activeStatus, onStatusChange, search, onSearchChange }: BountyFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map(status => (
          <Button
            key={status}
            variant={activeStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(status)}
            className="font-mono text-[10px] uppercase"
          >
            {status}
          </Button>
        ))}
      </div>
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search bounties..."
          className="pl-9"
        />
      </div>
    </div>
  );
}
