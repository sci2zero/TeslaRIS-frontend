<template>
    <Teleport to="body">
        <div
            v-if="shouldRenderOverlay"
            class="tutorial-overlay"
            :class="{ 'tutorial-overlay--animate': animateSpotlight }"
            aria-live="polite"
        >
            <div v-if="!targetRect" class="tutorial-overlay__block tutorial-overlay__block--full"></div>
            <template v-else>
                <div class="tutorial-overlay__block" :style="blockStyles.top"></div>
                <div class="tutorial-overlay__block" :style="blockStyles.bottom"></div>
                <div class="tutorial-overlay__block" :style="blockStyles.left"></div>
                <div class="tutorial-overlay__block" :style="blockStyles.right"></div>
                <div class="tutorial-overlay__highlight" :style="highlightStyle"></div>
                <div
                    v-if="shouldBlockRouteChanges"
                    class="tutorial-overlay__shield"
                    :style="highlightStyle"
                    aria-hidden="true"
                ></div>
            </template>

            <button
                v-if="scrollHint"
                type="button"
                class="tutorial-overlay__scroll-hint"
                :class="`tutorial-overlay__scroll-hint--${scrollHint}`"
                :aria-label="scrollHintLabel"
                @click="scrollTargetIntoView"
            >
                <v-icon :icon="scrollHintIcon" size="28" />
            </button>

            <div
                class="tutorial-overlay__panel"
                :class="{ 'tutorial-overlay__panel--animate': animateSpotlight }"
                :style="panelStyle"
            >
                <div class="tutorial-overlay__header">
                    <span class="tutorial-overlay__step">{{ $t('tutorial.stepCounter', { current: currentIndex + 1, total: totalSteps }) }}</span>
                    <button class="tutorial-overlay__skip" type="button" @click="handleSkip">
                        {{ $t('tutorial.skipLabel') }}
                    </button>
                </div>
                <h3 v-if="currentStep?.title" class="tutorial-overlay__title">
                    {{ $t(currentStep.title) }}
                </h3>
                <p v-if="currentStep?.description" class="tutorial-overlay__description">
                    {{ $t(currentStep.description) }}
                </p>

                <div class="tutorial-overlay__actions">
                    <v-btn
                        v-if="currentStep?.action === 'next'"
                        color="primary"
                        size="small"
                        @click="handleManualNext"
                    >
                        {{ $t('tutorial.continueLabel') }}
                    </v-btn>
                    <v-btn
                        v-else-if="currentStep?.action === 'navigate'"
                        color="primary"
                        variant="tonal"
                        size="small"
                        @click="handleManualNext"
                    >
                        {{ $t('tutorial.nextLabel') }}
                    </v-btn>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useTutorialStore, type TutorialStep } from '@/stores/tutorialStore'
import { useSidebarStore } from '@/stores/sidebarStore'

const { t } = useI18n()
const tutorialStore = useTutorialStore()
const sidebarStore = useSidebarStore()
const route = useRoute()
const router = useRouter()

const visible = computed(() => tutorialStore.active && !!tutorialStore.currentStep)

const overlaySuppressed = ref(false)
const shouldRenderOverlay = computed(() => visible.value && !overlaySuppressed.value)
/** True only briefly when switching steps — never during scroll/resize on the same step. */
const animateSpotlight = ref(false)

const currentStep = computed(() => tutorialStore.currentStep)
const currentIndex = computed(() => tutorialStore.currentStepIndex)
const totalSteps = computed(() => tutorialStore.totalSteps)

interface Rect {
    top: number
    left: number
    width: number
    height: number
    right: number
    bottom: number
}

const targetRect = ref<Rect | null>(null)
const targetElement = ref<HTMLElement | null>(null)

const viewport = ref({ width: 0, height: 0 })

const highlightPadding = computed(() => currentStep.value?.focusPadding ?? 16)

/** Block page navigation for overview steps (`next`) — only `click` / `navigate` may change route. */
const shouldBlockRouteChanges = computed(() => {
    const action = currentStep.value?.action
    return !!action && action !== 'click' && action !== 'navigate'
})

let searchTimeout: number | null = null
let pendingNextTimeout: number | null = null
let animateTimeout: number | null = null
let resizeListenerAttached = false
let elementClickHandler: ((event: Event) => void) | null = null
let removeRouterGuard: (() => void) | null = null
let recoveringRoute = false
let waitForHiddenTimer: number | null = null

const SPOTLIGHT_TRANSITION_MS = 200

function clearAnimateTimeout() {
    if (animateTimeout) {
        window.clearTimeout(animateTimeout)
        animateTimeout = null
    }
}

function enableStepTransition() {
    clearAnimateTimeout()
    animateSpotlight.value = true
    animateTimeout = window.setTimeout(() => {
        animateSpotlight.value = false
        animateTimeout = null
    }, SPOTLIGHT_TRANSITION_MS)
}

function updateViewport() {
    viewport.value = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
}

function computeRect(el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    targetRect.value = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
    }
}

const updateRect = () => {
    const element = targetElement.value
    if (!element) return
    computeRect(element)
}

function clearSearchTimeout() {
    if (searchTimeout) {
        window.clearTimeout(searchTimeout)
        searchTimeout = null
    }
}

function clearPendingNextTimeout() {
    if (pendingNextTimeout) {
        window.clearTimeout(pendingNextTimeout)
        pendingNextTimeout = null
    }
}

function clearWaitForHiddenTimer() {
    if (waitForHiddenTimer) {
        window.clearTimeout(waitForHiddenTimer)
        waitForHiddenTimer = null
    }
}

function detachElement() {
    if (targetElement.value && elementClickHandler) {
        targetElement.value.removeEventListener('click', elementClickHandler)
    }
    targetElement.value = null
    elementClickHandler = null
    targetRect.value = null
    clearSearchTimeout()
    clearPendingNextTimeout()
    clearWaitForHiddenTimer()
    overlaySuppressed.value = false
}

function unbindTargetListeners() {
    if (targetElement.value && elementClickHandler) {
        targetElement.value.removeEventListener('click', elementClickHandler)
    }
    elementClickHandler = null
    clearSearchTimeout()
    clearPendingNextTimeout()
}

function registerGlobalListeners() {
    if (resizeListenerAttached) return
    window.addEventListener('resize', updateViewport)
    document.addEventListener('scroll', updateRect, true)
    registerRouterGuard()
    resizeListenerAttached = true
}

function unregisterGlobalListeners() {
    if (!resizeListenerAttached) return
    window.removeEventListener('resize', updateViewport)
    document.removeEventListener('scroll', updateRect, true)
    unregisterRouterGuard()
    resizeListenerAttached = false
}

function registerRouterGuard() {
    if (removeRouterGuard) return

    removeRouterGuard = router.beforeEach((to, from, next) => {
        if (!tutorialStore.active || recoveringRoute) {
            next()
            return
        }

        const step = tutorialStore.currentStep
        if (!step) {
            next()
            return
        }

        // Only click / navigate steps are allowed to change the page
        if (step.action === 'click' || step.action === 'navigate') {
            next()
            return
        }

        // Same route name (e.g. query-only) is fine; block leaving the page
        if (to.name && from.name && to.name === from.name) {
            next()
            return
        }

        // Stay on / return to the step's required page when possible
        if (step.requiredRouteName && to.name !== step.requiredRouteName) {
            next({
                name: step.requiredRouteName,
                params: { locale: to.params.locale ?? from.params.locale },
            })
            return
        }

        next(false)
    })
}

function unregisterRouterGuard() {
    if (!removeRouterGuard) return
    removeRouterGuard()
    removeRouterGuard = null
}

function ensureOnRequiredRoute(step: TutorialStep): boolean {
    if (step.action === 'click' || step.action === 'navigate') return false
    if (!step.requiredRouteName || checkRouteMatch(step.requiredRouteName)) return false
    if (recoveringRoute) return true

    recoveringRoute = true
    pushLocalizedRoute(step.requiredRouteName)
        .catch(() => undefined)
        .finally(() => {
            recoveringRoute = false
            nextTick(() => attemptLocateTarget(step))
        })
    return true
}

function proceedToNextStep(step: TutorialStep, delay = 400) {
    clearPendingNextTimeout()
    pendingNextTimeout = window.setTimeout(() => {
        if (tutorialStore.currentStep?.id === step.id) {
            tutorialStore.nextStep()
        }
    }, delay)
}

function waitForElementHidden(step: TutorialStep, onHidden: () => void) {
    const selector = step.waitForHiddenSelector
    if (!selector) {
        overlaySuppressed.value = false
        onHidden()
        return
    }

    clearWaitForHiddenTimer()

    const check = () => {
        if (!tutorialStore.active) {
            overlaySuppressed.value = false
            waitForHiddenTimer = null
            return
        }
        if (tutorialStore.currentStep?.id !== step.id) return

        const elements = Array.from(document.querySelectorAll(selector))

        if (elements.length === 0) {
            overlaySuppressed.value = false
            waitForHiddenTimer = null
            onHidden()
            return
        }

        overlaySuppressed.value = true
        waitForHiddenTimer = window.setTimeout(check, 250)
    }

    check()
}

function bindElementInteraction(el: HTMLElement, step: TutorialStep) {
    // Keep previous targetRect so step-change transitions can animate to the new position.
    unbindTargetListeners()
    targetElement.value = el
    computeRect(el)

    elementClickHandler = () => {
        if (!tutorialStore.active) return
        const activeStep = tutorialStore.currentStep
        if (!activeStep || activeStep.id !== step.id) return
        if (activeStep.action === 'click') {
            proceedToNextStep(activeStep)
        }
        if (activeStep.action === 'navigate' && activeStep.targetRouteName) {
            // Route watcher will advance once navigation completes
        }
    }

    if (step.action === 'click' || step.action === 'navigate') {
        el.addEventListener('click', elementClickHandler)
    }
}

function checkRouteMatch(routeName: string) {
    return route.name === routeName
}

function pushLocalizedRoute(routeName: string) {
    return router.push({
        name: routeName,
        params: { locale: route.params.locale },
    })
}

function attemptLocateTarget(step: TutorialStep | null, tryCount = 0) {
    clearSearchTimeout()
    if (!step || !tutorialStore.active) {
        detachElement()
        return
    }

    if (ensureOnRequiredRoute(step)) {
        return
    }

    const el = document.querySelector(step.selector) as HTMLElement | null
    if (el) {
        bindElementInteraction(el, step)
        nextTick(() => {
            updateViewport()
            updateRect()
            el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
        })
        return
    }

    if (tryCount > 80) {
        console.warn(`[Tutorial] Element not found for selector ${step.selector}`)
        return
    }
    searchTimeout = window.setTimeout(() => attemptLocateTarget(step, tryCount + 1), 300)
}

function handleSkip() {
    tutorialStore.skip()
}

function handleManualNext() {
    if (!currentStep.value) return

    if (currentStep.value.action === 'navigate' && currentStep.value.targetRouteName) {
        if (checkRouteMatch(currentStep.value.targetRouteName)) {
            tutorialStore.nextStep()
            return
        }
        pushLocalizedRoute(currentStep.value.targetRouteName)
        return
    }

    if (currentStep.value.action === 'next') {
        tutorialStore.nextStep()
    }
}

function ensureSidebarVisible() {
    if (sidebarStore.isMobile && !sidebarStore.isVisible) {
        sidebarStore.open()
    }
}

watch(
    () => tutorialStore.active,
    (active) => {
        if (active) {
            tutorialStore.init()
            registerGlobalListeners()
            ensureSidebarVisible()
            nextTick(() => attemptLocateTarget(tutorialStore.currentStep))
        } else {
            clearAnimateTimeout()
            animateSpotlight.value = false
            detachElement()
            unregisterGlobalListeners()
        }
    },
    { immediate: true },
)

watch(
    () => tutorialStore.currentStep,
    (step, previousStep) => {
        clearWaitForHiddenTimer()
        overlaySuppressed.value = false
        if (!tutorialStore.active) return
        if (!step) {
            detachElement()
            return
        }

        if (step.selector.startsWith('[data-tutorial="nav-')) {
            ensureSidebarVisible()
        }

        const isStepChange = !!previousStep && previousStep.id !== step.id

        waitForElementHidden(step, () => {
            overlaySuppressed.value = false
            if (isStepChange) {
                enableStepTransition()
            }
            nextTick(() => attemptLocateTarget(step))
        })
    },
)

watch(
    () => route.fullPath,
    () => {
        const step = tutorialStore.currentStep
        if (!tutorialStore.active || !step) return

        if (ensureOnRequiredRoute(step)) {
            return
        }

        if (step.action === 'navigate' && step.targetRouteName) {
            if (checkRouteMatch(step.targetRouteName)) {
                proceedToNextStep(step)
            }
            return
        }

        // Same step after navigation/scroll — snap, do not animate
        nextTick(() => attemptLocateTarget(step))
    },
)

onMounted(() => {
    tutorialStore.init()
    if (tutorialStore.active && tutorialStore.currentStep) {
        registerGlobalListeners()
        nextTick(() => attemptLocateTarget(tutorialStore.currentStep))
    }
})

onBeforeUnmount(() => {
    clearAnimateTimeout()
    animateSpotlight.value = false
    detachElement()
    unregisterGlobalListeners()
})

/**
 * Padded target rect clamped to the current viewport, so the spotlight shrinks
 * as the element scrolls partially off-screen instead of keeping full height.
 */
const spotlightRect = computed(() => {
    if (!targetRect.value) return null

    const rect = targetRect.value
    const pad = highlightPadding.value
    const width = viewport.value.width
    const height = viewport.value.height

    const top = Math.min(Math.max(rect.top - pad, 0), height)
    const bottom = Math.min(Math.max(rect.bottom + pad, 0), height)
    const left = Math.min(Math.max(rect.left - pad, 0), width)
    const right = Math.min(Math.max(rect.right + pad, 0), width)

    return {
        top,
        bottom,
        left,
        right,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
    }
})

type ScrollHintDirection = 'up' | 'down' | 'left' | 'right'

/** Minimum visible area before we treat the target as "hidden" and show a scroll cue. */
const MIN_VISIBLE_PX = 48

const scrollHint = computed<ScrollHintDirection | null>(() => {
    if (!targetRect.value || !viewport.value.width || !viewport.value.height) return null

    const rect = targetRect.value
    const { width, height } = viewport.value
    const spotlight = spotlightRect.value
    const visibleEnough =
        !!spotlight &&
        spotlight.width >= MIN_VISIBLE_PX &&
        spotlight.height >= MIN_VISIBLE_PX

    if (visibleEnough) return null

    // Prefer the axis with the larger overflow.
    const overflowTop = Math.max(0, -rect.top)
    const overflowBottom = Math.max(0, rect.bottom - height)
    const overflowLeft = Math.max(0, -rect.left)
    const overflowRight = Math.max(0, rect.right - width)

    const vertical = Math.max(overflowTop, overflowBottom)
    const horizontal = Math.max(overflowLeft, overflowRight)

    if (vertical <= 0 && horizontal <= 0) {
        // Fully off-screen but overflow calc missed edge cases (e.g. zero-size).
        if (rect.bottom <= 0) return 'up'
        if (rect.top >= height) return 'down'
        if (rect.right <= 0) return 'left'
        if (rect.left >= width) return 'right'
        return null
    }

    if (vertical >= horizontal) {
        return overflowTop >= overflowBottom ? 'up' : 'down'
    }
    return overflowLeft >= overflowRight ? 'left' : 'right'
})

const scrollHintIcon = computed(() => {
    switch (scrollHint.value) {
        case 'up':
            return 'mdi-chevron-up'
        case 'down':
            return 'mdi-chevron-down'
        case 'left':
            return 'mdi-chevron-left'
        case 'right':
            return 'mdi-chevron-right'
        default:
            return 'mdi-chevron-down'
    }
})

const scrollHintLabel = computed(() => {
    switch (scrollHint.value) {
        case 'up':
            return t('tutorial.scrollUpLabel')
        case 'down':
            return t('tutorial.scrollDownLabel')
        case 'left':
            return t('tutorial.scrollLeftLabel')
        case 'right':
            return t('tutorial.scrollRightLabel')
        default:
            return ''
    }
})

function scrollTargetIntoView() {
    const el = targetElement.value
    if (!el) return
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
    nextTick(() => updateRect())
}

const blockStyles = computed(() => {
    if (!targetRect.value) {
        return {
            top: {
                top: '0px',
                left: '0px',
                width: '100%',
                height: '100%',
            },
            bottom: { display: 'none' },
            left: { display: 'none' },
            right: { display: 'none' },
        }
    }

    const spotlight = spotlightRect.value
    if (!spotlight) {
        return {
            top: { top: '0px', left: '0px', width: '100%', height: '100%' },
            bottom: { display: 'none' },
            left: { display: 'none' },
            right: { display: 'none' },
        }
    }

    const width = viewport.value.width
    const height = viewport.value.height

    return {
        top: {
            top: '0px',
            left: '0px',
            width: '100%',
            height: `${spotlight.top}px`,
        },
        bottom: {
            top: `${spotlight.bottom}px`,
            left: '0px',
            width: '100%',
            height: `${Math.max(0, height - spotlight.bottom)}px`,
        },
        left: {
            top: `${spotlight.top}px`,
            left: '0px',
            width: `${spotlight.left}px`,
            height: `${spotlight.height}px`,
        },
        right: {
            top: `${spotlight.top}px`,
            left: `${spotlight.right}px`,
            width: `${Math.max(0, width - spotlight.right)}px`,
            height: `${spotlight.height}px`,
        },
    }
})

const highlightStyle = computed(() => {
    const spotlight = spotlightRect.value
    if (!spotlight || spotlight.width <= 0 || spotlight.height <= 0) {
        return { display: 'none' }
    }
    return {
        top: `${spotlight.top}px`,
        left: `${spotlight.left}px`,
        width: `${spotlight.width}px`,
        height: `${spotlight.height}px`,
    }
})

const panelStyle = computed(() => {
    if (!targetRect.value) {
        return {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
        }
    }
    const rect = targetRect.value
    const pad = highlightPadding.value
    const panelWidth = 320
    const panelHeightEstimate = 220
    const margin = 16

    let top = rect.bottom + pad + 16
    let left = rect.left

    if (top + panelHeightEstimate > viewport.value.height) {
        top = rect.top - pad - panelHeightEstimate - 16
    }

    if (top < margin) {
        top = margin
    }

    if (left + panelWidth > viewport.value.width - margin) {
        left = viewport.value.width - panelWidth - margin
    }

    if (left < margin) {
        left = margin
    }

    return {
        top: `${top}px`,
        left: `${left}px`,
    }
})
</script>

<style scoped>
.tutorial-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    pointer-events: none;
}

.tutorial-overlay__block {
    position: fixed;
    background: rgba(15, 23, 42, 0.72);
    pointer-events: auto;
}

.tutorial-overlay--animate .tutorial-overlay__block,
.tutorial-overlay--animate .tutorial-overlay__highlight {
    transition: top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease;
}

.tutorial-overlay__block--full {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.tutorial-overlay__highlight {
    position: fixed;
    border-radius: 12px;
    border: 2px solid rgba(56, 189, 248, 0.85);
    box-shadow: 0 20px 45px rgba(56, 189, 248, 0.25);
    pointer-events: none;
    z-index: 10001;
}

.tutorial-overlay__shield {
    position: fixed;
    border-radius: 12px;
    pointer-events: auto;
    z-index: 10001;
    cursor: default;
    background: transparent;
}

.tutorial-overlay__panel {
    position: fixed;
    max-width: 320px;
    background: white;
    border-radius: 16px;
    padding: 18px 20px 20px;
    box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
    pointer-events: auto;
    z-index: 10002;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.tutorial-overlay__panel--animate {
    transition: top 0.2s ease, left 0.2s ease;
}

.tutorial-overlay__scroll-hint {
    position: fixed;
    z-index: 10003;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 9999px;
    background: rgba(14, 165, 233, 0.95);
    color: white;
    box-shadow: 0 10px 30px rgba(14, 165, 233, 0.45);
    cursor: pointer;
    animation: tutorial-scroll-hint-pulse 1.4s ease-in-out infinite;
}

.tutorial-overlay__scroll-hint:hover {
    background: rgb(2, 132, 199);
}

.tutorial-overlay__scroll-hint--up {
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
}

.tutorial-overlay__scroll-hint--down {
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
}

.tutorial-overlay__scroll-hint--left {
    left: 24px;
    top: 50%;
    transform: translateY(-50%);
}

.tutorial-overlay__scroll-hint--right {
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
}

@keyframes tutorial-scroll-hint-pulse {
    0%,
    100% {
        opacity: 1;
        box-shadow: 0 10px 30px rgba(14, 165, 233, 0.45);
    }
    50% {
        opacity: 0.85;
        box-shadow: 0 14px 36px rgba(14, 165, 233, 0.65);
    }
}

.tutorial-overlay__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tutorial-overlay__step {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: rgba(15, 23, 42, 0.55);
    letter-spacing: 0.05em;
}

.tutorial-overlay__skip {
    border: none;
    background: transparent;
    color: rgba(15, 23, 42, 0.7);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.tutorial-overlay__skip:hover {
    color: rgba(15, 23, 42, 0.9);
}

.tutorial-overlay__title {
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(15, 23, 42, 1);
    margin: 0;
}

.tutorial-overlay__description {
    font-size: 0.95rem;
    color: rgba(71, 85, 105, 1);
    margin: 0;
    line-height: 1.5;
}

.tutorial-overlay__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

@media (max-width: 640px) {
    .tutorial-overlay__panel {
        max-width: calc(100% - 32px);
        left: 50% !important;
        transform: translateX(-50%);
    }
}
</style>
