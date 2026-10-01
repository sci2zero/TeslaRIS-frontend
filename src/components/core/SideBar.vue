<template>
    <!-- Mobile backdrop overlay -->
    <div 
        v-if="sidebarStore.isMobile && sidebarStore.isVisible"
        class="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 cursor-pointer"
        @click="sidebarStore.close()"
    />
    
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
                <span
                    v-if="!hasCustomLogo"
                    class="sidebar-logo"
                    aria-hidden="true"></span>
                <img
                    v-else
                    :src="logoUrl"
                    alt=""
                    class="sidebar-logo-img"
                />
                <span class="sidebar-brand">{{ brandTitle }}</span>
            </router-link>
        </div>

        <div class="sidebar-divider"></div>

        <button
            v-show="canScrollUp"
            class="sidebar-scroll-btn"
            aria-label="Scroll up"
            @click="scrollUp"
        >
            <span class="mdi mdi-chevron-up text-sm" />
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
                            
                            <v-list class="sidebar-menu-list" theme="dark">
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
                            :data-tutorial="item.key === 'persons' || item.key === 'organisation-units' ? `nav-${item.key}` : undefined"
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
            <span class="mdi mdi-chevron-down text-sm" />
        </button>
    </aside>
</template>

<script setup lang="ts">
import { useCrisContextInformation } from '@/composables/useCrisContextInformation';
import { useUserRole } from '@/composables/useUserRole';
import AuthenticationService from '@/services/AuthenticationService';
import PersonService from '@/services/PersonService';
import UserService from '@/services/UserService';
import { useLoginStore } from '@/stores/loginStore';
import { SIDEBAR_MOBILE_MAX_WIDTH, useSidebarStore } from '@/stores/sidebarStore';
import { usePublicConfigurationStore } from '@/stores/publicConfigurationStore';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
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

const {
    isAssessmentModuleEnabled,
    isDigitalLibraryEnabled
} = useCrisContextInformation();

const loginStore = useLoginStore();
const sidebarStore = useSidebarStore();
const publicConfigurationStore = usePublicConfigurationStore();
const personId = ref(-1);
const commissionId = ref(-1);
const institutionId = ref(-1);
const logoUrl = computed(() => publicConfigurationStore.logoDisplayUrl);
const hasCustomLogo = computed(() => publicConfigurationStore.hasCustomLogo);
const brandTitle = computed(() => returnCurrentLocaleContent(publicConfigurationStore.title) || "TeslaRIS");

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
    const isMobileView = window.matchMedia(`(max-width: ${SIDEBAR_MOBILE_MAX_WIDTH}px)`).matches;
    sidebarStore.setMobile(isMobileView);
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
    { key: 'cris-context-information', label: computed(() => i18n.t('routeLabel.crisContextInformation')), to: '/cris-context-information', icon: 'mdi-cog-outline', condition: computed(() => loginStore.userLoggedIn && isAdmin.value) },
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

const fundingsMenu = ref<MenuItem[]>([
  { key: 'funding-program', label: computed(() => i18n.t('fundingProgramsLabel')), to: '/funding-program', icon: 'mdi-file-tree' },
  { key: 'funding-call', label: computed(() => i18n.t('fundingCallsLabel')), to: '/funding-call', icon: 'mdi-bullhorn' },
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
    { key: 'projects', label: computed(() => i18n.t('projectsLabel')), to: '/project', icon: 'mdi-folder-star' },
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
        condition: computed(() => isAssessmentModuleEnabled.value && loginStore.userLoggedIn && isAdmin.value)
    },
    { key: 'document-backup', label: computed(() => i18n.t('backupLabel')), to: '/document-backup', icon: 'mdi-backup-restore', condition: computed(() => (isInstitutionalEditor.value)) },
    { key: 'thesis-library-reporting', label: computed(() => i18n.t('reportingLabel')), to: '/thesis-library-reporting', icon: 'mdi-file-chart', condition: computed(() => (isHeadOfLibrary.value)) },
    { 
        key: 'thesis-library', 
        label: computed(() => i18n.t('thesisLibraryLabel')), 
        to: '/thesis-library', 
        icon: 'mdi-book-open-variant',
        subItems: thesisLibraryMenu.value,
        condition: computed(() => isDigitalLibraryEnabled.value && !loginStore.userLoggedIn)
    },
    { 
        key: 'thesis-library', 
        label: computed(() => i18n.t('thesisLibraryLabel')), 
        to: '/thesis-library', 
        icon: 'mdi-book-open-variant',
        subItems: thesisLibraryMenu.value,
        condition: computed(() => (isDigitalLibraryEnabled.value && (isAdmin.value || isResearcher.value)))
    },
    { key: 'registry-book', label: computed(() => i18n.t('registryBookLabel')), to: '/registry-book', icon: 'mdi-book', condition: computed(() => (isPromotionRegistryAdministrator.value || isHeadOfLibrary.value || isInstitutionalLibrarian.value)) },
    { key: 'promotion-list', label: computed(() => i18n.t('promotionListLabel')), to: '/promotions', icon: 'mdi-school', condition: computed(() => (isPromotionRegistryAdministrator.value || isHeadOfLibrary.value || isInstitutionalLibrarian.value)) },
    { key: 'events', label: computed(() => i18n.t('eventListLabel')), to: '/events', icon: 'mdi-calendar', condition: computed(() => loginStore.userLoggedIn && isCommission.value) },
    { key: 'journals', label: computed(() => i18n.t('journalListLabel')), to: '/journals', icon: 'mdi-book-open-page-variant', condition: computed(() => loginStore.userLoggedIn && isCommission.value) },
    { key: 'prizes', label: computed(() => i18n.t('prizesLabel')), to: '/prizes', icon: 'mdi-seal', condition: computed(() => loginStore.userLoggedIn && (isCommission.value)) },
    { key: 'assessment-reporting', label: computed(() => i18n.t('reportingLabel')), to: '/assessment/reporting', icon: 'mdi-file-chart', condition: computed(() => loginStore.userLoggedIn && (isViceDeanForScience.value)) },
    { key: 'repository-analytics', label: computed(() => i18n.t('routeLabel.repositoryAnalytics')), to: '/repository-analytics', icon: 'mdi-home-analytics', condition: computed(() => isAdmin.value || isInstitutionalEditor.value || isViceDeanForScience.value) },
    { key: 'issue-explorer', label: computed(() => i18n.t('routeLabel.issueExplorer')), to: '/issue-explorer', icon: 'mdi-magnify-scan', condition: computed(() => isAdmin.value || isInstitutionalEditor.value || isViceDeanForScience.value) },
    { key: 'policy-explorer', label: computed(() => i18n.t('routeLabel.policyExplorer')), to: '/policy-explorer', icon: 'mdi-shield-check-outline', condition: computed(() => isAdmin.value || isInstitutionalEditor.value || isViceDeanForScience.value) },
    {
      key: 'fundings',
      label: computed(() => i18n.t('fundingsLabel')),
      to: '/funding-program',
      icon: 'mdi-cash-multiple',
      subItems: fundingsMenu.value,
      condition: computed(() => loginStore.userLoggedIn && isAdmin.value)
    },
    { key: 'm-service', label: computed(() => i18n.t('mServiceLabel')), to: '/assessment/m-service', icon: 'mdi-school', condition: computed(() => isAssessmentModuleEnabled.value && !isHeadOfLibrary.value && !isInstitutionalLibrarian.value && !isPromotionRegistryAdministrator.value) }
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
    --sidebar-primary: #c4b5fd;
    --sidebar-bg: #0f172a;
    --sidebar-text: #f8fafc;
    --sidebar-text-muted: #cbd5e1;
    --sidebar-hover-bg: rgba(255, 255, 255, 0.08);
    --sidebar-active-bg: rgba(196, 181, 253, 0.18);
    --sidebar-divider: rgba(248, 250, 252, 0.12);
    --sidebar-border: rgba(15, 23, 42, 0.6);
    --sidebar-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    --sidebar-scroll-bg: rgba(255, 255, 255, 0.08);

    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 16rem;
    height: 100vh;
    padding: 1.25rem 0.75rem;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    border-right: 1px solid var(--sidebar-border);
    box-shadow: var(--sidebar-shadow);
    transition: width 0.3s ease, transform 0.3s ease, padding 0.3s ease;
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding: 0 0.25rem;
}

.sidebar-logo {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    background-color: var(--sidebar-text);
    mask: url('/logov1.svg') center / contain no-repeat;
    -webkit-mask: url('/logov1.svg') center / contain no-repeat;
}

.sidebar-logo-img {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    object-fit: contain;
}

.sidebar-brand {
    color: var(--sidebar-text);
    font-weight: 600;
    font-size: 1rem;
    text-align: left;
    margin-top: 0;
}

.sidebar-item--brand {
    color: var(--sidebar-text);
}

.sidebar-item--brand:hover {
    background: var(--sidebar-hover-bg);
    color: var(--sidebar-text);
}

.sidebar-divider {
    height: 1px;
    width: auto;
    margin: 1rem 0.5rem;
    background: var(--sidebar-divider);
    flex-shrink: 0;
}

.sidebar-item {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.75rem;
    cursor: pointer;
    color: var(--sidebar-text-muted);
    text-decoration: none;
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
    font-size: 1.25rem;
    line-height: 1;
    margin-bottom: 0;
    flex-shrink: 0;
}

.sidebar-item-label {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.2;
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
    align-items: stretch;
    min-height: 0;
    width: 100%;
    position: relative;
}

.sidebar-scroll {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    overflow-y: auto;
    width: 100%;
    padding: 0 0.5rem;
    min-height: 0;
    flex: 1;
}

.sidebar-entry {
    position: relative;
    width: 100%;
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
    transform: none;
}
</style>

<style>
.sidebar-menu-list {
    --sidebar-primary: #c4b5fd;
    --sidebar-text: #f8fafc;
    --sidebar-menu-bg: #1e293b;
    --sidebar-menu-hover: rgba(255, 255, 255, 0.08);
    --sidebar-menu-border: rgba(248, 250, 252, 0.12);

    background: var(--sidebar-menu-bg) !important;
    color: var(--sidebar-text) !important;
    min-width: 12rem;
    border: 1px solid var(--sidebar-menu-border);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.sidebar-menu-list-item {
    color: var(--sidebar-text) !important;
}

.sidebar-menu-list-item .v-list-item-title {
    color: var(--sidebar-text) !important;
}

.sidebar-menu-list-item:hover {
    background: var(--sidebar-menu-hover) !important;
    color: var(--sidebar-primary) !important;
}

.sidebar-menu-list-item:hover .v-list-item-title {
    color: var(--sidebar-primary) !important;
}

.sidebar-menu-icon {
    color: #cbd5e1 !important;
}

.sidebar-menu-list-item:hover .sidebar-menu-icon {
    color: var(--sidebar-primary) !important;
}
</style>