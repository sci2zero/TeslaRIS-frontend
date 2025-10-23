<template>
    <!-- Mobile backdrop overlay -->
    <div 
        v-if="sidebarStore.isMobile && sidebarStore.isVisible"
        class="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 cursor-pointer"
        @click="sidebarStore.close()"
    ></div>
    
    <aside
        :class="[
            'fixed w-24 z-40 h-screen bg-gray-900 text-white flex flex-col items-center py-6 border-r border-gray-800 transition-all duration-300 shadow-lg',
            sidebarStore.isVisible ? 'translate-x-0' : '-translate-x-full'
        ]">
        <div class="flex items-center justify-center w-full">
            <router-link
                to="/"
                class="group relative flex flex-col items-center justify-center rounded-xl p-3 hover:bg-gray-800 transition-colors"
                aria-label="Logo">
                <img src="/logov1.svg" alt="Logo" class="size-10">
                <span
                    class="mt-2 px-2 py-1 text-xs text-white text-center font-medium">TeslaRIS</span>
            </router-link>
        </div>

        <div class="mt-3 h-px w-12 bg-gray-800"></div>

        <!-- Scroll up button -->
        <button
            v-show="canScrollUp"
            class="mt-4 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
            aria-label="Scroll up"
            @click="scrollUp"
        >
            <span class="mdi mdi-chevron-up text-sm"></span>
        </button>

        <!-- Menu with scrollable container -->
        <nav class="side-menu mt-4 flex flex-1 flex-col items-center gap-4 relative min-h-0">
            <div 
                ref="scrollContainer"
                class="flex flex-col items-center gap-2 overflow-y-auto scrollbar-hide w-full px-2"
                style="height: calc(100vh - 280px);"
                @scroll="handleScroll"
            >
                <div v-for="item in filteredMenuItems" :key="item.key" class="relative">
                    <template v-if="!item.condition || item.condition">
                        <v-menu
                            v-if="item.subItems && item.subItems.length > 0"
                            open-on-hover
                            open-on-click
                            location="end"
                            offset="8"
                            open-delay="100"
                        >
                            <template #activator="{ props }">
                                <div
                                    v-bind="props"
                                    class="group relative flex flex-col items-center justify-center rounded-xl p-3 transition-colors w-20 cursor-pointer"
                                    :class="isActive(item.to) ? 'bg-gray-800 text-rose-300' : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
                                    :aria-label="item.label"
                                >
                                    <span :class="['mdi', item.icon, 'text-2xl mb-2']"></span>
                                    <span class="text-xs text-center font-medium leading-tight">{{ item.label }}</span>
                                </div>
                            </template>
                            
                            <v-list class="sidebar-menu-list" color="rgb(31, 41, 55)">
                                <v-list-item
                                    v-for="subItem in item.subItems"
                                    v-show="!subItem.condition || subItem.condition"
                                    :key="subItem.key"
                                    :to="{path: '/' + $i18n.locale + subItem.to}"
                                    class="sidebar-menu-list-item"
                                >
                                    <template #prepend>
                                        <v-icon :icon="subItem.icon" class="text-gray-300"></v-icon>
                                    </template>
                                    <v-list-item-title class="text-sm">
                                        {{ subItem.label }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        
                        <router-link
                            v-else
                            :to="'/' + $i18n.locale + item.to"
                            class="group relative flex flex-col items-center justify-center rounded-xl p-3 transition-colors w-20"
                            :class="isActive(item.to) ? 'bg-gray-800 text-rose-300' : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
                            :aria-label="item.label"
                        >
                            <span :class="['mdi', item.icon, 'text-2xl mb-2']"></span>
                            <span class="text-xs text-center font-medium leading-tight">{{ item.label }}</span>
                        </router-link>
                    </template>
                </div>
            </div>
        </nav>

        <!-- Scroll down button -->
        <button
            v-show="canScrollDown"
            class="mb-4 p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
            aria-label="Scroll down"
            @click="scrollDown"
        >
            <span class="mdi mdi-chevron-down text-sm"></span>
        </button>
    </aside>
</template>

<script setup lang="ts">
import { useUserRole } from '@/composables/useUserRole';
import { useLoginStore } from '@/stores/loginStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { computed, reactive, ref, onMounted, nextTick, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const route = useRoute();
const i18n = useI18n();
const { isAdmin, isResearcher, isCommission, isViceDeanForScience, isHeadOfLibrary, isUserBoundToOU, isInstitutionalEditor, isInstitutionalLibrarian, isPromotionRegistryAdministrator } = useUserRole();
const loginStore = useLoginStore();
const sidebarStore = useSidebarStore();
const personId = ref(-1);
const commissionId = ref(-1);
const institutionId = ref(-1);

// Scroll functionality
const scrollContainer = ref<HTMLElement>();
const canScrollUp = ref(false);
const canScrollDown = ref(false);

const checkScrollButtons = () => {
    if (!scrollContainer.value) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
    canScrollUp.value = scrollTop > 10;
    canScrollDown.value = scrollTop + clientHeight < scrollHeight - 10;
};

const handleScroll = () => {
    checkScrollButtons();
};

const scrollUp = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ top: -120, behavior: 'smooth' });
    }
};

const scrollDown = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ top: 120, behavior: 'smooth' });
    }
};

onMounted(() => {
    nextTick(() => {
        // Wait a bit more for the DOM to be fully rendered
        setTimeout(() => {
            checkScrollButtons();
        }, 100);
        
        // Add resize observer to handle dynamic content changes
        if (scrollContainer.value) {
            const resizeObserver = new ResizeObserver(() => {
                checkScrollButtons();
            });
            resizeObserver.observe(scrollContainer.value);
        }
    });

    // Check initial screen size
    checkScreenSize();
    
    // Add resize listener for responsive behavior
    window.addEventListener('resize', checkScreenSize);
});

// Check screen size and update mobile state
const checkScreenSize = () => {
    const isMobileView = window.innerWidth < 768;
    const isVerySmall = window.innerWidth < 640;
    
    sidebarStore.setMobile(isMobileView);
    
    // Auto-hide sidebar on very small screens
    if (isVerySmall && sidebarStore.isVisible) {
        sidebarStore.close();
    }
};

// Cleanup resize listener
onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize);
});


type MenuItem = {
    key: string;
    label: string | Ref<string>;
    title?: string;
    to: string;
    icon: string; // mdi class
    subItems?: MenuItem[];
    condition?: any;
};

// const resourcesMenu = ref<MenuItem[]>([
//     { key: 'persons', label: computed(() => i18n.t('personListLabel')), to: '/persons', icon: 'mdi-account-multiple' },
//     { key: 'organisation-units', label: computed(() => i18n.t('ouListLabel')), to: '/organisation-units', icon: 'mdi-office-building' },
//     { key: 'scientific-results', label: computed(() => i18n.t('scientificResultsListLabel')), to: '/scientific-results', icon: 'mdi-file-document-multiple' },
//     { key: 'scientific-results-validation', label: computed(() => i18n.t('publicationsValidationLabel')), to: '/scientific-results/validation', icon: 'mdi-check-circle', condition: computed(() => isInstitutionalEditor.value || isAdmin.value) }
// ]);

const manageMenu = ref<MenuItem[]>([
    { key: 'users', label: computed(() => i18n.t('userPageLabel')), to: '/users', icon: 'mdi-account-cog' },
    { key: 'events', label: computed(() => i18n.t('eventListLabel')), to: '/events', icon: 'mdi-calendar' },
    { key: 'journals', label: computed(() => i18n.t('journalListLabel')), to: '/journals', icon: 'mdi-book-open-page-variant' },
    { key: 'book-series', label: computed(() => i18n.t('bookSeriesListLabel')), to: '/book-series', icon: 'mdi-book-multiple' },
    { key: 'publishers', label: computed(() => i18n.t('publisherListLabel')), to: '/publishers', icon: 'mdi-domain' },
    { key: 'countries', label: computed(() => i18n.t('countryListLabel')), to: '/countries', icon: 'mdi-earth' },
    { key: 'research-areas', label: computed(() => i18n.t('researchAreaListLabel')), to: '/research-areas', icon: 'mdi-flask' },
    { key: 'deduplication', label: computed(() => i18n.t('routeLabel.deduplication')), to: '/deduplication', icon: 'mdi-content-duplicate', condition: computed(() => loginStore.userLoggedIn && isAdmin.value) },
    { key: 'branding', label: computed(() => i18n.t('brandingLabel')), to: '/branding', icon: 'mdi-palette' },
    { key: 'api-key-management', label: computed(() => i18n.t('apiKeyManagementLabel')), to: '/api-key-management', icon: 'mdi-key' },
    { key: 'health-check', label: computed(() => i18n.t('routeLabel.healthCheck')), to: '/health-check', icon: 'mdi-heart-pulse' },
    { key: 'scheduled-tasks', label: computed(() => i18n.t('scheduleTasksLabel')), to: '/scheduled-tasks', icon: 'mdi-clock-outline', condition: computed(() => loginStore.userLoggedIn && isAdmin.value) },
    { key: 'document-backup', label: computed(() => i18n.t('backupLabel')), to: '/document-backup', icon: 'mdi-backup-restore', condition: computed(() => (isAdmin.value)) },
    { key: 'importer', label: computed(() => i18n.t('importerLabel')), to: '/importer', icon: 'mdi-import', condition: computed(() => loginStore.userLoggedIn && (isAdmin.value || isInstitutionalEditor.value)) }
]);

const assessmentsMenu = ref<MenuItem[]>([
    { key: 'indicators', label: computed(() => i18n.t('routeLabel.indicators')), to: '/assessment/indicators', icon: 'mdi-chart-line' },
    { key: 'classifications', label: computed(() => i18n.t('routeLabel.classifications')), to: '/assessment/classifications', icon: 'mdi-tag-multiple' },
    { key: 'assessment-rulebooks', label: computed(() => i18n.t('assessmentRulebookPageLabel')), to: '/assessment/assessment-rulebooks', icon: 'mdi-book-open' },
    { key: 'commissions', label: computed(() => i18n.t('routeLabel.commissions')), to: '/assessment/commissions', icon: 'mdi-account-group' },
    { key: 'reporting', label: computed(() => i18n.t('reportingLabel')), to: '/assessment/reporting', icon: 'mdi-file-chart', condition: computed(() => loginStore.userLoggedIn && (isAdmin.value)) }
]);

const thesisLibraryMenu = ref<MenuItem[]>([
    { key: 'thesis-library-reporting', label: computed(() => i18n.t('reportingLabel')), to: '/thesis-library-reporting', icon: 'mdi-file-chart', condition: computed(() => (isAdmin.value || isHeadOfLibrary.value)) },
    { key: 'thesis-library-search', label: computed(() => i18n.t('simpleSearchLabel')), to: '/thesis-library-search', icon: 'mdi-magnify' },
    { key: 'promotions', label: computed(() => i18n.t('promotionListLabel')), to: '/promotions', icon: 'mdi-school', condition: computed(() => (isAdmin.value || isPromotionRegistryAdministrator.value)) },
    { key: 'registry-book', label: computed(() => i18n.t('registryBookLabel')), to: '/registry-book', icon: 'mdi-book', condition: computed(() => (isAdmin.value || isPromotionRegistryAdministrator.value)) },
    { key: 'public-dissertations', label: computed(() => i18n.t('publicReviewDissertationsLabel')), to: '/thesis-library/public-dissertations', icon: 'mdi-file-document' },
    { key: 'theses', label: computed(() => i18n.t('thesesLabel')), to: '/scientific-results', icon: 'mdi-file-document-multiple', condition: computed(() => (isInstitutionalLibrarian.value)) },
    { key: 'thesis-library-backup', label: computed(() => i18n.t('backupLabel')), to: '/thesis-library-backup', icon: 'mdi-backup-restore', condition: computed(() => (isAdmin.value || isHeadOfLibrary.value || isInstitutionalLibrarian.value)) }
]);

const menuItems: MenuItem[] = reactive([
    // { key: 'home', label: computed(() => i18n.t('homeLabel')), to: '/', icon: 'mdi-home' },
    // { 
    //     key: 'resources', 
    //     label: computed(() => i18n.t('resources')), 
    //     to: '/resources', 
    //     icon: 'mdi-folder-multiple',
    //     subItems: resourcesMenu.value
    // },
    { key: 'persons', label: computed(() => i18n.t('personListLabel')), to: '/persons', icon: 'mdi-account-multiple' },
    { key: 'organisation-units', label: computed(() => i18n.t('ouListLabel')), to: '/organisation-units', icon: 'mdi-office-building' },
    { key: 'scientific-results', label: computed(() => i18n.t('scientificResultsListLabel')), to: '/scientific-results', icon: 'mdi-file-document-multiple' },
    { key: 'scientific-results-validation', label: computed(() => i18n.t('routeLabel.publicationsValidation')), to: '/scientific-results/validation', icon: 'mdi-check-circle', condition: computed(() => isInstitutionalEditor.value || isAdmin.value) },
    { key: 'advanced-search', label: computed(() => i18n.t('simpleSearchLabel')), to: '/advanced-search', icon: 'mdi-magnify' },
    { key: 'researcher-profile', label: computed(() => i18n.t('researcherProfileLabel')), to: `/persons/${personId.value}`, icon: 'mdi-account', condition: computed(() => loginStore.userLoggedIn && isResearcher.value && personId.value > 0) },
    { key: 'commission-profile', label: computed(() => i18n.t('commissionProfileLabel')), to: `/assessment/commissions/${commissionId.value}`, icon: 'mdi-account-group', condition: computed(() => loginStore.userLoggedIn && isCommission.value && commissionId.value > 0) },
    { key: 'institution-profile', label: computed(() => i18n.t('institutionProfileLabel')), to: `/organisation-units/${institutionId.value}`, icon: 'mdi-office-building', condition: computed(() => loginStore.userLoggedIn && (isUserBoundToOU.value as boolean) && institutionId.value > 0) },
    { 
        key: 'manage', 
        label: computed(() => i18n.t('manage')), 
        to: '/manage', 
        icon: 'mdi-cog',
        subItems: manageMenu.value,
        condition: computed(() => loginStore.userLoggedIn && isAdmin.value)
    },
    { 
        key: 'assessment', 
        label: computed(() => i18n.t('assessmentLabel')), 
        to: '/assessment', 
        icon: 'mdi-clipboard-check',
        subItems: assessmentsMenu.value,
        condition: computed(() => loginStore.userLoggedIn && isAdmin.value)
    },
    { key: 'document-backup', label: computed(() => i18n.t('backupLabel')), to: '/document-backup', icon: 'mdi-backup-restore', condition: computed(() => (isInstitutionalEditor.value)) },
    { 
        key: 'thesis-library', 
        label: computed(() => i18n.t('thesisLibraryLabel')), 
        to: '/thesis-library', 
        icon: 'mdi-book-open-variant',
        subItems: thesisLibraryMenu.value
    },
    { key: 'events', label: computed(() => i18n.t('eventListLabel')), to: '/events', icon: 'mdi-calendar', condition: computed(() => loginStore.userLoggedIn && isCommission.value) },
    { key: 'journals', label: computed(() => i18n.t('journalListLabel')), to: '/journals', icon: 'mdi-book-open-page-variant', condition: computed(() => loginStore.userLoggedIn && isCommission.value) },
    { key: 'assessment-reporting', label: computed(() => i18n.t('reportingLabel')), to: '/assessment/reporting', icon: 'mdi-file-chart', condition: computed(() => loginStore.userLoggedIn && (isViceDeanForScience.value)) },
    { key: 'm-service', label: computed(() => i18n.t('mServiceLabel')), to: '/assessment/m-service', icon: 'mdi-school', condition: true }
]);

const filteredMenuItems = computed(() => {
    return menuItems.filter(item => {
        // Check main item condition
        if (item.condition !== undefined) {
            const conditionResult = typeof item.condition === 'function' ? item.condition() : item.condition;
            if (conditionResult === false) {
                return false;
            }
        }
        
        // If item has subItems, filter them as well
        if (item.subItems) {
            const filteredSubItems = item.subItems.filter(subItem => {
                if (subItem.condition !== undefined) {
                    const subConditionResult = typeof subItem.condition === 'function' ? subItem.condition() : subItem.condition;
                    return subConditionResult !== false;
                }
                return true;
            });
            
            // Update the item's subItems with filtered ones
            item.subItems = filteredSubItems;
        }
        
        return true;
    });
});

function isActive(path: string): boolean {
    return route.path === path || route.path.startsWith(path + '/');
}
</script>

<style scoped>
@reference "@/assets/main.css";

/* Hide scrollbar but maintain scroll functionality */
.scrollbar-hide {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;     /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;             /* Safari and Chrome */
}

/* Ensure smooth scrolling behavior */
.scrollbar-hide {
    scroll-behavior: smooth;
}

/* Ensure the scroll container is properly sized */
nav {
    min-height: 0;
    flex: 1;
}

/* Make sure the scroll container takes available space */
.scrollbar-hide {
    min-height: 0;
    flex: 1;
}


.side-menu button,
.side-menu a {
    transition: all 0.2s ease-in-out;
}


.side-menu a:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>

<style>
@reference "@/assets/main.css";

.sidebar-menu-list {
    @apply !bg-gray-800 text-white min-w-48;
}

.sidebar-menu-list-item {
    @apply hover:bg-gray-700 text-white;
}
</style>