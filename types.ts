
import * as d3 from 'd3';

export interface TreeNode {
    id: string;
    name: string;
    type: 'folder' | 'file';
    path: string;
    children?: TreeNode[];
}

export interface Dependency {
    name: string;
    type: 'frontend' | 'backend' | 'dev' | 'general';
}

export interface LanguageUsage {
    language: string;
    percentage: number;
}

export interface RepoData {
    name: string;
    description: string;
    languages: LanguageUsage[];
    dependencies: Dependency[];
    tree: TreeNode[];
}

export interface Node extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    type: 'repo' | 'folder' | 'file' | 'language' | 'dependency';
    data?: any;
    radius: number;
    color: string;
    // Fix: Add properties from d3.SimulationNodeDatum to resolve TypeScript errors in Graph.tsx
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
    source: Node;
    target: Node;
}

export interface GraphData {
    nodes: Node[];
    links: Link[];
}

export interface Visibility {
    nodes: { [key: string]: boolean };
    dependencies: { [key: string]: boolean };
}

export type LayoutType = 'force' | 'radial' | 'hierarchical';

export interface CustomizationOptions {
    layout: LayoutType;
    nodeColors: {
        repo: string;
        folder: string;
        file: string;
        language: string;
        dependency: string;
    };
    linkStyle: {
        color: string;
        strokeWidth: number;
    };
}

export type D3SVGElement = d3.Selection<SVGSVGElement | null, unknown, null, undefined>;
export type D3LinkElement = d3.Selection<SVGLineElement, Link, SVGGElement, unknown>;
export type D3NodeElement = d3.Selection<SVGGElement, Node, SVGGElement, unknown>;
