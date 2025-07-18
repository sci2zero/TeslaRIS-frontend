<template>
    <v-container>
        <div id="login-page">
            <div class="login-wrapper">
                <h2 class="login-title">
                    {{ forgotPasswordForm ? $t("passwordRecoveryInstructions") : $t("loginLabel") }}
                </h2>
                <v-form v-if="!forgotPasswordSubmissionSent" v-model="isFormValid" @submit.prevent>
                    <div v-if="!forgotPasswordForm">
                        <v-text-field v-model="email" :rules="emailFieldRules" name="email" :label="$t('emailLabel')"></v-text-field>
                        <v-text-field
                            v-model="password" :rules="passwordFieldRules" name="password" type="password"
                            :label="$t('passwordLabel')"></v-text-field>

                        <br />
                        <v-btn
                            class="login-submit" block type="submit" :disabled="!isFormValid"
                            @click="login">
                            {{ $t("loginLabel") }}
                        </v-btn>
                        <br />
                        <a href="#" class="forgot-password-link" @click="forgotPasswordForm = true;">{{ $t("forgotPasswordLabel") }}</a>
                    </div>
                    <div v-else>
                        <v-text-field v-model="email" :rules="emailFieldRules" name="email" :label="$t('emailLabel')"></v-text-field>
                        <br />
                        <v-btn
                            class="login-submit" block type="submit" :disabled="!isFormValid"
                            @click="forgotPassword">
                            {{ $t('resetPasswordLabel') }}
                        </v-btn>
                        <br />
                        <a href="#" class="forgot-password-link" @click="forgotPasswordForm = false;">{{ $t("knowPasswordLabel") }}</a>
                    </div>
                    <br />
                    <localized-link to="register">
                        {{ $t("registerFromLoginLabel") }}
                    </localized-link>
                </v-form>
                <div v-else>
                    <h4>{{ $t("passwordRecoveryEmailSentMessage", [email]) }}</h4>
                    <v-row>
                        <v-col cols="10">
                            <v-btn
                                class="login-submit" block type="submit" :disabled="!isFormValid || cooldown"
                                @click="forgotPassword">
                                {{ $t('resendLabel') }}
                            </v-btn>
                        </v-col>
                        <v-col cols="2" class="progress">
                            <v-progress-circular v-if="cooldown" :model-value="progress"></v-progress-circular>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </div>

        <toast v-model="snackbar" :message="$t('emailOrPasswordIncorrectError')" />
    </v-container>
</template>


<script lang="ts">
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import AuthenticationService from "@/services/AuthenticationService";
import {useLoginStore} from "@/stores/loginStore"
import { computed, onMounted } from "vue";
import { ref } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useRouteStore } from "@/stores/routeStore";
import { useValidationUtils } from "@/utils/ValidationUtils";
import Toast from "@/components/core/Toast.vue";
import UserService from "@/services/UserService";
import { useInterval } from "@/composables/useInterval";


export default defineComponent(
    {
        name: "LoginView",
        components: { LocalizedLink, Toast },
        setup() {
            const route = useRoute();
            const router = useRouter();

            const isFormValid = ref(false);
            const snackbar = ref(false);
            const timeout = 5000;
            const email = ref(route.query.email || '');
            const password = ref();
            const loginStore = useLoginStore();
            const i18n = useI18n();
            const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

            const forgotPasswordForm = ref(false);
            const forgotPasswordSubmissionSent = ref(false);

            const routeStore = useRouteStore();

            const totalTime = 11 * 60 * 1000; // 11 minutes
            const elapsedTime = ref(0);
            const progress = ref(0);
            const cooldown = ref(false);
            
            onMounted(() => {
                document.title = i18n.t("loginLabel");
            });

            const startCooldown = () => {
                
                elapsedTime.value = 0;
                progress.value = 0;
                
                cooldown.value = true;

                setTimeout(() => {
                    cooldown.value = false;
                }, totalTime);

                startInterval();
            };

            const interval = 1000; // 1 second
            const { startInterval } = useInterval(() => {
                    elapsedTime.value += interval;

                    if (elapsedTime.value >= totalTime) {
                        elapsedTime.value = totalTime;
                    }

                    progress.value = (elapsedTime.value / totalTime) * 100;
                }, interval);

            const { emailFieldRules } = useValidationUtils();

            const passwordFieldRules = [
                (value: string) => {
                    if (!value) return requiredFieldMessage.value;
                    return true;
                }
            ];

            const login = () => {
                AuthenticationService.login({email: email.value as string, password: password.value}).then((response) => {
                    localStorage.setItem("jwt", response.data.token);
                    localStorage.setItem("refreshToken", response.data.refreshToken);

                    loginStore.emitLoginSuccess();
                    const preferredUILanguage = UserService.provideUserPreferredUILanguage();

                    if (routeStore.nextRoute != null) {
                        const routeName = routeStore.fetchAndClearRoute();
                        const routeParams = routeStore.fetchAndClearParams();
                        
                        router.push({ name: routeName, params: {...routeParams, locale: preferredUILanguage } });
                        return;
                    }

                    const userRole = UserService.provideUserRole();
                    if (userRole === "INSTITUTIONAL_LIBRARIAN" || userRole === "HEAD_OF_LIBRARY") {
                        router.push({ name: "scientificResults", params: { locale: preferredUILanguage } });
                        return;
                    }

                    router.push({ name: "home", params: { locale: preferredUILanguage } });
                }).catch(() => {
                    snackbar.value = true;
                });
            };

            const forgotPassword = () => {
                AuthenticationService.submitForgottenPassword({userEmail: email.value as string}).then(() => {
                    forgotPasswordSubmissionSent.value = true;
                });
                startCooldown();
            };

            return {email, emailFieldRules, 
                    password, passwordFieldRules, 
                    snackbar, timeout, isFormValid, login,
                    forgotPasswordForm, forgotPassword,
                    forgotPasswordSubmissionSent, progress, cooldown
                };
        }
    }
);
</script>

<style>
    #login-page {
        width: 100%;

        .login-wrapper {
            width: 100%;
            max-width: 500px;
            float: right;
            padding: 2em;
            background: #f8f8f8;
            border-radius: 0 0 1em 1em;
            box-shadow: 0 0 35px #36363630;
        }

        .login-title {
            margin-bottom: 1em;
            font-weight: bold;
            font-size: 1.6em;
            color: #444444;
        }

        input{
            margin-bottom: 1em;
        }

        .login-submit {
            display: block;
            margin-top: 1em;
            padding: 1em 2em;
            background: #5f8ae6;
            width: 100%;
            border-radius: 0.3em;
            color: #fff;
            font-weight: 700;
        }

        .forgot-password-link {
            text-align: left;
            display: block;
        }
    }

    .progress {
        margin-top: 15px;
    }

</style>