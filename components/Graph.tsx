import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphData, CustomizationOptions, Node, Link, D3SVGElement, D3NodeElement, D3LinkElement } from '../types';

interface GraphProps {
    graphData: GraphData;
    customization: CustomizationOptions;
}

export const Graph: React.FC<GraphProps> = ({ graphData, customization }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    // Fix: Initialize useRef with null and update type to allow null to fix "Expected 1 arguments, but got 0" error.
    const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null);
    // Fix: Initialize useRef with null and update type to allow null to fix "Expected 1 arguments, but got 0" error.
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    useEffect(() => {
        if (!svgRef.current || !graphData.nodes.length) {
            d3.select(svgRef.current).selectAll('*').remove();
            return;
        }

        const svg = d3.select(svgRef.current);
        const width = svg.node()!.getBoundingClientRect().width;
        const height = svg.node()!.getBoundingClientRect().height;

        // Clean up previous elements
        svg.selectAll('*').remove();

        const container = svg.append('g');
        let link: D3LinkElement = container.append("g").attr("class", "links").selectAll("line");
        let node: D3NodeElement = container.append("g").attr("class", "nodes").selectAll("g");

        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "12px");

        const updateGraph = () => {
            const { nodes, links } = graphData;

            // Update nodes
            node = node.data(nodes, d => d.id)
                .join(
                    enter => {
                        const g = enter.append("g")
                            .call(drag(simulationRef.current!));

                        g.append("circle")
                            .attr("r", d => d.radius)
                            .attr("fill", d => customization.nodeColors[d.type] || '#ccc');

                        g.append("text")
                            .text(d => d.name)
                            .attr("x", d => d.radius + 5)
                            .attr("y", 5)
                            .attr("fill", "white")
                            .style("font-size", "10px")
                            .style("pointer-events", "none");

                        g.on("mouseover", (event, d) => {
                                tooltip.style("visibility", "visible").text(`Type: ${d.type}\nPath: ${d.data?.path || d.id}`);
                            })
                            .on("mousemove", (event) => {
                                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                            })
                            .on("mouseout", () => {
                                tooltip.style("visibility", "hidden");
                            });

                        return g;
                    },
                    update => {
                        update.select("circle").attr("fill", d => customization.nodeColors[d.type] || '#ccc');
                        return update;
                    },
                    exit => exit.remove()
                );

            // Update links
            link = link.data(links, d => `${(d.source as Node).id}-${(d.target as Node).id}`)
                .join(
                    enter => enter.append("line")
                        .attr("stroke", customization.linkStyle.color)
                        .attr("stroke-width", customization.linkStyle.strokeWidth),
                    update => update
                        .attr("stroke", customization.linkStyle.color)
                        .attr("stroke-width", customization.linkStyle.strokeWidth),
                    exit => exit.remove()
                );

            simulationRef.current?.nodes(nodes);
            simulationRef.current?.force<d3.ForceLink<Node, Link>>("link")?.links(links);
            simulationRef.current?.alpha(0.3).restart();
        };

        if (!simulationRef.current) {
            simulationRef.current = d3.forceSimulation<Node>()
                .force("link", d3.forceLink<Node, Link>().id(d => d.id).distance(50))
                .force("charge", d3.forceManyBody().strength(-100))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .on("tick", () => {
                    link
                        .attr("x1", d => (d.source as Node).x!)
                        .attr("y1", d => (d.source as Node).y!)
                        .attr("x2", d => (d.target as Node).x!)
                        .attr("y2", d => (d.target as Node).y!);

                    node.attr("transform", d => `translate(${d.x},${d.y})`);
                });
        }
        
        // Apply layout changes
        const sim = simulationRef.current;
        if (customization.layout === 'radial') {
            sim.force("center", d3.forceCenter(width / 2, height / 2));
            sim.force("charge", d3.forceManyBody().strength(-50));
            sim.force("r", d3.forceRadial(Math.min(width, height)/3, width / 2, height / 2).strength(0.5));
            sim.force("x", null);
            sim.force("y", null);
        } else if (customization.layout === 'hierarchical') {
            sim.force("center", null);
            sim.force("r", null);
            sim.force("charge", d3.forceManyBody().strength(-150));
            sim.force("y", d3.forceY(height / 2).strength(0.05));
            sim.force("x", d3.forceX(width / 2).strength(0.02));
        } else { // force
            sim.force("center", d3.forceCenter(width / 2, height / 2));
            sim.force("charge", d3.forceManyBody().strength(-100));
            sim.force("r", null);
            sim.force("x", null);
            sim.force("y", null);
        }

        // Drag handlers
        const drag = (simulation: d3.Simulation<Node, undefined>) => {
            const dragstarted = (event: d3.D3DragEvent<SVGGElement, Node, any>, d: Node) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            };
            const dragged = (event: d3.D3DragEvent<SVGGElement, Node, any>, d: Node) => {
                d.fx = event.x;
                d.fy = event.y;
            };
            const dragended = (event: d3.D3DragEvent<SVGGElement, Node, any>, d: Node) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            };
            return d3.drag<SVGGElement, Node>().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        };
        
        if (!zoomRef.current) {
            zoomRef.current = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([0.1, 4])
                .on('zoom', (event) => {
                    container.attr('transform', event.transform);
                });
            svg.call(zoomRef.current);
        }
        
        updateGraph();

        return () => {
            // Cleanup tooltip on component unmount
            tooltip.remove();
        };

    }, [graphData, customization]);

    return (
        <svg ref={svgRef} className="w-full h-full bg-gray-900 cursor-grab"></svg>
    );
};
