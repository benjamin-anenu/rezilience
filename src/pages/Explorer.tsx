 import { useState, useMemo } from 'react';
 import { Layout } from '@/components/layout';
 import { EcosystemStats, SearchBar, ProgramLeaderboard } from '@/components/explorer';
 import { programs } from '@/data/mockData';
 
 const Explorer = () => {
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
 
   const filteredPrograms = useMemo(() => {
     return programs.filter((program) => {
       const matchesSearch =
         searchQuery === '' ||
         program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         program.programId.toLowerCase().includes(searchQuery.toLowerCase());
 
       const matchesStatus =
         statusFilter === 'all' || program.livenessStatus === statusFilter;
 
       return matchesSearch && matchesStatus;
     });
   }, [searchQuery, statusFilter]);
 
   return (
     <Layout>
       <div className="py-8">
         <div className="container mx-auto px-4 lg:px-8">
           {/* Header */}
           <div className="mb-8">
             <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
               PROGRAM EXPLORER
             </h1>
             <p className="text-muted-foreground">
               Browse and analyze trust metrics for Solana programs across the ecosystem.
             </p>
           </div>
 
           {/* Ecosystem Stats */}
           <div className="mb-8">
             <EcosystemStats />
           </div>
 
           {/* Search & Filters */}
           <div className="mb-6">
             <SearchBar
               searchQuery={searchQuery}
               onSearchChange={setSearchQuery}
               statusFilter={statusFilter}
               onStatusFilterChange={setStatusFilter}
             />
           </div>
 
           {/* Results count */}
           <div className="mb-4">
             <p className="text-sm text-muted-foreground">
               Showing <span className="font-mono text-foreground">{filteredPrograms.length}</span> programs
             </p>
           </div>
 
           {/* Leaderboard */}
           <ProgramLeaderboard programs={filteredPrograms} />
         </div>
       </div>
     </Layout>
   );
 };
 
 export default Explorer;