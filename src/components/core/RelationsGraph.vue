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
            console.log(uniqueNodes);

            rendered.value = true;

            d3.select(container).select("svg").remove();
    
            const height = 500;

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

            // svg.append('defs').append('marker')
            // .attrs({'id':'arrowhead',
            //     'viewBox':'-0 -5 10 10',
            //     'refX':13,
            //     'refY':0,
            //     'orient':'auto',
            //     'markerWidth':13,
            //     'markerHeight':13,
            //     'xoverflow':'visible'})
            // .append('svg:path')
            // .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            // .attr('fill', '#999')
            // .style('stroke','none');
    
            const link = svg.selectAll('.link')
                .data(props.links)
                .enter().append('line')
                .attr('class', 'link')
                .attr('stroke', '#999')
                .attr('stroke-width', '3')
                .attr('marker-end', 'url(#arrow)');
    
            const linkText = svg.selectAll('.link-text')
                .data(props.links)
                .enter().append('text')
                .attr('class', 'link-text')
                .text((d: any) => d.label)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px');
    
            const node = svg.selectAll('.node')
                .data(uniqueNodes)
                .enter().append('circle')
                .attr('class', 'node')
                .attr('r', 70)
                .attr('fill', '#69b3a2')
                .call(d3.drag()
                    .on('start', dragStarted)
                    .on('drag', dragged)
                    .on('end', dragEnded))
                .on('click', (event: any, d: any) => seeOUPage(d.id));
    
            const nodeText = svg.selectAll('.node-text')
                .data(uniqueNodes)
                .enter().append('text')
                .attr('class', 'node-text')
                .text((d: any) => returnCurrentLocaleContent(d.name))
                .attr('text-anchor', 'middle')
                .attr('dy', '-0.5em')
                .attr('font-size', '12px')
                .style('text-wrap', 'stable')
                .on('click', (event: any, d: any) => seeOUPage(d.id));
    
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
                    .attr('x2', (d: any) => d.target.x)
                    .attr('y2', (d: any) => d.target.y);
    
                linkText.attr('x', (d: any) => (d.source.x + d.target.x) / 2)
                    .attr('y', (d: any) => (d.source.y + d.target.y) / 2);
    
                node.attr('cx', (d: any) => d.x)
                    .attr('cy', (d: any) => d.y);
    
                nodeText.attr('x', (d: any) => d.x)
                        .attr('y', (d: any) => d.y);
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
