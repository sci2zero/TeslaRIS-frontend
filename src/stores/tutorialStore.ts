import { defineStore } from 'pinia'
import UserService from '@/services/UserService'
import { TutorialProgressStatus } from '@/models/UserModel'
import { useLoginStore } from '@/stores/loginStore'
import {
    persistUsesBackend,
    persistUsesLocal,
    tutorials,
    type TutorialDefinition,
    type TutorialKey,
    type TutorialStep,
} from '@/tutorials'

export type { TutorialDefinition, TutorialKey, TutorialPersist, TutorialStep, TutorialStepAction } from '@/tutorials'

const STORAGE_KEY_PREFIX = 'teslaris_tutorial_completed_'

export { tutorials }

function storageKeyFor(key: TutorialKey): string {
    return `${STORAGE_KEY_PREFIX}${key}`
}

function isFinishedStatus(status: TutorialProgressStatus | string | undefined): boolean {
    return status === TutorialProgressStatus.FINISHED || status === TutorialProgressStatus.SKIPPED
}

function isLocallyCompleted(key: TutorialKey): boolean {
    return window.localStorage.getItem(storageKeyFor(key)) === 'true'
}

export const useTutorialStore = defineStore('tutorialStore', {
    state: () => ({
        active: false,
        currentStepIndex: 0,
        activeTutorialKey: null as TutorialKey | null,
        completed: {} as Record<string, boolean>,
        initialized: false,
        backendSynced: false,
        startingForRoute: false,
    }),
    getters: {
        steps(state): TutorialStep[] {
            if (!state.activeTutorialKey) return []
            return tutorials[state.activeTutorialKey]?.steps ?? []
        },
        currentStep(): TutorialStep | null {
            return this.steps[this.currentStepIndex] ?? null
        },
        totalSteps(): number {
            return this.steps.length
        },
        availableTutorials(): TutorialDefinition[] {
            return Object.values(tutorials)
        },
        isCompleted(state) {
            return (key: TutorialKey): boolean => state.completed[key] === true
        },
    },
    actions: {
        init() {
            if (this.initialized) return
            this.readLocalProgress()
            this.initialized = true
        },
        readLocalProgress() {
            for (const key of Object.keys(tutorials) as TutorialKey[]) {
                if (!persistUsesLocal(tutorials[key].persist)) continue
                this.completed[key] = isLocallyCompleted(key)
            }
        },
        syncFromProgress(tutorialProgress?: Record<string, TutorialProgressStatus> | null) {
            this.init()
            this.backendSynced = true
            if (!tutorialProgress) return

            for (const key of Object.keys(tutorials) as TutorialKey[]) {
                const persist = tutorials[key].persist
                if (!persistUsesBackend(persist)) continue

                const finishedOnBackend = isFinishedStatus(tutorialProgress[key])
                if (persist === 'both') {
                    this.completed[key] = this.completed[key] === true || finishedOnBackend
                    if (finishedOnBackend) {
                        window.localStorage.setItem(storageKeyFor(key), 'true')
                    }
                } else {
                    this.completed[key] = finishedOnBackend
                }
            }
        },
        async ensureBackendProgress() {
            this.init()
            const loginStore = useLoginStore()
            if (!loginStore.userLoggedIn) {
                this.backendSynced = false
                return
            }
            if (this.backendSynced) return
            if (!Object.values(tutorials).some((tutorial) => persistUsesBackend(tutorial.persist))) {
                return
            }

            try {
                const response = await UserService.getLoggedInUser()
                this.syncFromProgress(response.data.tutorialProgress)
            } catch (error) {
                console.error('[Tutorial] Failed to load backend progress', error)
            }
        },
        start(tutorialKey: TutorialKey, force = false) {
            this.init()
            if (!tutorials[tutorialKey]) {
                console.warn(`[Tutorial] Unknown tutorial "${tutorialKey}"`)
                return
            }
            if (this.completed[tutorialKey] && !force) return
            this.activeTutorialKey = tutorialKey
            this.currentStepIndex = 0
            this.active = true
            if (force) {
                this.completed[tutorialKey] = false
            }
        },
        async maybeStartForRoute(routeName: string | symbol | null | undefined) {
            if (this.active || this.startingForRoute) return
            if (typeof routeName !== 'string' || !routeName) return

            this.startingForRoute = true
            try {
                await this.ensureBackendProgress()
                if (this.active) return

                const loginStore = useLoginStore()
                const userRole = loginStore.userLoggedIn ? UserService.provideUserRole() : undefined

                const match = Object.values(tutorials).find((tutorial) =>
                    this.shouldAutoStart(tutorial, routeName, loginStore.userLoggedIn, userRole),
                )

                if (match) {
                    this.start(match.key)
                }
            } finally {
                this.startingForRoute = false
            }
        },
        shouldAutoStart(
            tutorial: TutorialDefinition,
            routeName: string,
            userLoggedIn: boolean,
            userRole: string | undefined,
        ): boolean {
            if (!tutorial.triggerRouteNames.includes(routeName)) return false
            if (tutorial.requiresAuth && !userLoggedIn) return false
            if (tutorial.roles.length > 0 && (!userRole || !tutorial.roles.includes(userRole))) return false
            if (this.completed[tutorial.key]) return false
            if (this.isCoveredByParent(tutorial.key)) return false
            return true
        },
        isCoveredByParent(key: TutorialKey): boolean {
            return Object.values(tutorials).some((tutorial) => {
                if (tutorial.key === key || !tutorial.includes.includes(key)) return false
                return this.completed[tutorial.key] === true || this.activeTutorialKey === tutorial.key
            })
        },
        nextStep() {
            if (!this.active) return
            if (this.currentStepIndex < this.totalSteps - 1) {
                this.currentStepIndex += 1
            } else {
                this.finish()
            }
        },
        previousStep() {
            if (!this.active) return
            if (this.currentStepIndex > 0) {
                this.currentStepIndex -= 1
            }
        },
        finish() {
            const tutorialKey = this.activeTutorialKey
            this.active = false
            if (!tutorialKey) return

            this.completed[tutorialKey] = true
            this.persistProgress(tutorialKey)
        },
        persistProgress(tutorialKey: TutorialKey) {
            const persist = tutorials[tutorialKey].persist
            const loginStore = useLoginStore()

            if (persistUsesLocal(persist)) {
                window.localStorage.setItem(storageKeyFor(tutorialKey), 'true')
            }

            if (persistUsesBackend(persist) && loginStore.userLoggedIn) {
                UserService.updateTutorialProgress({
                    tutorialKey,
                    status: TutorialProgressStatus.FINISHED,
                }).catch((error) => {
                    console.error('[Tutorial] Failed to save progress', error)
                })
            }
        },
        skip() {
            this.finish()
        },
        stop() {
            this.active = false
        },
        resetHistory() {
            this.active = false
            this.currentStepIndex = 0
            this.backendSynced = false
            for (const key of Object.keys(tutorials) as TutorialKey[]) {
                this.completed[key] = false
                window.localStorage.removeItem(storageKeyFor(key))
            }
        },
    },
})
