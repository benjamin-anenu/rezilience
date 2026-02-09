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

  // Generate nodes and edges from data with organized tiered layout
  const { initialNodes, edges } = useMemo(() => {
    const nodesArr: Node<DependencyNodeData>[] = [];
    const edgesArr: Edge[] = [];

    // Center position for the main project
    const centerX = 600;
    const centerY = 350;

    // Categorize dependencies
    const criticalDeps = data.dependencies.filter(d => d.is_critical);
    const outdatedDeps = data.dependencies.filter(d => !d.is_critical && d.is_outdated);
    const healthyDeps = data.dependencies.filter(d => !d.is_critical && !d.is_outdated);

    // Main project node at center
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

    const nodeWidth = 180;
    const nodeHeight = 80;
    const horizontalGap = 30;
    const verticalGap = 40;

    // Critical dependencies - row above the project (top tier)
    const criticalRowY = centerY - 180;
    const criticalRowWidth = criticalDeps.length * (nodeWidth + horizontalGap) - horizontalGap;
    const criticalStartX = centerX - criticalRowWidth / 2 + nodeWidth / 2;

    criticalDeps.forEach((dep, index) => {
      const nodeId = `dep-${dep.id}`;
      nodesArr.push({
        id: nodeId,
        type: 'dependency',
        position: { x: criticalStartX + index * (nodeWidth + horizontalGap) - nodeWidth / 2, y: criticalRowY },
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
        animated: true,
        style: { stroke: 'hsl(var(--destructive))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--destructive))',
        },
      });
    });

    // Outdated dependencies - left column
    const outdatedColX = centerX - 280;
    const outdatedColHeight = outdatedDeps.length * (nodeHeight + verticalGap) - verticalGap;
    const outdatedStartY = centerY - outdatedColHeight / 2 + nodeHeight / 2;

    outdatedDeps.forEach((dep, index) => {
      const nodeId = `dep-${dep.id}`;
      nodesArr.push({
        id: nodeId,
        type: 'dependency',
        position: { x: outdatedColX - nodeWidth / 2, y: outdatedStartY + index * (nodeHeight + verticalGap) - nodeHeight / 2 },
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

      const edgeColor = (dep.months_behind || 0) >= 6 
        ? 'hsl(var(--destructive))' 
        : 'hsl(45 93% 47%)';

      edgesArr.push({
        id: `edge-${nodeId}`,
        source: nodeId,
        target: 'project',
        type: 'smoothstep',
        style: { stroke: edgeColor, strokeWidth: 1 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
        },
      });
    });

    // Healthy dependencies - right column
    const healthyColX = centerX + 280;
    const healthyColHeight = healthyDeps.length * (nodeHeight + verticalGap) - verticalGap;
    const healthyStartY = centerY - healthyColHeight / 2 + nodeHeight / 2;

    healthyDeps.forEach((dep, index) => {
      const nodeId = `dep-${dep.id}`;
      nodesArr.push({
        id: nodeId,
        type: 'dependency',
        position: { x: healthyColX - nodeWidth / 2, y: healthyStartY + index * (nodeHeight + verticalGap) - nodeHeight / 2 },
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
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 1 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      });
    });

    // Forks/Dependents below the project
    if (data.githubForks > 0) {
      nodesArr.push({
        id: 'forks',
        type: 'dependency',
        position: { x: centerX - nodeWidth / 2, y: centerY + 180 },
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
