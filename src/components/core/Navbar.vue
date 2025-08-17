<template>
    <div id="navbar">
            <div class="wide-container flex-wrap toolbar-container px-4">
                <div class="flex">
                    <v-btn
                        icon="mdi-menu"
                        variant="text"
                        color="#fff"
                        class="mr-4"
                        aria-label="Toggle menu"
                    >
                    </v-btn>
                </div>

                <v-spacer></v-spacer>

                <div class="flex items-center">
                    <template v-for="(item, index) in menuItems">
                        <template v-if="item.type == 'divider'">
                            <v-divider :key="index" inset class="ms-2 me-2" vertical color="white"></v-divider>
                        </template>
                        <template v-else-if="item.type == 'lang_component'">
                            <component :is="item.component" :key="index"></component>
                        </template>
                        <template v-else-if="item.type == 'notification_component' && item.condition">
                            <component :is="item.component" :key="index"></component>
                        </template>
                        <template v-else-if="item.type == 'icon'">
                            <v-btn
                                v-if="item.condition == undefined || item.condition"
                                :key="item.title"
                                size="small"
                                :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName : undefined"
                                :variant="item.variant" :color="item.color" class="no-uppercase"
                                :icon="item.type == 'icon'"
                                exact
                            >
                                <v-icon v-if="item.icon" left dark>
                                    {{ item.icon }}
                                </v-icon>
                                <template v-if="item.type != 'icon'">
                                    {{ item.title }}
                                </template>
                            </v-btn>
                        </template>
                            
                        <template v-else>
                            <router-link v-if="item.condition" :key="item.title"
                                :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName : undefined"
                                variant="text"
                                
                                :class="'text-white hover:text-gray-200 cursor-pointer px-3 py-2 transition-colors duration-200 flex items-center'"
                                @click="item.click">
                                <v-badge :content="item.badge" :model-value="false">
                                    <v-icon left class="text-white">
                                        {{ item.icon }}
                                    </v-icon>
                                </v-badge>
                                <span v-if="item.type != 'icon'" class="d-none d-md-flex ml-2">
                                    {{ item.title }}
                                </span>
                            </router-link>
                        </template>
                    </template>
                </div>
            </div>
    </div>
</template>

<script setup lang="ts">
import LangChangeItem from './LangChangeItem.vue';
import UserService from "@/services/UserService";
import AuthenticationService from '@/services/AuthenticationService';
import { computed, onMounted, watch } from 'vue';
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


const langChangeItem = shallowRef(LangChangeItem);
const notificationItem = shallowRef(NotificationItem);

const i18n = useI18n();
const personId = ref(-1);
const commissionId = ref(-1);
const institutionId = ref(-1);



const loginTitle = computed(() => i18n.t("loginLabel"));

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

const menuItems = ref<MenuItem[]>([
    { title: undefined, type: 'lang_component', icon: 'mdi-web', condition: true, component: langChangeItem },
    { type: 'divider' },
    { title: undefined, type: 'notification_component', icon: 'mdi-bell', condition: computed(() => loginStore.userLoggedIn), component: notificationItem },
    // { title: registerLabel, type: 'icon-link', pathName: `register`, icon: 'mdi-login', condition: computed(() => !loginStore.userLoggedIn), variant: 'text' },
    { title: loginTitle, type: 'icon-link', pathName: `login`, icon: 'mdi-login', condition: computed(() => !loginStore.userLoggedIn), variant: 'outlined', color: 'primary' },
    { title: computed(() => userName.value + " (" + getTitleFromValueAutoLocale(userRole.value as string) + ")"), type: 'icon-link', pathName: 'user-profile', icon: 'mdi-account', condition: computed(() => loginStore.userLoggedIn), variant: 'flat', color: 'primary' },
    { title: undefined, type: 'icon', click: logout, icon: 'mdi-logout' }
]);
</script>

<style scoped>
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