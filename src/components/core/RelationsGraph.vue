<template>
    <div ref="svgContainer"></div>
</template>
  
<script lang="ts">
import { ref, onMounted, defineComponent, type PropType, watch } from 'vue';
import * as d3 from 'd3';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "RelationsGraph",
    props: {
        nodes: {
            type: Object as PropType<any>,
            required: true
        },
        links: {
            type: Object as PropType<any>,
            required: true
        }
    },
    setup(props) {
        const svgContainer = ref(null);
        const rendered = ref(false);
        const i18n = useI18n();
    
        onMounted(() => {
            createForceLayout(svgContainer.value);
        });

        watch(() => props.nodes, () => {
            createForceLayout(svgContainer.value);
        });

        watch(() => props.links, () => {
            createForceLayout(svgContainer.value);
        });

        watch(i18n.locale, () => {
            d3.select(svgContainer.value).selectAll("*").remove();
            rendered.value = false;
            createForceLayout(svgContainer.value);
        });

        const removeDuplicates = (nodes: any) => {
            const index: any = [];
            return nodes.filter(function (item: any) {
                const k = JSON.stringify(item);
                return index.indexOf(k) >= 0 ? false : index.push(k);
            });
        };
    
        function createForceLayout(container: any) {
            if(!props.nodes || !props.links || rendered.value) {
                return;
            }
            
            const uniqueNodes = removeDuplicates(props.nodes);

            rendered.value = true;

            d3.select(container).select("svg").remove();
    
            const height = 500;
            const node_width = 85;

            const svg = d3.select(container)
                .append('svg')
                .attr('width', "100%")
                .attr('height', height);

            const width = container.clientWidth;
    
            const simulation = d3.forceSimulation(uniqueNodes)
                .force('link', d3.forceLink(props.links).id((d: any) => d.id).distance(200).strength(1))
                .force('charge', d3.forceManyBody().strength(-300))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .alphaDecay(0.05);
    
            const linkColors = props.links.map((d: any) => {
                if (d.label === "BELONGS_TO") {
                    return "#ff0000"; // Red color
                } else if (d.label === "MEMBER_OF") {
                    return "#00ff00"; // Green color
                } else {
                    return "#999";
                }
            });

            const link = svg.selectAll('.link')
                .data(props.links)
                .enter().append('line')
                .attr('class', 'link')
                .attr('stroke-width', '3')
                .attr('marker-end', (d: any, i: number) => `url(#arrow-${i})`)
                .attr('stroke', (_: any, i: number) => linkColors[i]);

                        link.each(function(_: any, i: number) {
                            const marker = svg.append("marker")
                                .attr("id", `arrow-${i}`)
                                .attr("markerUnits", "strokeWidth")
                                .attr("markerWidth", 12)
                                .attr("markerHeight", 12)
                                .attr("viewBox", "0 0 12 12")
                                .attr("refX", 6)
                                .attr("refY", 6)
                                .attr("orient", "auto");

                            marker.append("path")
                                .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
                                .style("fill", linkColors[i]);
                        });
    
            const node = svg.selectAll(".node")
                .data(uniqueNodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", node_width)
                .attr("fill", "#69b3a2")
                .attr("stroke", "black")
                .call(d3.drag()
                    .on("start", dragStarted)
                    .on("drag", dragged)
                    .on("end", dragEnded))
                .on('click', (event: any, d: any) => seeOUPage(d.id));
    
            const nodeText = svg.selectAll('.node-text')
                .data(uniqueNodes)
                .enter().append('text')
                .attr('class', 'node-text')
                .text((d: any) => returnCurrentLocaleContent(d.name))
                .attr('text-anchor', 'middle')
                .attr('dy', '-0.5em')
                .attr('width', (d: any) => returnCurrentLocaleContent(d.name)!.length * 1.5)
                .attr('font-size', '12px')
                .style('text-wrap', 'stable')
                .on('click', (event: any, d: any) => seeOUPage(d.id));

            const legend = svg.append('g')
                .attr('class', 'legend')
                .attr('transform', `translate(0, ${500 - 70})`);

            legend.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 20)
                .attr('height', 20)
                .attr("stroke", "black")
                .attr('fill', '#ff0000');

            legend.append('rect')
                .attr('x', 0)
                .attr('y', 30)
                .attr('width', 20)
                .attr('height', 20)
                .attr("stroke", "black")
                .attr('fill', '#00ff00');

            legend.append('text')
                .attr('x', 30)
                .attr('y', 15)
                .text(i18n.t("belongsToLabel"))
                .style('font-size', '14px')
                .attr('alignment-baseline', 'middle');

            legend.append('text')
                .attr('x', 30)
                .attr('y', 45)
                .text(i18n.t("memberOfLabel"))
                .style('font-size', '14px')
                .attr('alignment-baseline', 'middle');

            function wrap(text: any) {
                text.each(function() {
                    const text = d3.select(this);
                    const words = returnCurrentLocaleContent(text.data()[0].name)!.split(/\s+/).reverse();
                    const lineHeight = 20;
                    const width = parseFloat(text.attr('width'));
                    const y = parseFloat(text.attr('y'));
                    const x = text.attr('x');
                    const anchor = text.attr('text-anchor');
                
                    let tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('text-anchor', anchor);
                    let lineNumber = 0;
                    let line: string[] = [];
                    let word = words.pop();

                    while (word) {
                        line.push(word);
                        tspan.text(line.join(' '));
                        if (tspan.node().getComputedTextLength() > width) {
                            lineNumber += 1;
                            line.pop();
                            tspan.text(line.join(' '));
                            line = [word];
                            tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * lineHeight).attr('anchor', anchor).text(word);
                        }
                        word = words.pop();
                    }
                });
            }

            function dragStarted(event: any, d: any) {
                if (!event.active) simulation.alphaTarget(0.1).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
    
            function dragged(event: any, d: any) {
                d.fx = event.x;
                d.fy = event.y;
            }
    
            function dragEnded(event: any, d: any) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
    
            simulation.on('tick', () => {
                link.attr('x1', (d: any) => d.source.x)
                    .attr('y1', (d: any) => d.source.y)
                    .attr('x2', (d: any) => {
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        const offsetX = (dx / length) * (node_width + 10);
                        return d.target.x - offsetX;
                    })
                    .attr('y2', (d: any) => {
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        const offsetY = (dy / length) * (node_width + 10);
                        return d.target.y - offsetY;
                    });
    
                node.attr('cx', (d: any) => d.x)
                    .attr('cy', (d: any) => d.y);

                nodeText.attr('x', (d: any) => d.x)
                        .attr('y', (d: any) => d.y - 30)
                        .call(wrap);
            });
        }

        const seeOUPage = (id: number) => {
            window.location.href = `/${i18n.locale.value.toLowerCase()}/organisation-units/${id}`;
        };
    
        return {
            svgContainer, rendered
        };
    },
});
</script>
