<template>
    <div id="navbar">
        <v-toolbar app height="auto">
            <div class="wide-container flex-wrap toolbar-container">
                <div class="d-flex">
                    <v-toolbar-title :class="isLargeScreen ? '' : 'lowered'">
                        <router-link to="/" class="logo-link app-title">
                            {{ returnCurrentLocaleContent(appTitle) }}
                        </router-link>
                    </v-toolbar-title>

                    <!-- Menu -->
                    <div v-if="isLargeScreen" class="d-flex ps-5 flex-wrap">
                        <div v-for="item in leftMenuItems" :key="item.title" class="text-center">
                            <template v-if="item.type == 'menu'">
                                <v-menu v-if="item.condition == undefined || item.condition" open-on-hover
                                    open-delay="0">
                                    <template #activator="{ props }">
                                        <v-btn size="small" v-bind="props" class="no-uppercase">
                                            {{ item.title }}

                                            <span>
                                                <v-icon icon="mdi-chevron-down"></v-icon>
                                            </span>
                                        </v-btn>
                                    </template>

                                    <v-list>
                                        <v-list-item
                                            v-for="(subItem, index) in item.subItems?.filter(subItem => subItem.condition != false)"
                                            :key="index" class="ps-5 pe-5" :value="item.title"
                                            :to="subItem.pathName !== undefined ? '/' + $i18n.locale + '/' + subItem.pathName : undefined"
                                            link>
                                            <v-list-item-title>
                                                {{ subItem.title }}
                                            </v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </template>
                            <template v-else-if="item.type == 'dynamic' && item.condition">
                                <v-btn v-if="item.condition" :key="item.title" size="small"
                                    :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName + '/' + item.dynamicValue : undefined"
                                    :variant="item.variant" :color="item.color" class="no-uppercase nav-items"
                                    @click="item.click">
                                    {{ item.title }}
                                </v-btn>
                            </template>
                            <template v-else>
                                <v-btn v-if="item.condition == undefined || item.condition" :key="item.title"
                                    size="small"
                                    :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName : undefined"
                                    :variant="item.variant" :color="item.color" class="no-uppercase"
                                    :icon="item.type == 'icon'" exact>
                                    <v-icon v-if="item.icon" left dark>
                                        {{ item.icon }}
                                    </v-icon>
                                    <template v-if="item.type != 'icon'">
                                        {{ item.title }}
                                    </template>
                                </v-btn>
                            </template>
                        </div>
                    </div>
                    <v-app-bar-nav-icon v-if="!isLargeScreen" @click="drawer = !drawer" />
                    <v-navigation-drawer v-if="!isLargeScreen" v-model="drawer" temporary location="left">
                        <v-list class="align-start">
                            <template v-for="item in leftMenuItems" :key="item.title">
                                <!-- menu type -->
                                <v-list-item
                                    v-if="item.type === 'menu' && (item.condition === undefined || item.condition)"
                                    class="text-left">
                                    <v-menu open-on-hover location="end bottom" open-delay="0">
                                        <template #activator="{ props }">
                                            <v-btn size="small" v-bind="props" class="no-uppercase">
                                                {{ item.title }}
                                                <v-icon icon="mdi-chevron-down" />
                                            </v-btn>
                                        </template>
                                        <v-list>
                                            <v-list-item
                                                v-for="(subItem, index) in item.subItems?.filter(subItem => subItem.condition !== false)"
                                                :key="index" class="ps-5 pe-5"
                                                :to="subItem.pathName !== undefined ? '/' + $i18n.locale + '/' + subItem.pathName : undefined"
                                                link>
                                                <v-list-item-title>{{ subItem.title }}</v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </v-list-item>

                                <!-- dynamic type -->
                                <v-list-item v-else-if="item.type === 'dynamic' && item.condition" class="text-left">
                                    <v-btn size="small"
                                        :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName + '/' + item.dynamicValue : undefined"
                                        :variant="item.variant" :color="item.color" class="no-uppercase nav-items"
                                        @click="item.click">
                                        {{ item.title }}
                                    </v-btn>
                                </v-list-item>

                                <!-- default type -->
                                <v-list-item v-else-if="item.condition === undefined || item.condition"
                                    class="text-left">
                                    <v-btn size="small"
                                        :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName : undefined"
                                        :variant="item.variant" :color="item.color" class="no-uppercase"
                                        :icon="item.type === 'icon'" exact>
                                        <v-icon v-if="item.icon" left dark>
                                            {{ item.icon }}
                                        </v-icon>
                                        <template v-if="item.type !== 'icon'">
                                            {{ item.title }}
                                        </template>
                                    </v-btn>
                                </v-list-item>
                            </template>
                        </v-list>
                        <v-divider class="my-2" />

                        <div class="text-center pa-2">
                            <v-btn color="primary" variant="text" class="no-uppercase" @click="drawer = false">
                                <v-icon start icon="mdi-close" />
                                {{ $t("closeLabel") }}
                            </v-btn>
                        </div>
                    </v-navigation-drawer>
                </div>

                <v-spacer></v-spacer>

                <div class="d-flex">
                    <template v-for="(item, index) in menuItems">
                        <template v-if="item.type == 'divider'">
                            <v-divider :key="index" inset class="ms-2 me-2" vertical></v-divider>
                        </template>
                        <template v-else-if="item.type == 'lang_component'">
                            <component :is="item.component" :key="index"></component>
                        </template>
                        <template v-else-if="item.type == 'notification_component' && item.condition">
                            <component :is="item.component" :key="index"></component>
                        </template>
                        <template v-else>
                            <v-btn v-if="item.condition" :key="item.title"
                                :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName : undefined"
                                :variant="item.variant" :color="item.color"
                                :class="'no-uppercase nav-items' + (item.title ? ' mt-1' : '')"
                                :icon="item.type == 'icon'" @click="item.click">
                                <v-badge :content="item.badge" :model-value="false">
                                    <v-icon left dark>
                                        {{ item.icon }}
                                    </v-icon>
                                </v-badge>
                                <span v-if="item.type != 'icon'" class="d-none d-md-flex">
                                    {{ item.title }}
                                </span>
                            </v-btn>
                        </template>
                    </template>
                </div>
            </div>
        </v-toolbar>
    </div>
</template>

<script lang="ts">
import LangChangeItem from './LangChangeItem.vue';
import UserService from "@/services/UserService";
import AuthenticationService from '@/services/AuthenticationService';
import { computed, defineComponent, onMounted, watch } from 'vue';
import { useLoginStore } from '@/stores/loginStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
import type { ComputedRef, Ref } from 'vue';
import type { Component } from 'vue';
import { shallowRef } from 'vue';
import NotificationItem from './NotificationItem.vue';
import PersonService from "@/services/PersonService";
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import BrandingService from '@/services/BrandingService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useUserRole } from '@/composables/useUserRole';
import { useBrandingStore } from '@/stores/brandingStore';
import { useDisplay } from 'vuetify/lib/framework.mjs';


interface MenuItem {
    title?: ComputedRef<string> | string | undefined;
    pathName?: string;
    click?: () => void;
    icon?: string;
    type: string;
    condition?: Ref<boolean> | boolean;
    badge?: Ref<number> | number;
    variant?: 'text' | 'outlined' | 'flat' | 'elevated' | 'tonal' | 'plain';
    color?: string;
    subItems?: MenuItem[] | Ref<MenuItem[]>;
    component?: Component;
    dynamicValue?: ComputedRef;
}


export default defineComponent(
    {
        name: "NavbarHeader",
        components: { LangChangeItem, NotificationItem },
        setup() {
            const drawer = ref(false);
            const { width } = useDisplay();
            const isLargeScreen = computed(() => width.value > 1500);

            const langChangeItem = shallowRef(LangChangeItem);
            const notificationItem = shallowRef(NotificationItem);

            const i18n = useI18n();
            const personId = ref(-1);
            const commissionId = ref(-1);
            const institutionId = ref(-1);

            const homeLabel = computed(() => i18n.t("homeLabel"));

            const resourcesLabel = computed(() => i18n.t("resources"));
            const manageLabel = computed(() => i18n.t("manage"));

            const personListLabel = computed(() => i18n.t("personListLabel"));
            const ouListLabel = computed(() => i18n.t("ouListLabel"));
            const scientificResultsListLabel = computed(() => i18n.t("scientificResultsListLabel"));
            const simpleSearchLabel = computed(() => i18n.t("simpleSearchLabel"));
            const userPageLabel = computed(() => i18n.t("userPageLabel"));
            const eventListLabel = computed(() => i18n.t("eventListLabel"));
            const journalListLabel = computed(() => i18n.t("journalListLabel"));
            const bookSeriesListLabel = computed(() => i18n.t("bookSeriesListLabel"));
            const publisherListLabel = computed(() => i18n.t("publisherListLabel"));
            const importerLabel = computed(() => i18n.t("importerLabel"));
            const researcherProfileLabel = computed(() => i18n.t("researcherProfileLabel"));
            const commissionProfileLabel = computed(() => i18n.t("commissionProfileLabel"));
            const deduplicateLabel = computed(() => i18n.t("deduplicationPageLabel"));
            const countryListLabel = computed(() => i18n.t("countryListLabel"));
            const researchAreaListLabel = computed(() => i18n.t("researchAreaListLabel"));
            const assessmentLabel = computed(() => i18n.t("assessmentLabel"));
            const indicatorPageLabel = computed(() => i18n.t("indicatorListLabel"));
            const assessmentRulebookPageLabel = computed(() => i18n.t("assessmentRulebookPageLabel"));
            const commissionsLabel = computed(() => i18n.t("commissionListLabel"));
            const scheduleTasksLabel = computed(() => i18n.t("scheduleTasksLabel"));
            const classificationPageLabel = computed(() => i18n.t("classificationsLabel"));
            const reportingLabel = computed(() => i18n.t("reportingLabel"));
            const mServiceLabel = computed(() => i18n.t("mServiceLabel"));
            const brandingLabel = computed(() => i18n.t("brandingLabel"));
            const apiKeyManagementLabel = computed(() => i18n.t("apiKeyManagementLabel"));
            const institutionProfileLabel = computed(() => i18n.t("institutionProfileLabel"));
            const thesisLibraryLabel = computed(() => i18n.t("thesisLibraryLabel"));
            const promotionListLabel = computed(() => i18n.t("promotionListLabel"));
            const registryBookLabel = computed(() => i18n.t("registryBookLabel"));
            const healthCheckLabel = computed(() => i18n.t("routeLabel.healthCheck"));
            const backupLabel = computed(() => i18n.t("backupLabel"));
            const publicReviewDissertationsLabel = computed(() => i18n.t("publicReviewDissertationsLabel"));
            const thesesLabel = computed(() => i18n.t("thesesLabel"));
            const publicationsValidationLabel = computed(() => i18n.t("routeLabel.publicationsValidation"));

            const loginTitle = computed(() => i18n.t("loginLabel"));
            const registerLabel = computed(() => i18n.t("registerLabel"));

            const appTitle = ref();
            const sidebar = ref(false);
            const { isAdmin, isResearcher, isCommission, isViceDeanForScience, isHeadOfLibrary, isUserBoundToOU, userRole, isInstitutionalEditor, isInstitutionalLibrarian, isPromotionRegistryAdministrator } = useUserRole();

            const brandingStore = useBrandingStore();
            const loginStore = useLoginStore();
            const userName = ref("");
            const router = useRouter();

            const populateUserData = () => {
                UserService.getLoggedInUser().then((response) => {
                    userName.value = response.data.firstname + " " + response.data.lastName;

                    if (isCommission.value) {
                        commissionId.value = response.data.commissionId;
                    }

                    if (isUserBoundToOU.value) {
                        institutionId.value = response.data.organisationUnitId;
                    }
                });
                PersonService.getPersonId().then(response => {
                    if (response.data) {
                        personId.value = response.data;
                    }
                });
            };

            const logout = () => {
                AuthenticationService.logoutUser();
                loginStore.explicitlyLogout();
                router.push({ name: "login" });
            };

            watch(() => brandingStore.rebranded, () => {
                if (brandingStore.rebranded) {
                    appTitle.value = brandingStore.newTitle;
                    brandingStore.rebrandingHandled();
                }
            });

            watch(() => loginStore.userLoggedIn, () => {
                if (loginStore.userLoggedIn) {
                    populateUserData();
                }
            });

            watch(() => loginStore.reloadUserName, () => {
                if (loginStore.reloadUserName) {
                    populateUserData();
                    loginStore.emitUsernameReloaded();
                }
            });

            onMounted(() => {
                BrandingService.fetchBrandingInfo().then((response) => {
                    appTitle.value = response.data.title;
                });

                if (AuthenticationService.userLoggedIn()) {
                    populateUserData();
                }
            });

            const resourcesMenu = ref<MenuItem[]>([
                { title: personListLabel, type:'icon-link', pathName: 'persons' },
                { title: ouListLabel, type:'icon-link', pathName: 'organisation-units' },
                { title: scientificResultsListLabel, type:'icon-link', pathName: 'scientific-results' },
                { title: publicationsValidationLabel, type:'icon-link', pathName: 'scientific-results/validation', condition: computed(() => isInstitutionalEditor.value || isAdmin.value) }
            ]);

            const manageMenu = ref<MenuItem[]>([
                { title: userPageLabel, type: 'icon-link', pathName: 'users' },
                { title: eventListLabel, type: 'icon-link', pathName: 'events' },
                { title: journalListLabel, type: 'icon-link', pathName: 'journals' },
                { title: bookSeriesListLabel, type: 'icon-link', pathName: 'book-series' },
                { title: publisherListLabel, type: 'icon-link', pathName: 'publishers' },
                { title: countryListLabel, type: 'icon-link', pathName: "countries" },
                { title: researchAreaListLabel, type: 'icon-link', pathName: "research-areas" },
                { title: deduplicateLabel, type: 'icon-link', pathName: 'deduplication', condition: computed(() => loginStore.userLoggedIn && isAdmin.value) },
                { title: brandingLabel, type:'icon-link', pathName: "branding"},
                { title: apiKeyManagementLabel, type:'icon-link', pathName: "api-key-management"},
                { title: healthCheckLabel, type:'icon-link', pathName: "health-check"},
                { title: scheduleTasksLabel, type:'icon-link', pathName: 'scheduled-tasks', condition: computed(() => loginStore.userLoggedIn && isAdmin.value) },
                { title: backupLabel, type:'icon-link', pathName: 'document-backup', condition: computed(() => (isAdmin.value)) },
                { title: importerLabel, type: 'icon-link', pathName: 'importer', condition: computed(() => loginStore.userLoggedIn && (isAdmin.value || isInstitutionalEditor.value)) }
            ]);

            const assessmentsMenu = ref<MenuItem[]>([
                { title: indicatorPageLabel, type: 'icon-link', pathName: 'assessment/indicators' },
                { title: classificationPageLabel, type: 'icon-link', pathName: 'assessment/classifications' },
                { title: assessmentRulebookPageLabel, type: 'icon-link', pathName: 'assessment/assessment-rulebooks' },
                { title: commissionsLabel, type: 'icon-link', pathName: 'assessment/commissions' },
                { title: reportingLabel, type: 'icon-link', pathName: 'assessment/reporting', condition: computed(() => loginStore.userLoggedIn && (isAdmin.value)) }
            ]);

            const thesisLibraryMenu = ref<MenuItem[]>([
                { title: reportingLabel, type:'icon-link', pathName: 'thesis-library-reporting', condition: computed(() => (isAdmin.value || isHeadOfLibrary.value)) },
                { title: simpleSearchLabel, type:'icon-link', pathName: 'thesis-library-search' },
                { title: promotionListLabel, type:'icon-link', pathName: 'promotions', condition: computed(() => (isAdmin.value || isPromotionRegistryAdministrator.value)) },
                { title: registryBookLabel, type:'icon-link', pathName: 'registry-book', condition: computed(() => (isAdmin.value || isPromotionRegistryAdministrator.value)) },
                { title: publicReviewDissertationsLabel, type:'icon-link', pathName: 'thesis-library/public-dissertations' },
                { title: thesesLabel, type:'icon-link', pathName: 'scientific-results', condition: computed(() => (isInstitutionalLibrarian.value)) },
                { title: backupLabel, type:'icon-link', pathName: 'thesis-library-backup', condition: computed(() => (isAdmin.value || isHeadOfLibrary.value || isInstitutionalLibrarian.value)) }
            ]);

            const leftMenuItems = ref<MenuItem[]>([
                { title: homeLabel, type: 'icon-link', pathName: "" },
                { title: resourcesLabel, type: 'menu', subItems: resourcesMenu },
                { title: simpleSearchLabel, type: 'icon-link', pathName: 'advanced-search' },
                { title: researcherProfileLabel, type: 'dynamic', pathName: `persons`, dynamicValue: computed(() => personId.value), condition: computed(() => loginStore.userLoggedIn && isResearcher.value && personId.value > 0) },
                { title: commissionProfileLabel, type: 'dynamic', pathName: `assessment/commissions`, dynamicValue: computed(() => commissionId.value), condition: computed(() => loginStore.userLoggedIn && isCommission.value && commissionId.value > 0) },
                { title: institutionProfileLabel, type: 'dynamic', pathName: `organisation-units`, dynamicValue: computed(() => institutionId.value), condition: computed(() => loginStore.userLoggedIn && (isUserBoundToOU.value as boolean) && institutionId.value > 0) },
                { title: manageLabel, type: 'menu', subItems: manageMenu, condition: computed(() => loginStore.userLoggedIn && isAdmin.value) },
                { title: assessmentLabel, type: 'menu', subItems: assessmentsMenu, condition: computed(() => loginStore.userLoggedIn && isAdmin.value) },
                { title: backupLabel, type:'icon-link', pathName: 'document-backup', condition: computed(() => (isInstitutionalEditor.value)) },
                { title: thesisLibraryLabel, type: 'menu', subItems: thesisLibraryMenu },
                { title: eventListLabel, type:'icon-link', pathName: 'events', condition: computed(() => loginStore.userLoggedIn && isCommission.value) },
                { title: journalListLabel, type:'icon-link', pathName: 'journals', condition: computed(() => loginStore.userLoggedIn && isCommission.value) },
                { title: reportingLabel, type:'icon-link', pathName: 'assessment/reporting', condition: computed(() => loginStore.userLoggedIn && (isViceDeanForScience.value)) },
                { title: mServiceLabel, type:'icon-link', pathName: 'assessment/m-service', condition: true }
            ]);

            const menuItems = ref<MenuItem[]>([
                { title: undefined, type: 'lang_component', icon: 'mdi-translate', condition: true, component: langChangeItem },
                { type: 'divider' },
                { title: undefined, type: 'notification_component', icon: 'mdi-bell', condition: computed(() => loginStore.userLoggedIn), component: notificationItem },
                { title: registerLabel, type: 'icon-link', pathName: `register`, icon: 'mdi-login', condition: computed(() => !loginStore.userLoggedIn), variant: 'text' },
                { title: loginTitle, type: 'icon-link', pathName: `login`, icon: 'mdi-lock-open', condition: computed(() => !loginStore.userLoggedIn), variant: 'outlined', color: 'primary' },
                { title: computed(() => userName.value + " (" + getTitleFromValueAutoLocale(userRole.value as string) + ")"), type: 'icon-link', pathName: 'user-profile', icon: 'mdi-account', condition: computed(() => loginStore.userLoggedIn), variant: 'flat', color: 'primary' },
                { title: undefined, type: 'icon', click: logout, icon: 'mdi-logout', condition: computed(() => loginStore.userLoggedIn) }
            ]);

            return {
                userName, userRole, logout, appTitle,
                sidebar, menuItems, leftMenuItems, loginStore,
                returnCurrentLocaleContent, drawer,
                isLargeScreen
            };
        }
    });
</script>

<style scoped>
#navbar {
    width: 100%;
    border-bottom: 1px #eee solid;

    .logo-link {
        text-decoration: none;
        color: inherit;
        font-weight: bold;
    }

    .nav-items {
        margin-inline: 5px;
    }
}

.app-title {
    cursor: pointer;
}

.toolbar-container {
    min-height: 64px;
}

.lowered {
    margin-top: 10px;
}
</style>
