<template>
    <div id="navbar">
        <!-- <v-navigation-drawer v-model="sidebar" app>
            <v-list>
                <v-list-tile v-for="item in menuItems" :key="item.title">
                    <localized-link :to="item.pathName">
                        <v-list-tile-action>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>{{ item.title }}</v-list-tile-content>
                    </localized-link>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer> -->

        <v-toolbar app height="auto">
            <div class="wide-container flex-wrap" style="min-height: 64px;">
                <span class="hidden-sm-and-up">
                    <v-toolbar-side-icon @click="sidebar = !sidebar">
                    </v-toolbar-side-icon>
                </span>
                <div class="d-flex">
                    <v-toolbar-title>
                        <router-link to="/" class="logo-link" style="cursor: pointer">
                            {{ appTitle }}
                        </router-link>
                    </v-toolbar-title>

                    <!-- Menu -->
                    <div class="d-flex ps-5 flex-wrap">
                        <div v-for="item in leftMenuItems" :key="item.title" class="text-center">
                            <template v-if="item.type == 'menu'">
                                <v-menu v-if="item.condition == undefined || item.condition" open-on-hover open-delay="0">
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
                                            v-for="(subItem, index) in item.subItems"
                                            :key="index" class="ps-5 pe-5" :value="item.title"
                                            :to="subItem.pathName !== undefined ? '/' + $i18n.locale + '/' + subItem.pathName : undefined"
                                            link
                                        >
                                            <v-list-item-title>
                                                {{ subItem.title }}
                                            </v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </template>
                            <template v-else>
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
                        </div>
                    </div>
                </div>

                <v-spacer></v-spacer>
                <!-- <LangChangeItem /> -->

                <template v-for="(item, index) in menuItems">
                    <template v-if="item.type == 'divider'">
                        <v-divider
                            :key="index"
                            inset
                            class="ms-2 me-2"
                            vertical></v-divider>
                    </template>
                    <template v-else-if="item.type == 'component'">
                        <component :is="item.component" :key="index"></component>
                    </template>
                    <template v-else>
                        <v-btn
                            v-if="item.condition"
                            :key="item.title"
                            :to="item.pathName !== undefined ? '/' + $i18n.locale + '/' + item.pathName : undefined" :variant="item.variant" :color="item.color" class="no-uppercase nav-items"
                            :icon="item.type == 'icon'"
                            @click="item.click"
                        >
                            <v-badge :content="item.badge" :model-value="item.badge > 0">
                                <v-icon left dark>
                                    {{ item.icon }}
                                </v-icon>
                            </v-badge>
                            <template v-if="item.type != 'icon'">
                                {{ item.title }}
                            </template>
                        </v-btn>
                    </template>
                </template>
                <!-- </v-toolbar-items> -->
            </div>
        </v-toolbar>
    </div>
    <!-- <div id="navbar">
        <div class="nav-container">
            <div class="left-column">
                <div class="logo">
                    Logo
                </div>
                <div class="navitems">
                    <ul class="nav-items">
                        <li>
                            <div class="link-container">
                                <localized-link to="">
                                    {{ $t("homeLabel") }}
                                </localized-link>
                            </div>
                        </li>
                        <li>
                            <div class="link-container">
                                <localized-link to="persons">
                                    {{ $t("personListLabel") }}
                                </localized-link>
                            </div>
                        </li>
                        <li>
                            <div class="link-container">
                                <localized-link to="organisation-units">
                                    {{ $t("ouListLabel") }}
                                </localized-link>
                            </div>
                        </li>
                        <li>
                            <div class="link-container">
                                <localized-link to="scientific-results">
                                    {{ $t("scientificResultsListLabel") }}
                                </localized-link>
                            </div>
                        </li>
                        <li>
                            <div class="link-container">
                                <localized-link to="advanced-search">
                                    {{ $t("advancedSearchLabel") }}
                                </localized-link>
                            </div>
                        </li>
                        <li>
                            <div v-if="userLoggedIn && userRole === 'ADMIN'" class="link-container">
                                <localized-link to="users">
                                    {{ $t("userPageLabel") }}
                                </localized-link>
                                <localized-link to="events">
                                    {{ $t("eventListLabel") }}
                                </localized-link>
                                <localized-link to="journals">
                                    {{ $t("journalListLabel") }}
                                </localized-link>
                                <localized-link to="book-series">
                                    {{ $t("bookSeriesListLabel") }}
                                </localized-link>
                                <localized-link to="publishers">
                                    {{ $t("publisherListLabel") }}
                                </localized-link>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="right-column">
                <ul class="nav-items">
                    <li>
                        <div class="link-container">
                            <LangChangeItem />
                        </div>
                    </li>
                    <li>
                        <div v-if="!userLoggedIn" class="link-container">
                            <localized-link to="login">
                                {{ $t("loginLabel") }}
                            </localized-link>
                        </div>
                    </li>
                    <li>
                        <div v-if="!userLoggedIn" class="link-container">
                            <localized-link to="register">
                                {{ $t("registerLabel") }}
                            </localized-link>
                        </div>
                    </li>
                    <li>
                        <div v-if="userLoggedIn" class="link-container">
                            <a href="#" @click="logout">{{ $t("logoutLabel") }}</a>
                            <localized-link to="user-profile">
                                {{ $t("userProfileLabel") }}
                            </localized-link>
                        </div>
                    </li>
                    <p v-if="userLoggedIn">
                        {{ userName }} ({{ userRole }})
                    </p>
                </ul>
            </div>
        </div>
    </div> -->
</template>

<script lang="ts">
import LangChangeItem from './LangChangeItem.vue';
import UserService from "@/services/UserService";
import AuthenticationService from '@/services/AuthenticationService';
import { computed, defineComponent, reactive } from 'vue';
import { useLoginStore } from '@/stores/loginStore';
import { watchEffect } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
import type { ComputedRef, Ref } from 'vue';
import type { Component } from 'vue';
import { shallowRef } from 'vue';

interface MenuItem {
  title?: ComputedRef<string> | string | undefined;
  pathName?: string;
  click?: () => void,
  icon?: string;
  type: string;
  condition?: Ref<boolean> | boolean;
  badge?: Ref<number> | number;
  variant?: 'text' | 'outlined' | 'flat' | 'elevated' | 'tonal' | 'plain';
  color?: string;
  subItems?: MenuItem[] | Ref<MenuItem[]>
  component?: Component
}

export default defineComponent(
    {
        name: "NavbarHeader",
        components: { LangChangeItem },
        setup() {

            const langChangeItem = shallowRef(LangChangeItem)

            const i18n = useI18n();

            const homeLabel = computed(() => i18n.t("homeLabel"));
            
            const resourcesLabel = computed(() => i18n.t("resources"));
            const manageLabel = computed(() => i18n.t("manage"));

            const personListLabel = computed(() => i18n.t("personListLabel"));
            const ouListLabel = computed(() => i18n.t("ouListLabel"));
            const scientificResultsListLabel = computed(() => i18n.t("scientificResultsListLabel"));
            const advancedSearchLabel = computed(() => i18n.t("advancedSearchLabel"));
            const userPageLabel = computed(() => i18n.t("userPageLabel"));
            const eventListLabel = computed(() => i18n.t("eventListLabel"));
            const journalListLabel = computed(() => i18n.t("journalListLabel"));
            const bookSeriesListLabel = computed(() => i18n.t("bookSeriesListLabel"));
            const publisherListLabelIzdavači = computed(() => i18n.t("publisherListLabel"));

            const loginTitle = computed(() => i18n.t("loginLabel"));
            const registerLabel = computed(() => i18n.t("registerLabel"));
            const logoutLabel = computed(() => i18n.t("logoutLabel"));
            const userLoggedIn = ref(false);


            const appTitle = ref('TeslaRIS');
            const sidebar = ref(false);
            const userRole = ref("");


            const a = ref(true)
            const testData = reactive({
                test: !a.value,
                get test2() {
                    return !a.value
                },
                test3: a,

            })
            a.value = false

            
            const loginStore = useLoginStore();
            const userName = ref("");
            const router = useRouter();

            const populateUserData = () => {
                UserService.getLoggedInUser().then((response) => {
                    userName.value = response.data.firstname + " " + response.data.lastName;
                    userRole.value = UserService.provideUserRole();
                });
            };

            const logout = () => {
                AuthenticationService.logoutUser();
                userLoggedIn.value = false;
                loginStore.userLoggedOut();
                router.push({ name: "login" });
            };

            const test = () => {
                alert("alert")
            }

            watchEffect(() => {
                if (loginStore.userLoggedIn) {
                    userLoggedIn.value = true;
                    populateUserData();
                } else {
                    userLoggedIn.value = false;
                }
            });

            if (AuthenticationService.userLoggedIn()) {
                userLoggedIn.value = true;
                populateUserData();
            }


            const personsAndOU = ref<MenuItem[]>([
                { title: personListLabel, type:'icon-link', pathName: 'persons' },
                { title: ouListLabel, type:'icon-link', pathName: 'organisation-units' },
                { title: scientificResultsListLabel, type:'icon-link', pathName: 'scientific-results' }
            ])

            const manageMenu = ref<MenuItem[]>([
                { title: userPageLabel, type:'icon-link', pathName: 'users' },
                { title: eventListLabel, type:'icon-link', pathName: 'events' },
                { title: journalListLabel, type:'icon-link', pathName: 'journals' },
                { title: bookSeriesListLabel, type:'icon-link', pathName: 'book-series' },
                { title: publisherListLabelIzdavači, type:'icon-link', pathName: 'publishers' }
            ])

            const leftMenuItems = ref<MenuItem[]>([
                { title: homeLabel, type: 'icon-link', pathName:"" },
                { title: resourcesLabel, type: 'menu', subItems: personsAndOU },
                { title: advancedSearchLabel, type: 'icon-link', pathName: 'advanced-search' },
                { title: manageLabel, type: 'menu', subItems: manageMenu, condition: computed(() => userLoggedIn.value && userRole.value === 'ADMIN') },

            ])

            const menuItems = ref<MenuItem[]>([
                { title: undefined, type:'component', icon: 'mdi-translate', condition: true, component: langChangeItem },
                // { title: undefined, type:'icon', icon: 'mdi-translate', condition: true },

                { type:'divider' },
                { title: undefined, type:'icon', icon: 'mdi-bell', condition: userLoggedIn, badge: 2 },
                { title: registerLabel, type:'icon-link', pathName: `register`, icon: 'mdi-login', condition: computed(() => !userLoggedIn.value), variant: 'text' },
                { title: loginTitle, type:'icon-link', pathName: `login`, icon: 'mdi-lock-open', condition: computed(() => !userLoggedIn.value), variant: 'outlined', color:'primary' },
                { title: computed(() => userName.value + " (" + userRole.value + ")"), type:'icon-link', pathName:'user-profile', icon: 'mdi-account', condition: userLoggedIn, variant: 'flat', color:'primary' },
                // { title: "logoutLabel", type:'icon-link', click:logout, icon: 'mdi-logout', condition: userLoggedIn },
                { title: "", type:'icon', click:logout, icon: 'mdi-logout', condition: userLoggedIn },
            ])


            return { userName, userRole, userLoggedIn, logout, appTitle, sidebar, menuItems, leftMenuItems, testData, a };
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
</style>