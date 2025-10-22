import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { RepoInput } from './components/RepoInput';
import { Sidebar } from './components/Sidebar';
import { Graph } from './components/Graph';
import { processRepoData } from './services/graphUtils';
import { parseRepo } from './services/geminiService';
import type { RepoData, Node, Link, CustomizationOptions, Visibility, GraphData, TreeNode } from './types';
import { initialCustomizationOptions } from './constants';

const App: React.FC = () => {
    const [repoUrl, setRepoUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [repoData, setRepoData] = useState<RepoData | null>(null);
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [visibility, setVisibility] = useState<Visibility>({ nodes: {}, dependencies: {} });
    const [customization, setCustomization] = useState<CustomizationOptions>(initialCustomizationOptions);

    const handleVisualize = useCallback(async (url: string) => {
        setIsLoading(true);
        setError(null);
        setRepoData(null);
        setGraphData({ nodes: [], links: [] });
        try {
            const data = await parseRepo(url);
            setRepoData(data);
            const { nodes, links, initialVisibility } = processRepoData(data);
            setGraphData({ nodes, links });
            setVisibility(initialVisibility);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const filteredGraphData = useMemo(() => {
        if (!graphData.nodes.length) return { nodes: [], links: [] };

        const visibleNodes = graphData.nodes.filter(node => {
            if (node.type === 'dependency') {
                // Check dependency visibility map for dependency nodes
                return visibility.dependencies[node.id] === true;
            }
            // Check node visibility map for all other node types
            return visibility.nodes[node.id] === true;
        });

        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

        const visibleLinks = graphData.links.filter(link =>
            visibleNodeIds.has(link.source.id) && visibleNodeIds.has(link.target.id)
        );

        return { nodes: visibleNodes, links: visibleLinks };
    }, [graphData, visibility]);
    
    const handleNodeVisibilityChange = useCallback((nodeId: string, isVisible: boolean) => {
        if (!repoData) return;

        // This helper finds a node by ID in the tree and then recursively
        // applies the visibility state to it and all its descendants.
        const findAndSetVisibility = (nodes: TreeNode[], targetId: string, visibilityMap: Record<string, boolean>): boolean => {
            for (const node of nodes) {
                // If we found the node, start the recursive update from here.
                if (node.id === targetId) {
                    const recursiveSet = (currentNode: TreeNode) => {
                        visibilityMap[currentNode.id] = isVisible;
                        if (currentNode.children) {
                            currentNode.children.forEach(recursiveSet);
                        }
                    };
                    recursiveSet(node);
                    return true; // Indicate that we found and updated the node.
                }
                // If not found at this level, search in children.
                if (node.children) {
                    if (findAndSetVisibility(node.children, targetId, visibilityMap)) {
                        return true; // Found in a child branch.
                    }
                }
            }
            return false; // Not found in this branch of the tree.
        };

        setVisibility(prev => {
            const newNodesVisibility = { ...prev.nodes };
            findAndSetVisibility(repoData.tree, nodeId, newNodesVisibility);
            return {
                ...prev,
                nodes: newNodesVisibility,
            };
        });
    }, [repoData]);
    
    const handleDependencyVisibilityChange = useCallback((depId: string, isVisible: boolean) => {
       setVisibility(prev => ({
        ...prev,
        dependencies: { ...prev.dependencies, [depId]: isVisible },
      }));
    }, []);

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-900 text-gray-200">
            <Header />
            <main className="flex flex-1 overflow-hidden">
                <Sidebar
                    repoData={repoData}
                    visibility={visibility}
                    customization={customization}
                    onNodeVisibilityChange={handleNodeVisibilityChange}
                    onDependencyVisibilityChange={handleDependencyVisibilityChange}
                    onCustomizationChange={setCustomization}
                    graphData={graphData}
                />
                <div className="flex-1 flex flex-col relative">
                    <RepoInput onVisualize={handleVisualize} isLoading={isLoading} repoUrl={repoUrl} setRepoUrl={setRepoUrl} />
                    {isLoading && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-20">
                            <div className="text-center">
                                <svg className="animate-spin h-10 w-10 text-blue-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-lg">Analyzing repository... this may take a moment.</p>
                                <p className="text-sm text-gray-400">Gemini is building your repo graph!</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-20">
                            <div className="text-center p-8 bg-red-900 bg-opacity-50 rounded-lg">
                                <h3 className="text-xl text-red-300 mb-2">Analysis Failed</h3>
                                <p className="text-red-400">{error}</p>
                            </div>
                        </div>
                    )}
                    {!isLoading && !repoData && !error && (
                         <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <h2 className="text-2xl font-bold text-gray-300 mb-2">Welcome to RepoViz</h2>
                            <p className="max-w-md text-gray-400">
                                Enter a public GitHub repository URL above to generate an interactive visualization of its structure, dependencies, and tech stack.
                            </p>
                        </div>
                    )}
                    <div className="flex-1 w-full h-full">
                         <Graph graphData={filteredGraphData} customization={customization} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;