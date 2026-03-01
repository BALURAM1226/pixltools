import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    useReactFlow,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import './JSONVisualizer.css';
import { Maximize2, X, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

/* ── Custom Node component ────────────────────────────── */
const JSONNode = ({ data }) => {
    const getTypeClass = (val) => {
        if (val === null) return 'null';
        if (Array.isArray(val)) return 'complex';
        if (typeof val === 'object') return 'complex';
        return typeof val;
    };

    return (
        <div className="json-node-premium">
            <div className={`node-label ${data.type || 'object'}`}>
                <span>{data.label}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                    {data.type === 'array' ? `[${data.count}]` : data.type === 'object' ? `{ ${data.count} }` : ''}
                </span>
            </div>
            <Handle type="target" position={Position.Left} style={{ left: '-6px', background: '#6366f1' }} />
            <div className="node-content">
                <table className="node-table">
                    <tbody>
                        {data.entries.map(([key, value], i) => (
                            <tr key={i}>
                                <td className="node-key">{key}</td>
                                <td className={`node-value ${getTypeClass(value)}`}>
                                    {typeof value === 'object' && value !== null
                                        ? Array.isArray(value) ? `Array [${value.length}]` : 'Object { }'
                                        : String(value)}
                                </td>
                                <td className="node-handle-cell">
                                    {typeof value === 'object' && value !== null && (
                                        <Handle
                                            id={key.toString()}
                                            type="source"
                                            position={Position.Right}
                                            style={{ top: '50%', right: '-10px' }}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const nodeTypes = {
    jsonNode: JSONNode,
};

/* ── Graph Builder Logic ─────────────────────────────── */
function buildGraph(jsonData) {
    const nodes = [];
    const edges = [];
    let nodeId = 0;

    function traverse(data, label = 'Root', parentId = null, parentKey = null, depth = 0) {
        const id = `node-${nodeId++}`;
        const entries = [];
        let type = 'object';
        let count = 0;

        if (Array.isArray(data)) {
            type = 'array';
            count = data.length;
            data.forEach((val, idx) => {
                entries.push([idx.toString(), val]);
            });
        } else if (typeof data === 'object' && data !== null) {
            type = 'object';
            count = Object.keys(data).length;
            Object.entries(data).forEach(([k, v]) => {
                entries.push([k, v]);
            });
        } else {
            // Primitive root
            type = 'primitive';
            entries.push(['value', data]);
        }

        if (depth === 0) type = 'root';

        nodes.push({
            id,
            type: 'jsonNode',
            data: { label, entries, type, count },
            position: { x: 0, y: 0 },
        });

        if (parentId && parentKey !== null) {
            edges.push({
                id: `e-${parentId}-${parentKey}-${id}`,
                source: parentId,
                target: id,
                sourceHandle: parentKey.toString(),
                animated: true,
            });
        }

        // Child traversal
        entries.forEach(([key, val]) => {
            if (typeof val === 'object' && val !== null) {
                traverse(val, key, id, key, depth + 1);
            }
        });
    }

    traverse(jsonData);
    return { nodes, edges };
}

const getLayoutedElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', nodesep: 70, ranksep: 100 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 260, height: 180 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = Position.Left;
        node.sourcePosition = Position.Right;
        node.position = {
            x: nodeWithPosition.x - 130,
            y: nodeWithPosition.y - 90,
        };
    });

    return { nodes, edges };
};

export function JSONFlow({ data, onReady, onClose }) {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const { nodes: n, edges: e } = buildGraph(data);
        return getLayoutedElements(n, e);
    }, [data]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView } = useReactFlow();

    // Re-sync if data changes
    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
        const timer = setTimeout(() => {
            fitView({ padding: 0.4, duration: 600 });
        }, 100);
        return () => clearTimeout(timer);
    }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

    const [isDownloading, setIsDownloading] = React.useState(false);

    React.useEffect(() => {
        if (onReady) onReady(initialNodes.length);
    }, [initialNodes, onReady]);

    const handleDownload = useCallback(() => {
        const element = document.querySelector('.react-flow__viewport');
        if (!element || isDownloading) return;

        setIsDownloading(true);
        toPng(element, {
            backgroundColor: '#0b0e14',
            width: element.offsetWidth,
            height: element.offsetHeight,
            style: {
                margin: '5px',
                transform: 'translate(0,0) scale(1)',
            },
        }).then((dataUrl) => {
            saveAs(dataUrl, `json-graph-${new Date().getTime()}.png`);
            setIsDownloading(false);
        }).catch(() => {
            setIsDownloading(false);
        });
    }, [isDownloading]);

    return (
        <div className="json-visualizer-overlay fade-in">
            <div className="visualizer-header">
                <div className="vis-title">
                    <Maximize2 size={20} />
                    <span>JSON Graph Visualizer</span>
                </div>
                <div className="vis-actions">
                    <button
                        className="vis-download-btn"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        title="Download as PNG"
                    >
                        {isDownloading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Download size={20} />
                        )}
                        <span>{isDownloading ? 'Exporting...' : 'Download Graph'}</span>
                    </button>
                    <button className="vis-close-btn" onClick={onClose} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="vis-flow-container">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onInit={() => fitView({ padding: 0.4 })}
                    data-theme="dark"
                    minZoom={0.01}
                    maxZoom={1.5}
                    fitView
                >
                    <Background color="#718096" variant="dots" gap={20} size={1} />
                    <Controls />
                </ReactFlow>
            </div>

            <div className="vis-footer">
                <p>💡 Click and drag to pan · Scroll to zoom · <b>{initialNodes.length} Nodes</b> generated</p>
            </div>
        </div>
    );
}

export default function JSONVisualizer({ data, onClose }) {
    const [, setNodeCount] = React.useState(0);
    return (
        <ReactFlowProvider>
            <JSONFlow data={data} onReady={setNodeCount} onClose={onClose} />
        </ReactFlowProvider>
    );
}
