<template>
    <div id="navbar">
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
                                <a href="#">Link</a>
                            </div>
                        </li>
                        <li>
                            <div v-if="userLoggedIn && userRole === 'ADMIN'" class="link-container">
                                <localized-link to="users">
                                    {{ $t("userPageLabel") }}
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
                        </div>
                    </li>
                    <p v-if="userLoggedIn">
                        {{ userName }} ({{ userRole }})
                    </p>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import LangChangeItem from './LangChangeItem.vue';
import LocalizedLink from "../localization/LocalizedLink.vue";
import UserService from "@/services/UserService";
import AuthenticationService from '@/services/AuthenticationService';
import { defineComponent } from 'vue';
import { useLoginStore } from '@/stores/loginStore';
import { watchEffect } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent(
    {
        name: "NavbarHeader",
        components: { LangChangeItem, LocalizedLink },
        setup() {
            const loginStore = useLoginStore();
            const userLoggedIn = ref(false);
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

            return {userName, userRole, userLoggedIn, logout};
        }
    });
</script>

<style scoped>

    #navbar {
        width: 100%;
        height: 80px;
        border-bottom: 1px #eee solid;

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