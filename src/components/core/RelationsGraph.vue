<template>
    <section class="relations-hierarchy" :aria-label="$t('hierarchyTitle')" :aria-busy="loading">
        <div ref="container" class="graph-canvas">
            <svg
                ref="svgElement" class="hierarchy-svg" :aria-label="$t('hierarchyTitle')" tabindex="0"
                @pointerdown="focusGraph" @keydown="handleKeydown" />
            <div v-if="loading" class="graph-message" role="status">
                {{ $t('hierarchyLoadingLabel') }}
            </div>
            <div v-else-if="!nodes?.length" class="graph-message">
                {{ $t('noDataInTableMessage') }}
            </div>
            <div v-if="nodes?.length" class="graph-controls">
                <button type="button" :aria-label="$t('hierarchyZoomInLabel')" :title="$t('hierarchyZoomInLabel')" @click="zoomBy(1.25)">
                    <span class="mdi mdi-plus" aria-hidden="true" />
                </button>
                <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
                <button type="button" :aria-label="$t('hierarchyZoomOutLabel')" :title="$t('hierarchyZoomOutLabel')" @click="zoomBy(0.8)">
                    <span class="mdi mdi-minus" aria-hidden="true" />
                </button>
                <span class="control-divider" />
                <button type="button" :aria-label="$t('hierarchyFitLabel')" :title="$t('hierarchyFitLabel')" @click="fitGraph">
                    <span class="mdi mdi-arrow-expand-all" aria-hidden="true" />
                </button>
            </div>
            <span v-if="nodes?.length" class="canvas-hint">{{ $t('hierarchyPanHint') }}</span>
        </div>
        <footer class="hierarchy-footer">
            <div class="hierarchy-legend">
                <span><i class="legend-line" />{{ $t('belongsToLabel') }}</span>
                <span><i class="legend-line membership" />{{ $t('memberOfLabel') }}</span>
            </div>
        </footer>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import * as d3 from 'd3';
import { CARD_WIDTH, CARD_HEIGHT, layoutOrganisationHierarchy, routeHierarchyLink, type RelationNode, type RelationLink, type PositionedRelationNode } from '@/utils/organisationHierarchy';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';

const props = defineProps<{ nodes?: RelationNode[]; links?: RelationLink[]; currentId?: number }>();
const { t, locale } = useI18n();
const loading = computed(() => !props.nodes || !props.links);
const container = ref<HTMLElement>();
const svgElement = ref<SVGSVGElement>();
const zoomLevel = ref(1);
let zoom: ReturnType<typeof d3.zoom>;
let observer: ResizeObserver;
let graphBounds = { left: 0, top: 0, width: 0, height: 0 };
let instanceId = '';
let previousWidth = 0;

const color = (label: RelationLink['label']) => label === 'BELONGS_TO' ? '#6366f1' : '#0d9488';
function focusGraph(event: PointerEvent) {
    if (event.button !== 0 || (event.target as Element).closest('a')) return;
    svgElement.value?.focus({ preventScroll: true });
}
function zoomBy(factor: number) {
    if (zoom && svgElement.value) d3.select(svgElement.value).call(zoom.scaleBy, factor);
}
function fitGraph() {
    if (!zoom || !container.value || !graphBounds.width) return;
    const { clientWidth: width, clientHeight: height } = container.value;
    if (!width || !height) return;
    const scale = Math.max(0.12, Math.min(1, (width - 72) / graphBounds.width, (height - 110) / graphBounds.height));
    const x = width / 2 - (graphBounds.left + graphBounds.width / 2) * scale;
    const y = (height - 50) / 2 - (graphBounds.top + graphBounds.height / 2) * scale;
    d3.select(svgElement.value).call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
}
function handleKeydown(event: KeyboardEvent) {
    if (event.target !== svgElement.value || !zoom) return;
    if (event.key === '+' || event.key === '=') zoomBy(1.25);
    else if (event.key === '-') zoomBy(0.8);
    else if (event.key === '0') fitGraph();
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const k = zoomLevel.value;
        d3.select(svgElement.value).call(zoom.translateBy,
            event.key === 'ArrowLeft' ? 60 / k : event.key === 'ArrowRight' ? -60 / k : 0,
            event.key === 'ArrowUp' ? 60 / k : event.key === 'ArrowDown' ? -60 / k : 0);
    } else return;
    event.preventDefault();
}

function renderGraph() {
    if (!svgElement.value) return;
    const svg = d3.select(svgElement.value);
    svg.selectAll('*').remove();
    const graph = layoutOrganisationHierarchy(props.nodes ?? [], props.links ?? []);
    const byId = new Map(graph.nodes.map(node => [node.id, node]));
    const defs = svg.append('defs');
    const gridId = `${instanceId}-grid`;
    const grid = defs.append('pattern').attr('id', gridId)
        .attr('patternUnits', 'userSpaceOnUse').attr('width', 24).attr('height', 24);
    grid.append('circle').attr('cx', 12).attr('cy', 12).attr('r', 1).attr('fill', '#cbd5e1');
    svg.append('rect').attr('width', '100%').attr('height', '100%')
        .attr('fill', '#f8fafc').attr('pointer-events', 'none').attr('aria-hidden', 'true');
    svg.append('rect').attr('width', '100%').attr('height', '100%')
        .attr('fill', `url(#${gridId})`).attr('pointer-events', 'none').attr('aria-hidden', 'true');
    for (const label of ['BELONGS_TO', 'MEMBER_OF'] as const) {
        defs.append('marker').attr('id', `${instanceId}-${label}`).attr('viewBox', '0 0 10 10')
            .attr('refX', 9).attr('refY', 5).attr('markerWidth', 7).attr('markerHeight', 7).attr('orient', 'auto')
            .append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill', color(label));
    }
    const viewport = svg.append('g').attr('class', 'graph-viewport');
    const edgeLayer = viewport.append('g').attr('class', 'graph-edges');
    const routeXs: number[] = [];
    graph.links.forEach(link => {
        const child = byId.get(link.source)!;
        const parent = byId.get(link.target)!;
        const parallel = graph.links.filter(edge => edge.source === link.source && edge.target === link.target).length > 1;
        const offset = parallel ? (link.label === 'BELONGS_TO' ? -65 : 65) : 0;
        const { path, labelX, labelY, laneX } = routeHierarchyLink(child, parent, graph.nodes, offset);
        if (laneX !== undefined) routeXs.push(laneX - 100, laneX + 100);
        const edge = edgeLayer.append('g').datum(link).attr('class', 'graph-edge');
        edge.append('path').attr('d', path).attr('fill', 'none').attr('stroke', color(link.label))
            .attr('stroke-width', 2).attr('stroke-dasharray', link.label === 'MEMBER_OF' ? '7 5' : null)
            .attr('marker-end', `url(#${instanceId}-${link.label})`);
        edge.append('title').text(`${returnCurrentLocaleContent(child.name)} — ${t(link.label === 'BELONGS_TO' ? 'belongsToLabel' : 'memberOfLabel')} → ${returnCurrentLocaleContent(parent.name)}`);
        const label = edge.append('g').attr('transform', `translate(${labelX},${labelY})`);
        const text = label.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
            .attr('fill', color(link.label)).attr('font-size', 12).attr('font-weight', 600)
            .text(t(link.label === 'BELONGS_TO' ? 'belongsToLabel' : 'memberOfLabel'));
        const textWidth = text.node()?.getComputedTextLength() ?? 90;
        label.insert('rect', 'text').attr('x', -textWidth / 2 - 10).attr('y', -13)
            .attr('width', textWidth + 20).attr('height', 26).attr('rx', 7)
            .attr('fill', '#fff').attr('stroke', color(link.label)).attr('stroke-opacity', 0.25);
    });
    const cards = viewport.append('g').selectAll('g').data(graph.nodes).join('g')
        .attr('class', 'graph-node')
        .attr('transform', (node: PositionedRelationNode) => `translate(${node.x - CARD_WIDTH / 2},${node.y})`);
    let hoveredId: number | undefined;
    let focusedId: number | undefined;
    const updateHighlight = () => {
        const activeId = hoveredId ?? focusedId;
        const relatedIds = new Set<number>();
        if (activeId !== undefined) {
            relatedIds.add(activeId);
            for (const edge of graph.links) {
                if (edge.source === activeId) relatedIds.add(edge.target);
                if (edge.target === activeId) relatedIds.add(edge.source);
            }
        }
        cards.style('opacity', (node: PositionedRelationNode) => activeId === undefined || relatedIds.has(node.id) ? 1 : 0.2);
        edgeLayer.selectAll('.graph-edge').style('opacity', (edge: RelationLink) =>
            activeId === undefined || edge.source === activeId || edge.target === activeId ? 1 : 0.12);
    };
    cards
        .on('mouseenter', (_event: MouseEvent, node: PositionedRelationNode) => {
            hoveredId = node.id;
            updateHighlight();
        })
        .on('mouseleave', () => {
            hoveredId = undefined;
            updateHighlight();
        })
        .on('focusin', (_event: FocusEvent, node: PositionedRelationNode) => {
            focusedId = node.id;
            updateHighlight();
        })
        .on('focusout', () => {
            focusedId = undefined;
            updateHighlight();
        });
    cards.append('rect').attr('width', CARD_WIDTH).attr('height', CARD_HEIGHT).attr('rx', 14)
        .attr('fill', (node: PositionedRelationNode) => node.id === props.currentId ? '#eef2ff' : '#fff')
        .attr('stroke', (node: PositionedRelationNode) => node.id === props.currentId ? '#818cf8' : '#cbd5e1')
        .attr('stroke-width', (node: PositionedRelationNode) => node.id === props.currentId ? 2 : 1);
    cards.each(function(node: PositionedRelationNode) {
        const card = d3.select(this);
        const name = returnCurrentLocaleContent(node.name) || t('organisationUnitLabel');
        card.append('title').text(name);
        const link = card.append('foreignObject').attr('width', CARD_WIDTH).attr('height', CARD_HEIGHT)
            .append('xhtml:a').attr('class', 'graph-card-link')
            .attr('href', `/${locale.value.toLowerCase()}/organisation-units/${node.id}`)
            .attr('aria-current', node.id === props.currentId ? 'page' : null);
        const logo = link.append('xhtml:span').attr('class', 'graph-logo');
        const hex = node.logoBackgroundHex?.replace(/^#/, '');
        if (hex && /^[\da-f]{6}$/i.test(hex)) logo.style('background-color', `#${hex}`);
        logo.append('xhtml:span').attr('class', 'mdi mdi-school-outline').attr('aria-hidden', 'true');
        if (node.logoServerFilename) {
            logo.append('xhtml:img').attr('alt', '').attr('loading', 'lazy')
                .attr('src', `${import.meta.env.VITE_BASE_URL}file/logo/${node.id}?fullSize=false&version=${encodeURIComponent(node.logoServerFilename)}`)
                .on('error', function() { d3.select(this).remove(); });
        }
        const copy = link.append('xhtml:span').attr('class', 'graph-card-copy');
        if (node.id === props.currentId) copy.append('xhtml:span').attr('class', 'graph-current-label').text(t('hierarchyCurrentLabel'));
        copy.append('xhtml:span').attr('class', 'graph-card-name').text(name);
        link.append('xhtml:span').attr('class', 'mdi mdi-arrow-top-right graph-card-arrow').attr('aria-hidden', 'true');
    });
    if (graph.nodes.length) {
        const left = Math.min(...graph.nodes.map(node => node.x - CARD_WIDTH / 2), ...routeXs);
        const right = Math.max(...graph.nodes.map(node => node.x + CARD_WIDTH / 2), ...routeXs);
        graphBounds = { left, top: 0, width: right - left, height: Math.max(...graph.nodes.map(node => node.y)) + CARD_HEIGHT };
    } else graphBounds.width = 0;
    zoom = d3.zoom().scaleExtent([0.12, 3]).filter((event: any) => {
        if (event.type === 'wheel' && !container.value?.contains(document.activeElement)) return false;
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
    }).on('zoom', (event: any) => {
        viewport.attr('transform', event.transform.toString());
        grid.attr('patternTransform', event.transform.toString());
        zoomLevel.value = event.transform.k;
    });
    svg.call(zoom).on('dblclick.zoom', null);
    fitGraph();
}

onMounted(() => {
    instanceId = `relations-${Math.random().toString(36).slice(2)}`;
    renderGraph();
    observer = new ResizeObserver(() => {
        const width = container.value?.clientWidth ?? 0;
        if (width > 0 && width !== previousWidth) { previousWidth = width; fitGraph(); }
    });
    if (container.value) observer.observe(container.value);
});
watch([() => props.nodes, () => props.links, () => props.currentId, locale], async () => {
    await nextTick();
    renderGraph();
}, { deep: true });
onBeforeUnmount(() => {
    observer?.disconnect();
    if (svgElement.value) d3.select(svgElement.value).on('.zoom', null);
});
</script>

<style scoped>
.relations-hierarchy { background: #f8fafc; }
.hierarchy-footer { padding: 16px 24px; background: #fff; border-top: 1px solid #e2e8f0; }
.hierarchy-legend { display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; color: #475569; }
.hierarchy-legend > span { display: flex; align-items: center; gap: 7px; }
.legend-line { width: 24px; border-top: 2px solid #6366f1; }
.legend-line.membership { border-color: #0d9488; border-top-style: dashed; }
.graph-canvas {
    position: relative;
    height: 580px;
    background-color: #f8fafc;
}
.hierarchy-svg { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; }
.hierarchy-svg:active { cursor: grabbing; }
.hierarchy-svg:focus-visible { outline: 2px solid #6366f1; outline-offset: -2px; }
.graph-message { position: absolute; inset: 0; display: grid; place-items: center; color: #64748b; pointer-events: none; }
.graph-controls { position: absolute; bottom: 20px; left: 20px; display: flex; align-items: center; gap: 4px; padding: 5px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 4px 12px rgb(15 23 42 / 8%); }
.graph-controls button { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 7px; color: #475569; font-size: 20px; cursor: pointer; }
.graph-controls button:hover { background: #eef2ff; color: #4f46e5; }
.graph-controls button:focus-visible { outline: 2px solid #6366f1; }
.zoom-level { min-width: 42px; text-align: center; font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; }
.control-divider { width: 1px; height: 20px; margin: 0 4px; background: #e2e8f0; }
.canvas-hint { position: absolute; bottom: 32px; right: 24px; font-size: 12px; color: #64748b; pointer-events: none; }
:deep(.graph-node), :deep(.graph-edge) { transition: opacity 160ms ease; }
@media (prefers-reduced-motion: reduce) {
    :deep(.graph-node), :deep(.graph-edge) { transition: none; }
}
:deep(.graph-card-link) { display: flex; width: 100%; height: 100%; align-items: center; gap: 12px; padding: 14px; color: inherit; text-decoration: none; box-sizing: border-box; border-radius: 14px; cursor: pointer; }
:deep(.graph-card-link:hover) { background: rgb(99 102 241 / 5%); }
:deep(.graph-card-link:focus-visible) { outline: 3px solid #6366f1; outline-offset: -3px; }
:deep(.graph-logo) { position: relative; display: grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; overflow: hidden; border-radius: 10px; background: #f1f5f9; color: #64748b; font-size: 25px; }
:deep(.graph-logo img) { position: absolute; inset: 0; width: 100%; height: 100%; padding: 4px; object-fit: contain; background: inherit; }
:deep(.graph-card-copy) { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
:deep(.graph-card-name) { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; color: #1e293b; font-size: 13px; line-height: 1.45; font-weight: 600; }
:deep(.graph-current-label) { color: #4f46e5; font-size: 10px; font-weight: 700; }
:deep(.graph-card-arrow) { margin-left: auto; color: #94a3b8; font-size: 16px; }
@media (max-width: 600px) {
    .hierarchy-footer { padding: 16px; }
    .graph-canvas { height: 500px; }
    .canvas-hint { display: none; }
}
</style>
