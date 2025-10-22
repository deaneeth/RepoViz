
import React, { useState, FC, useMemo } from 'react';
import type { RepoData, Visibility, CustomizationOptions, TreeNode, GraphData, Dependency } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface SidebarProps {
    repoData: RepoData | null;
    visibility: Visibility;
    customization: CustomizationOptions;
    graphData: GraphData;
    onNodeVisibilityChange: (nodeId: string, isVisible: boolean) => void;
    onDependencyVisibilityChange: (depId: string, isVisible: boolean) => void;
    onCustomizationChange: (options: CustomizationOptions) => void;
}

const CollapsibleSection: FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left font-semibold hover:bg-gray-700">
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-3 bg-gray-800">{children}</div>}
        </div>
    );
};

const FileTree: FC<{
  nodes: TreeNode[];
  visibility: Visibility['nodes'];
  onVisibilityChange: (nodeId: string, isVisible: boolean) => void;
  level?: number;
}> = ({ nodes, visibility, onVisibilityChange, level = 0 }) => {
    return (
        <div>
            {nodes.map(node => (
                <div key={node.id} style={{ marginLeft: `${level * 16}px` }}>
                    <label className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-600 rounded px-1">
                        <input
                            type="checkbox"
                            checked={visibility[node.id] ?? false}
                            onChange={(e) => onVisibilityChange(node.id, e.target.checked)}
                            className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">{node.name}</span>
                    </label>
                    {node.children && <FileTree nodes={node.children} visibility={visibility} onVisibilityChange={onVisibilityChange} level={level + 1} />}
                </div>
            ))}
        </div>
    );
};

export const Sidebar: FC<SidebarProps> = ({ repoData, visibility, customization, onNodeVisibilityChange, onDependencyVisibilityChange, onCustomizationChange, graphData }) => {
    
    const dependenciesByType = useMemo(() => {
        if (!repoData) return {};
        // Fix: Use a generic argument for reduce to ensure correct type inference.
        return repoData.dependencies.reduce<Record<string, Dependency[]>>((acc, dep) => {
            (acc[dep.type] = acc[dep.type] || []).push(dep);
            return acc;
        }, {});
    }, [repoData]);
    
    if (!repoData) {
        return <aside className="w-80 bg-gray-800 border-r border-gray-700 p-4 text-gray-400">Please visualize a repository to see options.</aside>;
    }

    return (
        <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700">
                <h2 className="text-xl font-bold truncate">{repoData.name}</h2>
                <p className="text-sm text-gray-400 truncate">{repoData.description}</p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <CollapsibleSection title="File Structure">
                    <FileTree nodes={repoData.tree} visibility={visibility.nodes} onVisibilityChange={onNodeVisibilityChange} />
                </CollapsibleSection>
                <CollapsibleSection title="Dependencies">
                     {Object.entries(dependenciesByType).map(([type, deps]) => (
                        <div key={type} className="mb-2">
                            <h4 className="font-semibold capitalize text-gray-300 mb-1">{type}</h4>
                            {deps.map(dep => (
                                 <label key={dep.name} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-600 rounded px-1">
                                    <input
                                        type="checkbox"
                                        checked={visibility.dependencies[`dep-${dep.name}`] ?? false}
                                        onChange={e => onDependencyVisibilityChange(`dep-${dep.name}`, e.target.checked)}
                                        className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-sm">{dep.name}</span>
                                </label>
                            ))}
                        </div>
                    ))}
                </CollapsibleSection>
                 <CollapsibleSection title="Customization">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Layout</label>
                            <select
                                value={customization.layout}
                                onChange={e => onCustomizationChange({ ...customization, layout: e.target.value as any })}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                            >
                                <option value="force">Force-Directed</option>
                                <option value="radial">Radial</option>
                                <option value="hierarchical">Hierarchical</option>
                            </select>
                        </div>
                        <div>
                             <h4 className="text-sm font-medium text-gray-300 mb-2">Node Colors</h4>
                             {Object.entries(customization.nodeColors).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between mb-1">
                                    <label className="capitalize text-sm">{key}</label>
                                    <input
                                        type="color"
                                        value={value}
                                        onChange={e => onCustomizationChange({ ...customization, nodeColors: { ...customization.nodeColors, [key]: e.target.value }})}
                                        className="w-8 h-8 p-0 border-none rounded bg-gray-700 cursor-pointer"
                                    />
                                </div>
                             ))}
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        </aside>
    );
};