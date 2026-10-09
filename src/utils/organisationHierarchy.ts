import type { OrganisationUnitResponse } from '@/models/OrganisationUnitModel';

export type RelationNode = Pick<OrganisationUnitResponse, 'id' | 'name'> &
    Partial<Pick<OrganisationUnitResponse, 'logoServerFilename' | 'logoBackgroundHex'>>;
export interface RelationLink {
    source: number;
    target: number;
    label: 'BELONGS_TO' | 'MEMBER_OF';
}
export interface PositionedRelationNode extends RelationNode {
    x: number;
    y: number;
    level: number;
}

export const CARD_WIDTH = 280;
export const CARD_HEIGHT = 100;
export const ROW_HEIGHT = 230;

/** Rank parents above children, keeping shared institutions as a single node. */
export function layoutOrganisationHierarchy(nodes: RelationNode[], links: RelationLink[]) {
    const unique = new Map(nodes.map(node => [node.id, node]));
    const seen = new Set<string>();
    const edges = links.filter(link => {
        const key = `${link.source}:${link.target}:${link.label}`;
        if (link.source === link.target || !unique.has(link.source) || !unique.has(link.target) || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    const parents = new Map<number, Set<number>>();
    const children = new Map<number, Set<number>>();
    for (const edge of edges) {
        parents.set(edge.source, new Set([...(parents.get(edge.source) ?? []), edge.target]));
        children.set(edge.target, new Set([...(children.get(edge.target) ?? []), edge.source]));
    }
    const pending = new Map([...unique.keys()].map(id => [id, parents.get(id)?.size ?? 0]));
    const levels = new Map([...unique.keys()].map(id => [id, 0]));
    const queue = [...unique.keys()].filter(id => !pending.get(id));
    const visited = new Set<number>();
    const process = () => {
        while (queue.length) {
            const id = queue.shift()!;
            if (visited.has(id)) continue;
            visited.add(id);
            for (const child of children.get(id) ?? []) {
                if (visited.has(child)) continue;
                levels.set(child, Math.max(levels.get(child)!, levels.get(id)! + 1));
                pending.set(child, pending.get(child)! - 1);
                if (pending.get(child)! <= 0) queue.push(child);
            }
        }
    };
    process();
    // Break cyclic input deterministically without dropping its nodes or relationships.
    for (const id of unique.keys()) {
        if (!visited.has(id)) { queue.push(id); process(); }
    }
    // Move shallow membership parents closer to their children while preserving edge direction.
    for (const id of [...unique.keys()].sort((a, b) => levels.get(b)! - levels.get(a)!)) {
        const childLevels = [...(children.get(id) ?? [])].map(child => levels.get(child)!);
        if (childLevels.length) {
            const latestLevel = Math.min(...childLevels) - 1;
            if (latestLevel > levels.get(id)!) levels.set(id, latestLevel);
        }
    }
    const rows = new Map<number, number[]>();
    for (const id of unique.keys()) {
        const level = levels.get(id)!;
        rows.set(level, [...(rows.get(level) ?? []), id]);
    }
    const sortedRows = [...rows.entries()].sort(([a], [b]) => a - b);
    const positions = new Map<number, number>();
    // Center each row and order children by the average position of their parents.
    for (const [level, row] of sortedRows) {
        const average = (id: number) => {
            const values = [...(parents.get(id) ?? [])].filter(parent => positions.has(parent)).map(parent => positions.get(parent)!);
            return values.length ? values.reduce((sum, x) => sum + x, 0) / values.length : 0;
        };
        row.sort((a, b) => average(a) - average(b));
        if (level === 0 && row.length > 1) {
            // Keep the structural parent at the center; membership institutions flank it.
            const structuralCount = (id: number) => edges.filter(edge => edge.target === id && edge.label === 'BELONGS_TO').length;
            const primary = [...row].sort((a, b) => structuralCount(b) - structuralCount(a))[0];
            if (structuralCount(primary)) {
                row.splice(row.indexOf(primary), 1);
                row.splice(Math.floor(row.length / 2), 0, primary);
            }
        }
        row.forEach((id, index) => positions.set(id, (index - (row.length - 1) / 2) * (CARD_WIDTH + 64)));
        const structuralOffsets = edges
            .filter(edge => edge.label === 'BELONGS_TO' && row.includes(edge.source) && positions.has(edge.target))
            .map(edge => positions.get(edge.target)! - positions.get(edge.source)!);
        const rootParent = level === 0
            ? row.find(id => edges.some(edge => edge.target === id && edge.label === 'BELONGS_TO'))
            : undefined;
        const shift = structuralOffsets.length
            ? structuralOffsets.reduce((sum, offset) => sum + offset, 0) / structuralOffsets.length
            : rootParent !== undefined ? -positions.get(rootParent)! : 0;
        row.forEach(id => positions.set(id, positions.get(id)! + shift));
    }
    const positioned: PositionedRelationNode[] = [...unique.values()].map(node => ({
        ...node, x: positions.get(node.id)!, y: levels.get(node.id)! * ROW_HEIGHT, level: levels.get(node.id)!
    }));
    return { nodes: positioned, links: edges };
}

/** Find a nearby vertical corridor clear of every intermediate card. */
export function routeHierarchyLink(child: PositionedRelationNode, parent: PositionedRelationNode, nodes: PositionedRelationNode[], offset = 0) {
    const startX = child.x + offset;
    const startY = child.y;
    const endX = parent.x + offset;
    const endY = parent.y + CARD_HEIGHT;
    const middleY = (startY + endY) / 2;
    if (child.level - parent.level === 1) {
        return {
            path: `M${startX},${startY} C${startX},${middleY} ${endX},${middleY} ${endX},${endY}`,
            labelX: (startX + endX) / 2, labelY: middleY, laneX: undefined
        };
    }
    const intermediate = nodes.filter(node => node.id !== child.id && node.id !== parent.id &&
        node.y >= Math.min(parent.y, child.y) && node.y <= Math.max(parent.y, child.y));
    const margin = CARD_WIDTH / 2 + 32;
    const candidates = [endX, ...intermediate.flatMap(node => [node.x - margin, node.x + margin])];
    const safe = candidates.filter(x => intermediate.every(node => Math.abs(x - node.x) >= margin));
    const sideStart = (x: number) => child.x + (x < child.x ? -CARD_WIDTH / 2 : CARD_WIDTH / 2);
    safe.sort((a, b) => Math.abs(sideStart(a) - a) + Math.abs(a - endX) -
        (Math.abs(sideStart(b) - b) + Math.abs(b - endX)));
    const lane = safe[0] ?? endX;
    const y = child.y + CARD_HEIGHT / 2;
    return {
        path: `M${sideStart(lane)},${y} H${lane} V${endY + 32} H${endX} V${endY}`,
        labelX: lane, labelY: (y + endY + 32) / 2, laneX: lane
    };
}
