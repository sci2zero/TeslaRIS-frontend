import catalog from './tutorials.json'

export type TutorialStepAction = 'click' | 'next' | 'navigate'
export type TutorialPersist = 'local' | 'backend' | 'both'
export type TutorialKey = string

export interface TutorialStep {
    id: string
    selector: string
    title: string
    description: string
    action: TutorialStepAction
    targetRouteName?: string
    requiredRouteName?: string
    focusPadding?: number
    waitForHiddenSelector?: string
}

export interface TutorialDefinition {
    key: TutorialKey
    label: string
    steps: TutorialStep[]
    triggerRouteNames: string[]
    persist: TutorialPersist
    requiresAuth: boolean
    roles: string[]
    includes: TutorialKey[]
}

interface RawTutorialDefinition {
    label: string
    steps?: TutorialStep[]
    includes?: TutorialKey[]
    triggerRouteNames?: string[]
    persist?: TutorialPersist
    requiresAuth?: boolean
    roles?: string[]
}

interface TutorialCatalog {
    tutorials?: Record<TutorialKey, RawTutorialDefinition>
}

const typedCatalog = catalog as TutorialCatalog

function resolveTutorial(
    key: TutorialKey,
    rawTutorials: Record<TutorialKey, RawTutorialDefinition>,
    resolved: Partial<Record<TutorialKey, TutorialDefinition>>,
    stack: TutorialKey[] = [],
): TutorialDefinition {
    const cached = resolved[key]
    if (cached) {
        return cached
    }

    if (stack.includes(key)) {
        throw new Error(`[Tutorial] Circular include: ${[...stack, key].join(' -> ')}`)
    }

    const raw = rawTutorials[key]
    if (!raw) {
        throw new Error(`[Tutorial] Unknown tutorial "${key}"`)
    }

    const includedKeys = raw.includes ?? []
    const includedSteps = includedKeys.flatMap((includedKey) =>
        resolveTutorial(includedKey, rawTutorials, resolved, [...stack, key]).steps,
    )

    const definition: TutorialDefinition = {
        key,
        label: raw.label,
        steps: [...includedSteps, ...(raw.steps ?? [])],
        triggerRouteNames: raw.triggerRouteNames ?? [],
        persist: raw.persist ?? 'both',
        requiresAuth: raw.requiresAuth ?? false,
        roles: raw.roles ?? [],
        includes: includedKeys,
    }

    resolved[key] = definition
    return definition
}

function loadTutorials(): Record<TutorialKey, TutorialDefinition> {
    try {
        const rawTutorials = typedCatalog.tutorials
        if (!rawTutorials || typeof rawTutorials !== 'object') {
            console.warn('[Tutorial] tutorials config is invalid or undefined in catalog.json');
            return {};
        }
        const resolved: Partial<Record<TutorialKey, TutorialDefinition>> = {};

        for (const key of Object.keys(rawTutorials) as TutorialKey[]) {
            resolveTutorial(key, rawTutorials, resolved);
        }

        return resolved as Record<TutorialKey, TutorialDefinition>;
    } catch (error) {
        console.error('[Tutorial] Failed to load tutorials:', error);
        return {};
    }
}

export const tutorials = loadTutorials()

export function persistUsesLocal(persist: TutorialPersist): boolean {
    return persist === 'local' || persist === 'both'
}

export function persistUsesBackend(persist: TutorialPersist): boolean {
    return persist === 'backend' || persist === 'both'
}
