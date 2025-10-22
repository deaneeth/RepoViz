
import type { RepoData, TreeNode, Node, Link, Visibility } from '../types';

export const processRepoData = (data: RepoData): { nodes: Node[], links: Link[], initialVisibility: Visibility } => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const visibility: Visibility = { nodes: {}, dependencies: {} };

    // 1. Repo root node
    const repoNode: Node = {
        id: 'repo-root',
        name: data.name,
        type: 'repo',
        radius: 30,
        color: '', // will be set by customization
    };
    nodes.push(repoNode);
    visibility.nodes[repoNode.id] = true;

    // 2. Language nodes
    const languageNodes: Node[] = data.languages.map(langInfo => ({
        id: `lang-${langInfo.language}`,
        name: langInfo.language,
        type: 'language',
        radius: 12,
        color: '',
        data: { percentage: langInfo.percentage },
    }));
    nodes.push(...languageNodes);
    languageNodes.forEach(langNode => {
        links.push({ source: repoNode, target: langNode });
        visibility.nodes[langNode.id] = true;
    });

    // 3. Dependency nodes
    const dependencyNodes: Node[] = data.dependencies.map(dep => ({
        id: `dep-${dep.name}`,
        name: dep.name,
        type: 'dependency',
        radius: 10,
        color: '',
        data: { type: dep.type },
    }));
    nodes.push(...dependencyNodes);
    dependencyNodes.forEach(depNode => {
        links.push({ source: repoNode, target: depNode });
        visibility.dependencies[depNode.id] = true; // Use separate visibility for deps
    });

    // 4. File tree nodes and links
    const processTree = (treeNodes: TreeNode[], parentNode: Node) => {
        treeNodes.forEach(item => {
            const node: Node = {
                id: item.path,
                name: item.name,
                type: item.type,
                radius: item.type === 'folder' ? 15 : 8,
                color: '',
                data: { path: item.path },
            };
            nodes.push(node);
            links.push({ source: parentNode, target: node });
            visibility.nodes[node.id] = true;

            if (item.type === 'folder' && item.children) {
                processTree(item.children, node);
            }
        });
    };

    processTree(data.tree, repoNode);

    // D3 needs nodes/links to be objects, not just ids. We'll find them.
    const findNode = (id: string) => nodes.find(n => n.id === id)!;

    const finalLinks = links.map(link => ({
        source: findNode((link.source as Node).id),
        target: findNode((link.target as Node).id),
    }));

    return { nodes, links: finalLinks, initialVisibility: visibility };
};
