<template>
    <div id="login-page">
        <div class="login-shapes" aria-hidden="true">
            <span class="shape shape-blob-top" />
            <span class="shape shape-blob-left" />
            <span class="shape shape-blob-right" />
            <span class="shape shape-ring" />
            <span class="shape shape-dots">
                <span
                    v-for="index in 64"
                    :key="index"
                    class="dot"
                    :style="{ animationDelay: dotDelay(index) }"
                />
            </span>
        </div>

        <v-container class="login-container">
            <div class="login-grid">
                <section class="login-intro">
                    <div class="intro-brand">
                        <span v-if="!hasCustomLogo" class="intro-logo" aria-hidden="true" />
                        <img
                            v-else :src="logoUrl" alt=""
                            class="intro-logo-img">
                        <h1 class="intro-title serif">
                            {{ returnCurrentLocaleContent(title) }}
                        </h1>
                    </div>
                    <p class="intro-description">
                        {{ returnCurrentLocaleContent(description) }}
                    </p>

                    <div class="intro-highlights">
                        <div
                            v-for="highlight in highlights" :key="highlight.path" class="intro-highlight"
                            role="link" tabindex="0" @click="goTo(highlight.path)"
                            @keyup.enter="goTo(highlight.path)">
                            <v-icon :icon="highlight.icon" size="24" class="intro-highlight-icon" />
                            <span class="intro-highlight-label">{{ highlight.label }}</span>
                            <span class="intro-highlight-description">{{ highlight.description }}</span>
                        </div>
                    </div>
                </section>

                <section class="login-wrapper">
                    <h2 class="login-title">
                        {{ forgotPasswordForm ? $t("passwordRecoveryInstructions") : $t("loginLabel") }}
                    </h2>
                    <p v-if="!forgotPasswordForm && !forgotPasswordSubmissionSent" class="login-subtitle">
                        {{ $t("loginSubtitleMessage") }}
                    </p>

                    <v-form v-if="!forgotPasswordSubmissionSent" v-model="isFormValid" @submit.prevent>
                        <div v-if="!forgotPasswordForm">
                            <ui-input
                                v-model="email" :rules="emailFieldRules" name="email" :label="$t('emailLabel')"
                                :placeholder="$t('emailLabel')" class="login-field" />
                            <ui-input
                                v-model="password" :rules="passwordFieldRules" name="password"
                                :type="showPassword ? 'text' : 'password'" :label="$t('passwordLabel')"
                                :placeholder="$t('passwordLabel')" class="login-field">
                                <template #append-inner>
                                    <v-icon
                                        :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                                        @click="showPassword = !showPassword" />
                                </template>
                            </ui-input>

                            <v-btn
                                class="login-submit" block type="submit" size="large"
                                rounded="lg" color="#3b6fe0"
                                :disabled="!isFormValid" @click="login">
                                {{ $t("loginLabel") }}
                            </v-btn>

                            <div class="login-divider">
                                <span>{{ $t("orLabel") }}</span>
                            </div>

                            <o-auth2-buttons-section />

                            <a href="#" class="forgot-password-link" @click.prevent="forgotPasswordForm = true">{{ $t("forgotPasswordLabel") }}</a>
                        </div>
                        <div v-else>
                            <ui-input
                                v-model="email" :rules="emailFieldRules" name="email" :label="$t('emailLabel')"
                                :placeholder="$t('emailLabel')" class="login-field" />
                            <v-btn
                                class="login-submit" block type="submit" size="large"
                                rounded="lg" color="#3b6fe0"
                                :disabled="!isFormValid" @click="forgotPassword">
                                {{ $t('resetPasswordLabel') }}
                            </v-btn>
                            <a href="#" class="forgot-password-link" @click.prevent="forgotPasswordForm = false">{{ $t("knowPasswordLabel") }}</a>
                        </div>

                        <p v-if="isRegistrationEnabled" class="register-prompt">
                            {{ $t("noAccountLabel") }}
                            <localized-link to="register" class="register-link">
                                {{ $t("registerActionLabel") }}
                            </localized-link>
                        </p>
                        <p v-else class="register-prompt">
                            <localized-link to="contact" class="register-link">
                                {{ $t("contactUsFromLoginLabel") }}
                            </localized-link>
                        </p>
                    </v-form>
                    <div v-else>
                        <h4 class="recovery-sent-message">
                            {{ $t("passwordRecoveryEmailSentMessage", [email]) }}
                        </h4>
                        <v-row>
                            <v-col cols="10">
                                <v-btn
                                    class="login-submit" block type="submit" size="large"
                                    rounded="lg" color="#3b6fe0"
                                    :disabled="!isFormValid || cooldown" @click="forgotPassword">
                                    {{ $t('resendLabel') }}
                                </v-btn>
                            </v-col>
                            <v-col cols="2" class="progress">
                                <v-progress-circular v-if="cooldown" :model-value="progress" />
                            </v-col>
                        </v-row>
                    </div>
                </section>
            </div>
        </v-container>

        <toast v-model="snackbar" :message="message" />
    </div>
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
import { useCrisContextInformation } from "@/composables/useCrisContextInformation";
import OAuth2ButtonsSection from "@/components/user/oauth2/OAuth2ButtonsSection.vue";
import UiInput from "@/components/ui/input/Input.vue";
import { usePublicConfigurationStore } from "@/stores/publicConfigurationStore";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";


export default defineComponent(
    {
        name: "LoginView",
        components: { LocalizedLink, Toast, OAuth2ButtonsSection, UiInput },
        setup() {
            const { isRegistrationEnabled } = useCrisContextInformation();

            const route = useRoute();
            const router = useRouter();

            const isFormValid = ref(false);
            
            const snackbar = ref(false);
            const message = ref<string>("");

            const email = ref(route.query.email || '');
            const password = ref();
            const showPassword = ref(false);
            const loginStore = useLoginStore();
            const i18n = useI18n();
            const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

            const forgotPasswordForm = ref(false);
            const forgotPasswordSubmissionSent = ref(false);

            const routeStore = useRouteStore();

            const publicConfigurationStore = usePublicConfigurationStore();
            const title = computed(() => publicConfigurationStore.title);
            const description = computed(() => publicConfigurationStore.description);
            const hasCustomLogo = computed(() => publicConfigurationStore.hasCustomLogo);
            const logoUrl = computed(() => publicConfigurationStore.logoDisplayUrl);

            const highlights = computed(() => [
                { icon: "mdi-account-group", label: i18n.t("personListLabel"), description: i18n.t("searchResearchersMessage"), path: "persons" },
                { icon: "mdi-domain", label: i18n.t("ouListLabel"), description: i18n.t("browseOrganisationUnitsMessage"), path: "organisation-units" },
                { icon: "mdi-file-document-multiple", label: i18n.t("scientificResultsListLabel"), description: i18n.t("findPublicationsMessage"), path: "scientific-results" },
                { icon: "mdi-briefcase-variant", label: i18n.t("projectsLabel"), description: i18n.t("exploreProjectsMessage"), path: "project" }
            ]);

            const goTo = (path: string) => {
                router.push(`/${i18n.locale.value}/${path}`);
            };

            const dotDelay = (index: number) => {
                const column = (index - 1) % 8;
                const row = Math.floor((index - 1) / 8);
                return `${(column + row) * 0.4}s`;
            };

            const totalTime = 11 * 60 * 1000; // 11 minutes
            const elapsedTime = ref(0);
            const progress = ref(0);
            const cooldown = ref(false);
            
            onMounted(() => {
                document.title = i18n.t("loginLabel");

                const error = route.query.error as string;
                if (error) {
                    message.value = i18n.t(error);
                    snackbar.value = true;
                }
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
                    message.value = i18n.t('emailOrPasswordIncorrectError');
                    snackbar.value = true;
                });
            };

            const forgotPassword = () => {
                AuthenticationService.submitForgottenPassword({userEmail: email.value as string}).then(() => {
                    forgotPasswordSubmissionSent.value = true;
                });
                startCooldown();
            };

            return {
                isRegistrationEnabled,
                email, emailFieldRules, 
                password, passwordFieldRules, showPassword,
                snackbar, message, isFormValid, login,
                forgotPasswordForm, forgotPassword,
                forgotPasswordSubmissionSent, progress, cooldown,
                title, description, hasCustomLogo, logoUrl, highlights, goTo,
                dotDelay, returnCurrentLocaleContent
            };
        }
    }
);
</script>

<style scoped>

    #login-page {
        position: relative;
        width: 100%;
        overflow: hidden;
        background: linear-gradient(135deg, #fbfcff 0%, #f3f6fd 50%, #eef3fc 100%);
    }

    /* Abstract background shapes */
    .login-shapes {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
    }

    .shape {
        position: absolute;
        display: block;
    }

    .shape-blob-top {
        top: -18rem;
        left: -10rem;
        width: 46rem;
        height: 36rem;
        border-radius: 46% 54% 38% 62% / 55% 42% 58% 45%;
        background: linear-gradient(140deg, rgba(219, 234, 254, 0.75), rgba(241, 245, 255, 0.35));
        animation: blob-top 22s ease-in-out infinite;
    }

    .shape-blob-left {
        bottom: -16rem;
        left: -14rem;
        width: 40rem;
        height: 34rem;
        border-radius: 58% 42% 63% 37% / 42% 58% 42% 58%;
        background: linear-gradient(200deg, rgba(226, 236, 253, 0.85), rgba(248, 250, 255, 0.25));
        animation: blob-left 26s ease-in-out infinite;
    }

    .shape-blob-right {
        top: -8rem;
        right: -16rem;
        width: 42rem;
        height: 42rem;
        border-radius: 52% 48% 40% 60% / 48% 56% 44% 52%;
        background: linear-gradient(230deg, rgba(232, 240, 254, 0.8), rgba(255, 255, 255, 0));
        animation: blob-right 30s ease-in-out infinite;
    }

    .shape-ring {
        bottom: 12%;
        right: 22%;
        width: 14rem;
        height: 14rem;
        border-radius: 50%;
        border: 1px solid rgba(148, 163, 184, 0.18);
        animation: ring-pulse 8s ease-in-out infinite;
    }

    .shape-dots {
        top: 26%;
        left: 46%;
        display: grid;
        grid-template-columns: repeat(8, 18px);
        grid-auto-rows: 18px;
    }

    .dot {
        width: 3px;
        height: 3px;
        margin: auto;
        border-radius: 50%;
        background: rgba(130, 149, 180, 0.55);
        animation: dots-blink 8s ease-in-out infinite;
    }

    @keyframes blob-top {
        0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            border-radius: 46% 54% 38% 62% / 55% 42% 58% 45%;
        }
        50% {
            transform: translate3d(1.5rem, 1.25rem, 0) rotate(4deg);
            border-radius: 58% 42% 55% 45% / 42% 58% 40% 60%;
        }
    }

    @keyframes blob-left {
        0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            border-radius: 58% 42% 63% 37% / 42% 58% 42% 58%;
        }
        50% {
            transform: translate3d(1rem, -1.5rem, 0) rotate(-3deg);
            border-radius: 42% 58% 40% 60% / 55% 40% 60% 45%;
        }
    }

    @keyframes blob-right {
        0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            border-radius: 52% 48% 40% 60% / 48% 56% 44% 52%;
        }
        50% {
            transform: translate3d(-1.75rem, 1rem, 0) rotate(3deg);
            border-radius: 40% 60% 55% 45% / 58% 42% 52% 48%;
        }
    }

    @keyframes ring-pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 0.55;
        }
        50% {
            transform: scale(1.1);
            opacity: 1;
        }
    }

    @keyframes dots-blink {
        0%, 100% {
            opacity: 0.45;
        }
        8% {
            opacity: 0.9;
        }
        20% {
            opacity: 0.45;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .shape-blob-top,
        .shape-blob-left,
        .shape-blob-right,
        .shape-ring,
        .dot {
            animation: none;
        }
    }

    .login-container {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: flex-start;
        min-height: 32rem;
        padding-top: 4rem;
        padding-bottom: 4rem;
    }

    .login-grid {
        width: 100%;
    }

    .login-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 3rem;
        align-items: start;
    }

    @media (min-width: 960px) {
        .login-grid {
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
            gap: 4rem;
        }

        .login-wrapper {
            margin-right: 0;
        }
    }

    /* Phone: logo and title only, then the login card */
    @media (max-width: 959px) {
        .shape-dots,
        .shape-ring {
            display: none;
        }

        .login-container {
            min-height: 0;
            align-items: flex-start;
            padding-top: 1.25rem;
            padding-bottom: 1.5rem;
        }

        .login-grid {
            gap: 0;
        }

        .login-wrapper {
            padding: 1.5rem 1.25rem;
        }
    }

    /* Intro section */
    .intro-brand {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.25rem;
    }

    .intro-logo {
        width: clamp(3.5rem, 7vw, 5rem);
        height: clamp(3.5rem, 7vw, 5rem);
        flex-shrink: 0;
        background-color: #16244a;
        mask: url('/logov1.svg') center / contain no-repeat;
        -webkit-mask: url('/logov1.svg') center / contain no-repeat;
    }

    .intro-logo-img {
        width: clamp(3.5rem, 7vw, 5rem);
        height: clamp(3.5rem, 7vw, 5rem);
        flex-shrink: 0;
        object-fit: contain;
    }

    .intro-title {
        margin-bottom: 0;
        font-size: clamp(2.25rem, 5vw, 3.75rem);
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.02em;
        color: #16244a;
    }

    .intro-description {
        max-width: 34rem;
        margin-bottom: 2.5rem;
        font-size: 1.0625rem;
        line-height: 1.7;
        color: #556080;
    }

    .intro-highlights {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1.75rem 1.5rem;
        max-width: 34rem;
    }

    @media (min-width: 600px) {
        .intro-highlights {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
    }

    .intro-highlight {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        cursor: pointer;
        transform: none;
        transition: none;
    }

    .intro-highlight:hover,
    .intro-highlight:focus-visible,
    .intro-highlight:active {
        transform: none;
    }

    .intro-highlight-icon {
        color: #3b6fe0;
    }

    .intro-highlight-label {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #1f2d52;
    }

    .intro-highlight-description {
        font-size: 0.8125rem;
        line-height: 1.4;
        color: #8a94ad;
    }

    /* Login card */
    .login-wrapper {
        width: 100%;
        max-width: 28rem;
        margin-inline: auto;
        padding: 2.5rem 2rem;
        background: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.14);
        border-radius: 1.25rem;
        box-shadow: 0 24px 60px rgba(28, 51, 110, 0.1);
    }

    .login-title {
        margin-bottom: 0.35rem;
        font-weight: 700;
        font-size: 1.5rem;
        color: #16244a;
    }

    .login-subtitle {
        margin-bottom: 1.75rem;
        font-size: 0.9375rem;
        color: #7b859c;
    }

    .login-field {
        margin-bottom: 1rem;
    }

    .login-submit {
        margin-top: 0.75rem;
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0;
    }

    .login-submit:not(.v-btn--disabled) {
        box-shadow: 0 10px 24px rgba(59, 111, 224, 0.28);
    }

    .login-divider {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1.5rem 0 0.25rem;
        color: #a3aabb;
        font-size: 0.875rem;
    }

    .login-divider::before,
    .login-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(148, 163, 184, 0.25);
    }

    .login-wrapper :deep(.orcid-btn) {
        display: flex;
        justify-content: center;
        width: 100%;
        border-radius: 0.5rem;
        outline-color: rgba(148, 163, 184, 0.6);
    }

    .forgot-password-link,
    .register-prompt {
        font-size: 0.9375rem;
        font-weight: 400;
        line-height: 1.5;
        color: #556080;
    }

    .forgot-password-link {
        display: inline-block;
        margin-top: 1rem;
        color: #3b6fe0;
        text-decoration: none;
    }

    .register-prompt {
        margin: 0.75rem 0 0;
    }

    .register-link {
        margin-left: 0.35rem;
        font-size: inherit;
        font-weight: inherit;
        color: #3b6fe0;
        text-decoration: none;
    }

    .forgot-password-link:hover,
    .forgot-password-link:focus-visible,
    .register-link:hover,
    .register-link:focus-visible {
        text-decoration: underline;
        text-underline-offset: 3px;
    }

    .recovery-sent-message {
        margin-bottom: 1.5rem;
        font-weight: 500;
        line-height: 1.6;
        color: #556080;
    }

    .progress {
        margin-top: 15px;
    }

    @media (max-width: 959px) {
        .intro-description,
        .intro-highlights {
            display: none;
        }

        .intro-brand {
            justify-content: center;
            gap: 0.85rem;
            margin-bottom: 1.5rem;
        }

        .intro-logo,
        .intro-logo-img {
            width: 2.75rem;
            height: 2.75rem;
        }

        .intro-title {
            font-size: 1.75rem;
        }
    }

</style>
