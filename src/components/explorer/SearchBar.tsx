 import { Search, Filter } from 'lucide-react';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 
 interface SearchBarProps {
   searchQuery: string;
   onSearchChange: (value: string) => void;
   statusFilter: string;
   onStatusFilterChange: (value: string) => void;
 }
 
 export function SearchBar({
   searchQuery,
   onSearchChange,
   statusFilter,
   onStatusFilterChange,
 }: SearchBarProps) {
   return (
     <div className="flex flex-col gap-4 sm:flex-row">
       <div className="relative flex-1">
         <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
         <Input
           placeholder="Search by program name or ID..."
           value={searchQuery}
           onChange={(e) => onSearchChange(e.target.value)}
           className="pl-10 font-mono text-sm"
         />
       </div>
       <div className="flex gap-2">
         <Select value={statusFilter} onValueChange={onStatusFilterChange}>
           <SelectTrigger className="w-[140px]">
             <Filter className="mr-2 h-4 w-4" />
             <SelectValue placeholder="Status" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Status</SelectItem>
             <SelectItem value="active">Active</SelectItem>
             <SelectItem value="dormant">Dormant</SelectItem>
             <SelectItem value="degraded">Degraded</SelectItem>
           </SelectContent>
         </Select>
       </div>
     </div>
   );
 }