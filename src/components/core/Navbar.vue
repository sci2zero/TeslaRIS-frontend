<template>
    <div id="navbar">
        <v-navigation-drawer v-model="sidebar" app>
            <v-list>
                <v-list-tile
                    v-for="item in menuItems"
                    :key="item.title"
                >
                    <localized-link :to="item.pathName">
                        <v-list-tile-action>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>{{ item.title }}</v-list-tile-content>
                    </localized-link>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>

        <v-toolbar app>
            <span class="hidden-sm-and-up">
                <v-toolbar-side-icon @click="sidebar = !sidebar">
                </v-toolbar-side-icon>
            </span>
            <div class="d-flex">
                <v-toolbar-title>
                    <router-link to="/" tag="span" class="logo-link" style="cursor: pointer">
                        {{ appTitle }}
                    </router-link>
                </v-toolbar-title>
                <!-- Menu -->
                <div v-for="item in leftMenuItems" :key="item.title" class="text-center">
                    <v-menu
                        open-on-hover
                    >
                        <template #activator="{ props }">
                            <v-btn
                                size="small"

                                v-bind="props"
                            >
                                {{ item.title }}
                            </v-btn>
                        </template>

                        <v-list>
                            <v-list-item
                                v-for="(subItem, index) in item.subItems"
                                :key="index"
                            >
                                <v-list-item-title>{{ subItem.title }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </div>
            <v-spacer></v-spacer>
            <v-toolbar-items class="hidden-xs-only">
                <localized-link
                    v-for="item in menuItems"
                    :key="item.title"
                    :to="item.pathName">
                    <v-btn
                        v-if="item.condition"
                        height="100%"
                        class="no-uppercase"
                        flat
                    >
                        <v-icon left dark>
                            {{ item.icon }}
                        </v-icon>
                        {{ item.title }}
                    </v-btn>
                </localized-link>
            </v-toolbar-items>
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
import LocalizedLink from "../localization/LocalizedLink.vue";
import UserService from "@/services/UserService";
import AuthenticationService from '@/services/AuthenticationService';
import { computed, defineComponent } from 'vue';
import { useLoginStore } from '@/stores/loginStore';
import { watchEffect } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";

export default defineComponent(
    {
        name: "NavbarHeader",
        components: { LangChangeItem, LocalizedLink },
        setup() {
            const i18n = useI18n();
            const loginTitle = computed(() => i18n.t("loginLabel"));
            const registerLabel = computed(() => i18n.t("registerLabel"));
            const logoutLabel = computed(() => i18n.t("logoutLabel"));
            const userLoggedIn = ref(false);


            const appTitle = ref('TeslaRIS');
            const sidebar = ref(false);

            const menu1Sub = ref([
                { title: loginTitle, pathName: 'login', icon: 'mdi-lock-open' }
            ])

            const leftMenuItems = ref([
                { title: "First", type: 'menu', subItems: menu1Sub },
            ])

            const menuItems = ref([
                { title: loginTitle, pathName: 'login', icon: 'mdi-lock-open', condition:!userLoggedIn.value },
                { title: registerLabel, pathName: 'register', icon: 'mdi-login', condition:!userLoggedIn.value },
                { title: registerLabel, pathName: 'home', icon: 'mdi-logout', condition:userLoggedIn.value },
                { title: registerLabel, pathName: 'register', icon: 'mdi-login', condition:userLoggedIn.value },
                { title: registerLabel, pathName: 'register', icon: 'mdi-login', condition:"" },
            ])


            const loginStore = useLoginStore();
            const userName = ref("");
            const userRole = ref("");
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

            watchEffect(() => {
                if (loginStore.userLoggedIn) {
                    userLoggedIn.value = true;
                    populateUserData();
                } else {
                    userLoggedIn.value = false;
                }
            });

            if(AuthenticationService.userLoggedIn()) {
                userLoggedIn.value = true;
                populateUserData();
            }

            return {userName, userRole, userLoggedIn, logout, appTitle, sidebar, menuItems, leftMenuItems};
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
        .nav-container {

            display: flex;
            height: 100%;
            justify-content: space-between;

            .left-column {
                display: flex;
                height: 100%;

                .logo {
                    align-self: center;
                    margin-right: 1em;
                }
            }

            .nav-items {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                height: 100%;

                li {
                    text-decoration: none;
                    list-style: none;   

                    .link-container {
                        height: 100%;
                        display: flex;
                        align-items: center;

                        a {
                            padding: 1em 1em;
                            text-decoration: none;
                        }
                    }

                }
            }
        }
    }
</style>