import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Search, FileCode, Globe } from 'lucide-react';
import { RPCHealthMonitor } from '@/components/tools/RPCHealthMonitor';
import { AddressLookup } from '@/components/tools/AddressLookup';
import { TransactionDecoder } from '@/components/tools/TransactionDecoder';
import { EcosystemStatus } from '@/components/tools/EcosystemStatus';

const tabs = [
  { id: 'rpc', label: 'RPC Health', icon: Activity },
  { id: 'lookup', label: 'Address Lookup', icon: Search },
  { id: 'tx', label: 'TX Decoder', icon: FileCode },
  { id: 'status', label: 'Ecosystem Status', icon: Globe },
];

export default function Tools() {
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('tab') || 'rpc';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 lg:px-8">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-sm border border-primary/20 bg-primary/5 px-3 py-1 mb-4">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-xs uppercase tracking-wider text-primary">Builder Tools</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Solana Toolkit
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Public-good utilities for Solana builders. Check RPC health, decode transactions,
            look up addresses, and monitor ecosystem service status — all in one place.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 w-full justify-start bg-muted/30 border border-border/50">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 font-display text-sm tracking-wide data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="rpc"><RPCHealthMonitor /></TabsContent>
          <TabsContent value="lookup"><AddressLookup /></TabsContent>
          <TabsContent value="tx"><TransactionDecoder /></TabsContent>
          <TabsContent value="status"><EcosystemStatus /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
