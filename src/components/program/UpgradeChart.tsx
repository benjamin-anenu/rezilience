 import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   Area,
   ComposedChart,
   Bar,
 } from 'recharts';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { upgradeChartData } from '@/data/mockData';
 
 export function UpgradeChart() {
   return (
     <Card className="border-border bg-card">
       <CardHeader>
         <CardTitle className="flex items-center justify-between font-display text-lg uppercase tracking-tight">
           <span>UPGRADE FREQUENCY</span>
           <span className="font-mono text-sm font-normal text-muted-foreground">
             Last 12 months
           </span>
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className="h-[300px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <ComposedChart data={upgradeChartData}>
               <CartesianGrid
                 strokeDasharray="3 3"
                 stroke="hsl(var(--border))"
                 vertical={false}
               />
               <XAxis
                 dataKey="month"
                 axisLine={false}
                 tickLine={false}
                 tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
               />
               <YAxis
                 yAxisId="left"
                 axisLine={false}
                 tickLine={false}
                 tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                 domain={[0, 5]}
                 label={{
                   value: 'Upgrades',
                   angle: -90,
                   position: 'insideLeft',
                   fill: 'hsl(var(--muted-foreground))',
                   fontSize: 10,
                 }}
               />
               <YAxis
                 yAxisId="right"
                 orientation="right"
                 axisLine={false}
                 tickLine={false}
                 tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                 domain={[70, 100]}
                 label={{
                   value: 'Score',
                   angle: 90,
                   position: 'insideRight',
                   fill: 'hsl(var(--muted-foreground))',
                   fontSize: 10,
                 }}
               />
               <Tooltip
                 contentStyle={{
                   backgroundColor: 'hsl(var(--card))',
                   border: '1px solid hsl(var(--border))',
                   borderRadius: '2px',
                   fontFamily: 'JetBrains Mono, monospace',
                   fontSize: '12px',
                 }}
                 labelStyle={{ color: 'hsl(var(--foreground))' }}
               />
               <Bar
                 yAxisId="left"
                 dataKey="upgrades"
                 fill="hsl(var(--primary) / 0.3)"
                 radius={[2, 2, 0, 0]}
                 name="Upgrades"
               />
               <Line
                 yAxisId="right"
                 type="monotone"
                 dataKey="score"
                 stroke="hsl(var(--primary))"
                 strokeWidth={2}
                 dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                 activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                 name="Score"
               />
             </ComposedChart>
           </ResponsiveContainer>
         </div>
       </CardContent>
     </Card>
   );
 }