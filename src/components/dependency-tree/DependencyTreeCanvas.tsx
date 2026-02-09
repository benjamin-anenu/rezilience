import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type OnNodesChange,
  applyNodeChanges,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DependencyNode, type DependencyNodeData } from './DependencyNode';
import { NodeDetailPanel } from './NodeDetailPanel';
import { DependencyLegend } from './DependencyLegend';
import { TreeControls } from './TreeControls';
import type { DependencyGraphData, DependencyNode as DependencyNodeType } from '@/hooks/useDependencyGraph';

const nodeTypes = {
  dependency: DependencyNode,
};

interface DependencyTreeCanvasProps {
  data: DependencyGraphData;
}

export function DependencyTreeCanvas({ data }: DependencyTreeCanvasProps) {
  const [nodes, setNodes] = useState<Node<DependencyNodeData>[]>([]);
  const [selectedNode, setSelectedNode] = useState<{
    data: DependencyNodeData;
    cratesIoUrl?: string | null;
    npmUrl?: string | null;
    pypiUrl?: string | null;
  } | null>(null);

  // Generate nodes and edges from data
  const { initialNodes, edges } = useMemo(() => {
    const nodesArr: Node<DependencyNodeData>[] = [];
    const edgesArr: Edge[] = [];

    // Center position for the main project
    const centerX = 500;
    const centerY = 300;

    // Main project node
    nodesArr.push({
      id: 'project',
      type: 'dependency',
      position: { x: centerX, y: centerY },
      data: {
        label: data.projectName,
        type: 'project',
        forks: data.githubForks,
      },
    });

    // Dependencies on the left
    const deps = data.dependencies;
    const depSpacing = 80;
    const depStartY = centerY - ((deps.length - 1) * depSpacing) / 2;

    deps.forEach((dep, index) => {
      const nodeId = `dep-${dep.id}`;
      nodesArr.push({
        id: nodeId,
        type: 'dependency',
        position: { x: centerX - 350, y: depStartY + index * depSpacing },
        data: {
          label: dep.crate_name,
          type: 'dependency',
          version: dep.current_version,
          latestVersion: dep.latest_version,
          monthsBehind: dep.months_behind,
          isCritical: dep.is_critical,
          isOutdated: dep.is_outdated,
          dependents: dep.crates_io_dependents,
          dependencyType: dep.dependency_type,
        },
      });

      edgesArr.push({
        id: `edge-${nodeId}`,
        source: nodeId,
        target: 'project',
        type: 'smoothstep',
        animated: dep.is_critical,
        style: { 
          stroke: dep.is_outdated 
            ? dep.months_behind >= 6 
              ? 'hsl(var(--destructive))' 
              : 'hsl(45 93% 47%)' // amber
            : 'hsl(var(--muted-foreground))',
          strokeWidth: dep.is_critical ? 2 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: dep.is_outdated 
            ? dep.months_behind >= 6 
              ? 'hsl(var(--destructive))' 
              : 'hsl(45 93% 47%)'
            : 'hsl(var(--muted-foreground))',
        },
      });
    });

    // Forks/Dependents on the right (placeholder for future crates.io reverse deps)
    if (data.githubForks > 0) {
      nodesArr.push({
        id: 'forks',
        type: 'dependency',
        position: { x: centerX + 350, y: centerY },
        data: {
          label: 'GitHub Forks',
          type: 'dependent',
          dependents: data.githubForks,
        },
      });

      edgesArr.push({
        id: 'edge-forks',
        source: 'project',
        target: 'forks',
        type: 'smoothstep',
        style: { stroke: 'hsl(200 100% 50%)', strokeWidth: 1 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(200 100% 50%)',
        },
      });
    }

    return { initialNodes: nodesArr, edges: edgesArr };
  }, [data]);

  // Initialize nodes
  useState(() => {
    setNodes(initialNodes);
  });

  const onNodesChange: OnNodesChange<Node<DependencyNodeData>> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds) as Node<DependencyNodeData>[]),
    []
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<DependencyNodeData>) => {
      const dep = data.dependencies.find((d) => `dep-${d.id}` === node.id);
      setSelectedNode({
        data: node.data,
        cratesIoUrl: dep?.crates_io_url,
        npmUrl: dep?.npm_url,
        pypiUrl: dep?.pypi_url,
      });
    },
    [data.dependencies]
  );

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={initialNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted-foreground) / 0.2)" />
        <TreeControls />
      </ReactFlow>
      <DependencyLegend />
      <NodeDetailPanel
        open={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        nodeData={selectedNode?.data || null}
        cratesIoUrl={selectedNode?.cratesIoUrl}
        npmUrl={selectedNode?.npmUrl}
        pypiUrl={selectedNode?.pypiUrl}
      />
    </div>
  );
}
