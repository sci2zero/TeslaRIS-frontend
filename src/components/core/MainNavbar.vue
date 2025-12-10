<template>
    <div id="navbar" :class="navbarClasses">
        <div class="wide-container flex-wrap toolbar-container px-4">
            <div class="flex">
                <v-btn
                    v-if="!showBreadcrumbs || sidebarStore.isMobile"
                    :icon="sidebarStore.isVisible ? 'mdi-menu-open' : 'mdi-menu'"
                    variant="text"
                    :color="variant === 'general' ? '#000' : '#fff'"
                    class="mr-4 hover:bg-gray-100 transition-colors"
                    aria-label="Toggle menu"
                    @click="toggleSidebar"
                >
                </v-btn>
                <breadcrumbs v-else v-model="navigationDepth" />
            </div>

            <v-spacer></v-spacer>

            <div
                v-if="maintenanceModeOn || nextScheduledMaintenance"
                :class="[
                    'bg-amber-50 border border-amber-200 rounded-2xl p-3 shadow-sm',
                    (showBreadcrumbs && !sidebarStore.isMobile && navigationDepth > 2) ? 'max-w-[400px]' : ''
                ]">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                        <svg
                            class="w-5 h-5 text-amber-600 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                                clip-rule="evenodd"
                            />
                        </svg>
                    </div>
                    <div :class="['flex-1', (showBreadcrumbs && !sidebarStore.isMobile && navigationDepth > 2) ? 'min-w-0' : '']">
                        <p
                            :class="[
                                'text-amber-800 text-sm leading-6 font-medium',
                                (showBreadcrumbs && !sidebarStore.isMobile && navigationDepth > 2) ? 'truncate' : ''
                            ]">
                            {{ maintenanceModeOn ? $t("maintenanceModeMessage") : $t("scheduledMaintenanceMessage", [nextScheduledMaintenance?.startTime, nextScheduledMaintenance?.approximateEndMoment]) }}
                        </p>
                    </div>
                </div>
            </div>

            <v-spacer></v-spacer>

            <div class="flex items-center gap-1">
                <template v-for="(item, index) in menuItems">
                    <template v-if="item.type == 'divider'">
                        <v-divider
                            :key="index" inset class="ms-2" vertical
                            :color="variant === 'general' ? '#000' : 'white'"></v-divider>
                    </template>
                    <template v-else-if="item.type == 'lang_component'">
                        <component :is="item.component" :key="index" :variant="variant"></component>
                    </template>
                    <template v-else-if="item.type == 'notification_component' && item.condition">
                        <component :is="item.component" :key="index" :variant="variant"></component>
                    </template>
                    <template v-else-if="item.type == 'user_profile'">
                        <span :key="index">
                            <router-link
                                v-if="item.condition"
                                :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName : undefined"
                                :class="[
                                    'user-profile-link flex items-center px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer',
                                    variant === 'general' 
                                        ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' 
                                        : 'text-white hover:text-gray-200 hover:bg-white/10'
                                ]">
                                <div class="flex items-center space-x-3">
                                    <div class="flex-shrink-0">
                                        <v-avatar size="32" color="primary" class="text-white">
                                            <v-icon size="20">
                                                {{ item.icon }}
                                            </v-icon>
                                        </v-avatar>
                                    </div>
                                    <div class="hidden sm:flex flex-col min-w-0">
                                        <span class="text-sm font-medium truncate">
                                            {{ userName }}
                                        </span>
                                        <span class="text-xs opacity-75 truncate">
                                            {{ userRole ? getTitleFromValueAutoLocale(userRole as string) : 'User' }}
                                        </span>
                                    </div>
                                </div>
                            </router-link>
                        </span>
                    </template>
                    <template v-else-if="item.type == 'icon'">
                        <v-btn
                            v-if="item.condition == undefined || item.condition"
                            :key="index"
                            size="small"
                            :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName : undefined"
                            :variant="item.variant" :color="variant === 'general' ? '#222' : '#fff'" class="no-uppercase"
                            :icon="item.type == 'icon'"
                            exact
                            @click="item.click"
                        >
                            <v-tooltip v-if="item.icon && item.title" location="top">
                                <template #activator="{ props: iconProps }">
                                    <v-icon v-bind="iconProps" left :class="variant === 'general' ? 'text-dark' : 'dark'">
                                        {{ item.icon }}
                                    </v-icon>
                                </template>
                                <span>{{ item.title }}</span>
                            </v-tooltip>
                        </v-btn>
                    </template>
                            
                    <template v-else>
                        <router-link
                            v-if="item.condition" :key="index"
                            :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName : undefined"
                            variant="text"
                                
                            :class="[
                                'hover:text-gray-200 cursor-pointer px-3 py-2 transition-colors duration-200 flex items-center',
                                variant === 'general' 
                                    ? 'text-dark hover:text-gray-700' 
                                    : 'text-white hover:text-gray-200'
                            ]"
                            @click="item.click">
                            <v-badge :content="item.badge" :model-value="false">
                                <v-icon left :class="variant === 'general' ? 'text-dark' : 'text-white'">
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
import Breadcrumbs from './Breadcrumbs.vue';
import { useSidebarStore } from '@/stores/sidebarStore';
import ApplicationConfigurationService from '@/services/ApplicationConfigurationService';
import { type MaintenanceInformation } from '@/models/Common';
import { localiseDate, localiseTime } from '@/utils/DateUtil';

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

interface Props {
    variant?: 'general' | 'home';
    showBreadcrumbs?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'home',
    showBreadcrumbs: false
});

const appTitle = ref("");
const navigationDepth = ref(0);

const { userRole } = useUserRole();

const navbarClasses = computed(() => {
    return {
        'navbar-general': props.variant === 'general',
        'navbar-home': props.variant === 'home'
    };
});

const langChangeItem = shallowRef(LangChangeItem);
const notificationItem = shallowRef(NotificationItem);

const { isCommission, isUserBoundToOU } = useUserRole();

const i18n = useI18n();
const personId = ref(-1);
const commissionId = ref(-1);
const institutionId = ref(-1);

const loginTitle = computed(() => i18n.t("loginLabel"));
const registerTitle = computed(() => i18n.t("registerLabel"));
const logoutTitle = computed(() => i18n.t("logoutLabel"));

const brandingStore = useBrandingStore();
const loginStore = useLoginStore();
const sidebarStore = useSidebarStore();
const userName = ref("");
const router = useRouter();

const maintenanceModeOn = ref(false);
const nextScheduledMaintenance = ref<MaintenanceInformation | null>(null);

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

const toggleSidebar = () => {
    sidebarStore.toggle();
};

watch(() => brandingStore.rebranded, () => {
    if (brandingStore.rebranded) {
        appTitle.value = returnCurrentLocaleContent(brandingStore.newTitle) as string;
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
        appTitle.value = returnCurrentLocaleContent(response.data.title) as string;
    });

    if (AuthenticationService.userLoggedIn()) {
        populateUserData();
    }

    ApplicationConfigurationService.getIsApplicationInMaintenanceMode().then(response => {
        maintenanceModeOn.value = response.data;

        if (!maintenanceModeOn.value) {
            ApplicationConfigurationService.getNextScheduledMaintenance().then(maintenanceInfo => {
                nextScheduledMaintenance.value = maintenanceInfo.data;
                if (nextScheduledMaintenance.value) {
                    const startTimeParts = nextScheduledMaintenance.value.startTime.split("T");
                    nextScheduledMaintenance.value.startTime = `${localiseDate(startTimeParts[0])} ${localiseTime(startTimeParts[1])}`
                }
            });
        }
    });
});

const menuItems = ref<MenuItem[]>([
    { title: undefined, type: 'lang_component', icon: 'mdi-web', condition: true, component: langChangeItem },
    { type: 'divider' },
    { title: undefined, type: 'notification_component', icon: 'mdi-bell', condition: computed(() => loginStore.userLoggedIn), component: notificationItem },
    { title: registerTitle, type: 'icon-link', pathName: `register`, icon: 'mdi-clipboard-account-outline', condition: computed(() => !loginStore.userLoggedIn), variant: 'text' },
    { title: loginTitle, type: 'icon-link', pathName: `login`, icon: 'mdi-login', condition: computed(() => !loginStore.userLoggedIn), variant: 'outlined', color: 'primary' },
    { type: 'user_profile', pathName: 'user-profile', icon: 'mdi-account', condition: computed(() => loginStore.userLoggedIn) },
    { title: logoutTitle, type: 'icon', variant: 'text', click: logout, icon: 'mdi-logout', condition: computed(() => loginStore.userLoggedIn) }
]);
</script>

<style scoped>
@reference "@/assets/main.css";

.app-title {
    cursor: pointer;
}

.toolbar-container {
    min-height: 64px;
}

.lowered {
    margin-top: 10px;
}

.navbar-general {
    @apply bg-white text-black shadow-sm border-b border-gray-200;
}

.navbar-home {
    /* Keep current styling */
}


.user-profile-link:hover {
    transform: translateY(-1px);
}
</style>