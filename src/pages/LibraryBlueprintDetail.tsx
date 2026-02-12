import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { BlueprintNode, type BlueprintNodeData } from '@/components/library/BlueprintNode';
import { getBlueprintBySlug } from '@/data/blueprints';
import NotFound from './NotFound';

const nodeTypes = { blueprint: BlueprintNode };

export default function LibraryBlueprintDetail() {
  const { slug } = useParams<{ slug: string }>();
  const blueprint = slug ? getBlueprintBySlug(slug) : undefined;

  const { nodes, edges } = useMemo(() => {
    if (!blueprint) return { nodes: [], edges: [] };

    const ns: Node<BlueprintNodeData>[] = [];
    const es: Edge[] = [];

    const nodeWidth = 320;
    const verticalGap = 340;
    const centerX = 500;

    // Goal node at top
    ns.push({
      id: 'goal',
      type: 'blueprint',
      position: { x: centerX - nodeWidth / 2, y: 0 },
      data: {
        label: blueprint.title,
        description: blueprint.description,
        type: 'goal',
        tools: [],
        dependencies: [],
      },
    });

    // Step nodes below
    const cols = Math.min(blueprint.steps.length, 2);
    const totalWidth = cols * (nodeWidth + 80) - 80;
    const startX = centerX - totalWidth / 2;

    blueprint.steps.forEach((step, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const nodeId = step.id;

      ns.push({
        id: nodeId,
        type: 'blueprint',
        position: {
          x: startX + col * (nodeWidth + 80),
          y: 120 + (row + 1) * verticalGap,
        },
        data: {
          label: step.title,
          description: step.description,
          type: 'step',
          stepNumber: i + 1,
          language: step.language,
          alternatives: step.alternatives,
          tools: step.tools,
          dependencies: step.dependencies,
          apis: step.apis,
          estimatedCost: step.estimatedCost,
          docsUrl: step.docsUrl,
          dictionaryTerms: step.dictionaryTerms,
          protocolSlugs: step.protocolSlugs,
        },
      });

      // Connect to previous step or goal
      const sourceId = i === 0 ? 'goal' : blueprint.steps[i - 1].id;
      es.push({
        id: `edge-${nodeId}`,
        source: sourceId,
        target: nodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
      });
    });

    return { nodes: ns, edges: es };
  }, [blueprint]);

  if (!blueprint) return <NotFound />;

  return (
    <Layout>
      <section className="container mx-auto px-4 py-8 lg:px-8">
        <Link to="/library/blueprints" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Back to Blueprints
        </Link>
        <div className="mb-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">BLUEPRINT</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{blueprint.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{blueprint.description}</p>
          <p className="mt-3 font-mono text-[10px] text-muted-foreground/60">
            ⚠ Cost estimates are approximate. Verify current pricing on provider websites.
          </p>
        </div>
      </section>

      <div className="h-[70vh] w-full border-y border-border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="bg-background"
          nodesDraggable={false}
          nodesConnectable={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted-foreground) / 0.15)" />
        </ReactFlow>
      </div>
    </Layout>
  );
}
