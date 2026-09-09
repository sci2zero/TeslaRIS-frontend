<template>
    <!-- Mobile backdrop overlay -->
    <div 
        v-if="sidebarStore.isMobile && sidebarStore.isVisible"
        class="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 cursor-pointer"
        @click="sidebarStore.close()"
    ></div>
    
    <aside
        :class="[
            'sidebar',
            sidebarStore.isVisible ? 'translate-x-0' : '-translate-x-full'
        ]">
        <div class="sidebar-header">
            <router-link
                to="/"
                class="sidebar-item sidebar-item--brand"
                aria-label="Logo">
                <span class="sidebar-logo" aria-hidden="true"></span>
                <span class="sidebar-brand">TeslaRIS</span>
            </router-link>
        </div>

        <div class="sidebar-divider"></div>

        <button
            v-show="canScrollUp"
            class="sidebar-scroll-btn"
            aria-label="Scroll up"
            @click="scrollUp"
        >
            <span class="mdi mdi-chevron-up text-sm"></span>
        </button>

        <nav class="side-menu">
            <div
                ref="scrollContainer"
                class="sidebar-scroll scrollbar-hide"
                @scroll="handleScroll"
            >
                <div v-for="item in filteredMenuItems" :key="item.key" class="sidebar-entry">
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
                                    class="sidebar-item"
                                    :class="{ 'sidebar-item--active': isActive(item.to) }"
                                    :aria-label="item.label"
                                >
                                    <span :class="['mdi', item.icon, 'sidebar-item-icon']"></span>
                                    <span class="sidebar-item-label">{{ item.label }}</span>
                                    <span class="mdi mdi-chevron-right sidebar-item-chevron"></span>
                                </div>
                            </template>
                            
                            <v-list class="sidebar-menu-list" color="#320f9b">
                                <v-list-item
                                    v-for="subItem in item.subItems"
                                    v-show="!subItem.condition || subItem.condition"
                                    :key="subItem.key"
                                    :to="{path: '/' + $i18n.locale + subItem.to}"
                                    class="sidebar-menu-list-item"
                                >
                                    <template #prepend>
                                        <v-icon :icon="subItem.icon" class="sidebar-menu-icon"></v-icon>
                                    </template>
                                    <v-list-item-title class="text-sm">
                                        {{ subItem.label }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        
                        <router-link
                            v-else
                            :to="'/' + $i18n.locale + item.to + (item.dynamicValue ? item.dynamicValue : '')"
                            class="sidebar-item"
                            :class="{ 'sidebar-item--active': isActive(item.to) }"
                            :aria-label="item.label"
                        >
                            <span :class="['mdi', item.icon, 'sidebar-item-icon']"></span>
                            <span class="sidebar-item-label">{{ item.label }}</span>
                        </router-link>
                    </template>
                </div>
            </div>
        </nav>

        <button
            v-show="canScrollDown"
            class="sidebar-scroll-btn"
            aria-label="Scroll down"
            @click="scrollDown"
        >
            <span class="mdi mdi-chevron-down text-sm"></span>
        </button>
    </aside>
</template>

<script setup lang="ts">
import { useUserRole } from '@/composables/useUserRole';
import AuthenticationService from '@/services/AuthenticationService';
import PersonService from '@/services/PersonService';
import UserService from '@/services/UserService';
import { useLoginStore } from '@/stores/loginStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { computed, ref, onMounted, nextTick, onUnmounted, watch } from 'vue';
import type { Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';


const route = useRoute();
const i18n = useI18n();
const {
    isAdmin, isResearcher, isCommission,
    isViceDeanForScience, isHeadOfLibrary,
    isUserBoundToOU, isInstitutionalEditor,
    isInstitutionalLibrarian,
    isPromotionRegistryAdministrator
} = useUserRole();

const loginStore = useLoginStore();
const sidebarStore = useSidebarStore();
const personId = ref(-1);
const commissionId = ref(-1);
const institutionId = ref(-1);

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
        setTimeout(() => {
            checkScrollButtons();
        }, 100);
        
        if (scrollContainer.value) {
            const resizeObserver = new ResizeObserver(() => {
                checkScrollButtons();
            });
            resizeObserver.observe(scrollContainer.value);
        }
    });

    checkScreenSize();
    
    window.addEventListener('resize', checkScreenSize);

    if (AuthenticationService.userLoggedIn()) {
        populateUserData();
    }
});

const populateUserData = () => {
    UserService.getLoggedInUser().then((response) => {
        if (isCommission.value) {
            commissionId.value = response.data.commissionId;
        }
        
        if (isUserBoundToOU.value) {
            institutionId.value = response.data.organisationUnitId;
        }
    });

    PersonService.getPersonId().then(response => {
        if(response.data) {
            personId.value = response.data;
        }
    });
};

watch(() => loginStore.usernameReloadRequests, () => {
    populateUserData();
});

watch(() => loginStore.userLoggedIn, () => {
    if (loginStore.userLoggedIn) {
        populateUserData();
    }
});

const checkScreenSize = () => {
    const isMobileView = window.innerWidth < 768;
    const isVerySmall = window.innerWidth < 640;
    
    sidebarStore.setMobile(isMobileView);
    
    if (isVerySmall && sidebarStore.isVisible) {
        sidebarStore.close();
    }
};

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
    dynamicValue?: any;
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
    { key: 'employment-positions', label: computed(() => i18n.t('employmentPositionListLabel')), to: '/employment-positions', icon: 'mdi-account-hard-hat' },
    { key: 'identifiers', label: computed(() => i18n.t('identifierListLabel')), to: '/identifiers', icon: 'mdi-card-account-details-outline' },
    { key: 'deduplication', label: computed(() => i18n.t('routeLabel.deduplication')), to: '/deduplication', icon: 'mdi-content-duplicate', condition: computed(() => loginStore.userLoggedIn && isAdmin.value) },
    { key: 'branding', label: computed(() => i18n.t('brandingLabel')), to: '/branding', icon: 'mdi-palette' },
    { key: 'api-key-management', label: computed(() => i18n.t('apiKeyManagementLabel')), to: '/api-key-management', icon: 'mdi-key' },
    { key: 'language-tags', label: computed(() => i18n.t('routeLabel.languageTags')), to: '/language-tags', icon: 'mdi-tag-multiple-outline' },
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
    { key: 'reporting', label: computed(() => i18n.t('reportingLabel')), to: '/assessment/reporting', icon: 'mdi-file-chart', condition: computed(() => loginStore.userLoggedIn && (isAdmin.value)) },
    { key: 'prizes', label: computed(() => i18n.t('prizesLabel')), to: '/prizes', icon: 'mdi-seal', condition: computed(() => loginStore.userLoggedIn && (isAdmin.value)) }
]);

const thesisLibraryMenu = ref<MenuItem[]>([
    { key: 'thesis-library-reporting', label: computed(() => i18n.t('reportingLabel')), to: '/thesis-library-reporting', icon: 'mdi-file-chart', condition: computed(() => (isAdmin.value)) },
    { key: 'thesis-library-search', label: computed(() => i18n.t('simpleSearchLabel')), to: '/thesis-library-search', icon: 'mdi-magnify', condition: computed(() => (!isHeadOfLibrary.value && !isInstitutionalLibrarian.value)) },
    { key: 'promotions', label: computed(() => i18n.t('promotionListLabel')), to: '/promotions', icon: 'mdi-school', condition: computed(() => (isAdmin.value || isPromotionRegistryAdministrator.value)) },
    { key: 'registry-book', label: computed(() => i18n.t('registryBookLabel')), to: '/registry-book', icon: 'mdi-book', condition: computed(() => (isAdmin.value || isPromotionRegistryAdministrator.value)) },
    { key: 'public-dissertations', label: computed(() => i18n.t('publicReviewDissertationsLabel')), to: '/thesis-library/public-dissertations', icon: 'mdi-file-document', condition: computed(() => (!isHeadOfLibrary.value && !isInstitutionalLibrarian.value)) },
    { key: 'thesis-library-backup', label: computed(() => i18n.t('backupLabel')), to: '/thesis-library-backup', icon: 'mdi-backup-restore', condition: computed(() => (isAdmin.value)) }
]);

const menuItems = ref<MenuItem[]>([
    // { key: 'home', label: computed(() => i18n.t('homeLabel')), to: '/', icon: 'mdi-home' },
    // { 
    //     key: 'resources', 
    //     label: computed(() => i18n.t('resources')), 
    //     to: '/resources', 
    //     icon: 'mdi-folder-multiple',
    //     subItems: resourcesMenu.value
    // },
    { key: 'researcher-profile', label: computed(() => i18n.t('researcherProfileLabel')), to: '/persons/', dynamicValue: computed(() => personId.value), icon: 'mdi-account', condition: computed(() => loginStore.userLoggedIn && isResearcher.value && personId.value > 0) },
    { key: 'commission-profile', label: computed(() => i18n.t('commissionProfileLabel')), to: '/assessment/commissions/', dynamicValue: computed(() => commissionId.value), icon: 'mdi-account-group', condition: computed(() => loginStore.userLoggedIn && isCommission.value && commissionId.value > 0) },
    { key: 'institution-profile', label: computed(() => i18n.t('institutionProfileLabel')), to: '/organisation-units/', dynamicValue: computed(() => institutionId.value), icon: 'mdi-office-building', condition: computed(() => loginStore.userLoggedIn && (isUserBoundToOU.value as boolean) && institutionId.value > 0) },
    { key: 'persons', label: computed(() => i18n.t('personListLabel')), to: '/persons', icon: 'mdi-account-multiple', condition: computed(() => !isHeadOfLibrary.value && !isInstitutionalLibrarian.value && !isPromotionRegistryAdministrator.value) },
    { key: 'organisation-units', label: computed(() => i18n.t('ouListLabel')), to: '/organisation-units', icon: 'mdi-office-building', condition: computed(() => !isHeadOfLibrary.value && !isInstitutionalLibrarian.value && !isPromotionRegistryAdministrator.value) },
    { key: 'scientific-results', label: computed(() => i18n.t('scientificResultsListLabel')), to: '/scientific-results', icon: 'mdi-file-document-multiple', condition: computed(() => !isHeadOfLibrary.value && !isInstitutionalLibrarian.value && !isPromotionRegistryAdministrator.value) },
    { key: 'theses-list', label: computed(() => i18n.t('thesesLabel')), to: '/scientific-results', icon: 'mdi-file-document-multiple', condition: computed(() => loginStore.userLoggedIn && (isHeadOfLibrary.value || isInstitutionalLibrarian.value)) },
    { key: 'add-thesis', label: computed(() => i18n.t('createThesisLabel')), to: '/scientific-results/thesis/submit-thesis', icon: 'mdi-file-document-edit', condition: computed(() => loginStore.userLoggedIn && (isHeadOfLibrary.value || isInstitutionalLibrarian.value)) },
    { key: 'public-review', label: computed(() => i18n.t('publicReviewDissertationsLabel')), to: '/thesis-library/public-dissertations', icon: 'mdi-file-document', condition: computed(() => loginStore.userLoggedIn && (isHeadOfLibrary.value || isInstitutionalLibrarian.value)) },
    { key: 'scientific-results-validation', label: computed(() => i18n.t('routeLabel.publicationsValidation')), to: '/scientific-results/validation', icon: 'mdi-check-circle', condition: computed(() => isInstitutionalEditor.value || isAdmin.value) },
    { key: 'advanced-search', label: computed(() => i18n.t('simpleSearchLabel')), to: '/advanced-search', icon: 'mdi-magnify', condition: computed(() => !isHeadOfLibrary.value && !isInstitutionalLibrarian.value && !isPromotionRegistryAdministrator.value) },
    { key: 'thesis-library-search', label: computed(() => i18n.t('simpleSearchLabel')), to: '/thesis-library-search', icon: 'mdi-magnify', condition: computed(() => loginStore.userLoggedIn && (isHeadOfLibrary.value || isInstitutionalLibrarian.value || isPromotionRegistryAdministrator.value)) },
    { key: 'theses-backup', label: computed(() => i18n.t('backupLabel')), to: '/thesis-library-backup', icon: 'mdi-backup-restore', condition: computed(() => (loginStore.userLoggedIn && (isHeadOfLibrary.value || isInstitutionalLibrarian.value))) },
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
    { key: 'thesis-library-reporting', label: computed(() => i18n.t('reportingLabel')), to: '/thesis-library-reporting', icon: 'mdi-file-chart', condition: computed(() => (isHeadOfLibrary.value)) },
    { 
        key: 'thesis-library', 
        label: computed(() => i18n.t('thesisLibraryLabel')), 
        to: '/thesis-library', 
        icon: 'mdi-book-open-variant',
        subItems: thesisLibraryMenu.value,
        condition: computed(() => !loginStore.userLoggedIn)
    },
    { 
        key: 'thesis-library', 
        label: computed(() => i18n.t('thesisLibraryLabel')), 
        to: '/thesis-library', 
        icon: 'mdi-book-open-variant',
        subItems: thesisLibraryMenu.value,
        condition: computed(() => (isAdmin.value || isResearcher.value))
    },
    { key: 'registry-book', label: computed(() => i18n.t('registryBookLabel')), to: '/registry-book', icon: 'mdi-book', condition: computed(() => (isPromotionRegistryAdministrator.value || isHeadOfLibrary.value || isInstitutionalLibrarian.value)) },
    { key: 'promotion-list', label: computed(() => i18n.t('promotionListLabel')), to: '/promotions', icon: 'mdi-school', condition: computed(() => (isPromotionRegistryAdministrator.value || isHeadOfLibrary.value || isInstitutionalLibrarian.value)) },
    { key: 'events', label: computed(() => i18n.t('eventListLabel')), to: '/events', icon: 'mdi-calendar', condition: computed(() => loginStore.userLoggedIn && isCommission.value) },
    { key: 'journals', label: computed(() => i18n.t('journalListLabel')), to: '/journals', icon: 'mdi-book-open-page-variant', condition: computed(() => loginStore.userLoggedIn && isCommission.value) },
    { key: 'prizes', label: computed(() => i18n.t('prizesLabel')), to: '/prizes', icon: 'mdi-seal', condition: computed(() => loginStore.userLoggedIn && (isCommission.value)) },
    { key: 'assessment-reporting', label: computed(() => i18n.t('reportingLabel')), to: '/assessment/reporting', icon: 'mdi-file-chart', condition: computed(() => loginStore.userLoggedIn && (isViceDeanForScience.value)) },
    { key: 'm-service', label: computed(() => i18n.t('mServiceLabel')), to: '/assessment/m-service', icon: 'mdi-school', condition: computed(() => !isHeadOfLibrary.value && !isInstitutionalLibrarian.value && !isPromotionRegistryAdministrator.value) }
]);

const filteredMenuItems = computed(() => {
    return menuItems.value.filter(item => {
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

const isActive = (path: string): boolean => {
    return route.path === path || route.path.startsWith(path + '/');
};

</script>

<style scoped>
@reference "@/assets/main.css";

.sidebar {
    --sidebar-primary: #320f9b;
    --sidebar-bg: #ffffff;
    --sidebar-text: #334155;
    --sidebar-text-muted: #64748b;
    --sidebar-hover-bg: rgba(50, 15, 155, 0.06);
    --sidebar-active-bg: rgba(50, 15, 155, 0.1);
    --sidebar-divider: #e2e8f0;
    --sidebar-border: #e2e8f0;
    --sidebar-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
    --sidebar-scroll-bg: #f1f5f9;

    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 6rem;
    height: 100vh;
    padding: 1.25rem 0 1rem;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    border-right: 1px solid var(--sidebar-border);
    box-shadow: var(--sidebar-shadow);
    transition: width 0.3s ease, transform 0.3s ease, padding 0.3s ease;
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.sidebar-logo {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    background-color: var(--sidebar-primary);
    mask: url('/logov1.svg') center / contain no-repeat;
    -webkit-mask: url('/logov1.svg') center / contain no-repeat;
}

.sidebar-brand {
    color: var(--sidebar-primary);
    font-weight: 600;
    font-size: 0.75rem;
    text-align: center;
    margin-top: 0.5rem;
}

.sidebar-divider {
    height: 1px;
    width: 3rem;
    margin: 0.75rem 0;
    background: var(--sidebar-divider);
    flex-shrink: 0;
}

.sidebar-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 5rem;
    padding: 0.75rem 0.5rem;
    border-radius: 0.75rem;
    cursor: pointer;
    color: var(--sidebar-text-muted);
    transition: background 0.2s ease, color 0.2s ease;
}

.sidebar-item:hover {
    background: var(--sidebar-hover-bg);
    color: var(--sidebar-primary);
}

.sidebar-item--active {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-primary);
}

.sidebar-item-icon {
    font-size: 1.5rem;
    line-height: 1;
    margin-bottom: 0.5rem;
}

.sidebar-item-label {
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
}

.sidebar-item-chevron {
    display: none;
}

.sidebar-scroll-btn {
    margin: 0.5rem 0;
    padding: 0.25rem;
    border-radius: 9999px;
    background: var(--sidebar-scroll-bg);
    color: var(--sidebar-text-muted);
    transition: background 0.2s ease, color 0.2s ease;
    flex-shrink: 0;
}

.sidebar-scroll-btn:hover {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-primary);
}

.side-menu {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    min-height: 0;
    width: 100%;
    position: relative;
}

.sidebar-scroll {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    overflow-y: auto;
    width: 100%;
    padding: 0 0.5rem;
    min-height: 0;
    flex: 1;
}

.sidebar-entry {
    position: relative;
    width: auto;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: smooth;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.side-menu a {
    transition: all 0.2s ease-in-out;
}

.side-menu a:hover {
    transform: translateY(-1px);
}

@media (min-width: 1024px) {
    .sidebar {
        width: 16rem;
        align-items: stretch;
        padding: 1.25rem 0.75rem;
    }

    .sidebar-header {
        justify-content: flex-start;
        padding: 0 0.25rem;
    }

    .sidebar-logo {
        width: 2rem;
        height: 2rem;
    }

    .sidebar-brand {
        font-size: 1rem;
        text-align: left;
        margin-top: 0;
    }

    .sidebar-divider {
        width: auto;
        margin: 1rem 0.5rem;
    }

    .sidebar-item {
        flex-direction: row;
        justify-content: flex-start;
        width: 100%;
        gap: 0.75rem;
        padding: 0.625rem 0.75rem;
    }

    .sidebar-item-icon {
        font-size: 1.25rem;
        margin-bottom: 0;
        flex-shrink: 0;
    }

    .sidebar-item-label {
        font-size: 0.875rem;
        text-align: left;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .sidebar-item-chevron {
        display: block;
        margin-left: auto;
        font-size: 1rem;
        opacity: 0.5;
        flex-shrink: 0;
    }

    .side-menu,
    .sidebar-scroll {
        align-items: stretch;
    }

    .sidebar-entry {
        width: 100%;
    }

    .side-menu a:hover {
        transform: none;
    }
}
</style>

<style>
.sidebar-menu-list {
    --sidebar-primary: #320f9b;
    --sidebar-text: #334155;
    --sidebar-menu-bg: #ffffff;
    --sidebar-menu-hover: rgba(50, 15, 155, 0.06);
    --sidebar-menu-border: #e2e8f0;

    background: var(--sidebar-menu-bg) !important;
    color: var(--sidebar-text) !important;
    min-width: 12rem;
    border: 1px solid var(--sidebar-menu-border);
    box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
}

.sidebar-menu-list-item {
    color: var(--sidebar-text) !important;
}

.sidebar-menu-list-item:hover {
    background: var(--sidebar-menu-hover) !important;
    color: var(--sidebar-primary) !important;
}

.sidebar-menu-icon {
    color: #64748b !important;
}

.sidebar-menu-list-item:hover .sidebar-menu-icon {
    color: var(--sidebar-primary) !important;
}
</style>