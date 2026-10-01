<template>
    <div id="register-page">
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

                <section class="register-card">
                    <h2 class="register-title">
                        {{ $t("registerLabel") }}
                    </h2>
                    <p v-if="!oauthRegistration" class="register-subtitle">
                        {{ stepperValue === 1 ? $t("registerSubtitleMessage") : $t("registerAccountSubtitleMessage") }}
                    </p>

                    <ol v-if="!oauthRegistration" class="register-steps">
                        <li class="register-step" :class="{ active: stepperValue === 1, done: stepperValue > 1 }">
                            <span class="step-index">1</span>
                            <span>{{ $t("registerStepNameLabel") }}</span>
                        </li>
                        <li class="register-step" :class="{ active: stepperValue === 2 }">
                            <span class="step-index">2</span>
                            <span>{{ $t("registerStepAccountLabel") }}</span>
                        </li>
                    </ol>

                    <div v-if="!oauthRegistration">
                        <div v-show="stepperValue === 1">
                            <registration-first-step
                                @registration-next-step="nextStep"
                                @field-update="checkForNextStep" />
                            <v-btn
                                v-show="newResearcherCreationAllowed"
                                class="register-submit"
                                block
                                size="large"
                                rounded="lg"
                                color="#3b6fe0"
                                :disabled="!canAdvance"
                                @click="nextStep()">
                                {{ $t("nextLabel") }}
                            </v-btn>
                        </div>

                        <div v-show="stepperValue === 2">
                            <v-btn
                                variant="text"
                                class="register-back"
                                @click="previousStep">
                                {{ $t("previousLabel") }}
                            </v-btn>
                            <registration-second-step
                                :firstname="userDetails.firstName"
                                :lastname="userDetails.lastName" />
                        </div>
                    </div>
                    <o-auth-registration-form
                        v-else
                        :new-researcher-creation-allowed="newResearcherCreationAllowed"
                    />

                    <p class="account-prompt">
                        {{ $t("alreadyHaveAccountLabel") }}
                        <localized-link to="login" class="account-link">
                            {{ $t("loginLabel") }}
                        </localized-link>
                    </p>
                </section>
            </div>
        </v-container>
    </div>
</template>

<script lang="ts">
import OAuthRegistrationForm from '@/components/user/registration/OAuthRegistrationForm.vue';
import RegistrationFirstStep from '@/components/user/registration/RegistrationFirstStep.vue';
import RegistrationSecondStep from '@/components/user/registration/RegistrationSecondStep.vue';
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import UserService from '@/services/UserService';
import { usePublicConfigurationStore } from "@/stores/publicConfigurationStore";
import { useRegisterStore } from "@/stores/registerStore";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';


export default defineComponent({
    name: "RegisterView",
    components: { RegistrationFirstStep, RegistrationSecondStep, OAuthRegistrationForm, LocalizedLink },

    setup() {
        const stepperValue = ref(1);
        const canAdvance = ref(false);
        const newResearcherCreationAllowed = ref(false);
        const oauthRegistration = ref(false);

        const route = useRoute();
        const router = useRouter();
        const i18n = useI18n();
        const registerStore = useRegisterStore();

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

        onMounted(() => {
            document.title = i18n.t("registerLabel");

            oauthRegistration.value = Boolean(route.query.oauth as string);

            UserService.isRegisterResearcherCreationAllowed().then(response => {
                newResearcherCreationAllowed.value = response.data;
            });
        });

        const userDetails = ref({
            firstName: "",
            lastName: ""
        });

        const nextStep = (data?: { firstName?: string, lastName?: string }) => {
            const fromStep = !!data && typeof data === "object" && "firstName" in data;

            if (!fromStep) {
                registerStore.clearRegisterPersonData();
            }

            if (fromStep && data?.firstName) {
                userDetails.value.firstName = data.firstName;
            }

            if (fromStep && data?.lastName) {
                userDetails.value.lastName = data.lastName;
            }
            
            stepperValue.value = 2;
        };

        const previousStep = () => {
            stepperValue.value -= 1;
        };

        const checkForNextStep = (firstname: string, lastname: string) => {
            if(firstname !== "" && lastname !== "") {
                canAdvance.value = true;
                userDetails.value.firstName = firstname;
                userDetails.value.lastName = lastname;
            } else {
                canAdvance.value = false;
            }
        };

        return {
            stepperValue, nextStep,
            userDetails, previousStep,
            checkForNextStep, canAdvance,
            newResearcherCreationAllowed,
            oauthRegistration,
            title, description, hasCustomLogo, logoUrl, highlights, goTo,
            dotDelay, returnCurrentLocaleContent
        }
    }
});
</script>

<style scoped>
    #register-page {
        position: relative;
        width: 100%;
        overflow: hidden;
        background: linear-gradient(135deg, #fbfcff 0%, #f3f6fd 50%, #eef3fc 100%);
    }

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
        display: grid;
        grid-template-columns: 1fr;
        gap: 3rem;
        align-items: start;
        width: 100%;
    }

    @media (min-width: 960px) {
        .login-grid {
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
            gap: 4rem;
        }
    }

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

        .register-card {
            padding: 1.5rem 1.25rem;
        }
    }

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

    .register-card {
        width: 100%;
        max-width: 28rem;
        margin-inline: auto;
        padding: 2.5rem 2rem;
        background: #ffffff;
        border: 1px solid rgba(148, 163, 184, 0.14);
        border-radius: 1.25rem;
        box-shadow: 0 24px 60px rgba(28, 51, 110, 0.1);
    }

    .register-title {
        margin-bottom: 0.35rem;
        font-weight: 700;
        font-size: 1.5rem;
        color: #16244a;
    }

    .register-subtitle {
        margin-bottom: 1.25rem;
        font-size: 0.9375rem;
        color: #7b859c;
    }

    .register-steps {
        display: flex;
        gap: 0.75rem;
        margin: 0 0 1.5rem;
        padding: 0;
        list-style: none;
    }

    .register-step {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #8a94ad;
    }

    .register-step.active,
    .register-step.done {
        color: #16244a;
    }

    .step-index {
        display: grid;
        flex-shrink: 0;
        place-items: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 999px;
        background: #eef2f8;
        font-size: 0.75rem;
        color: #556080;
    }

    .register-step.active .step-index,
    .register-step.done .step-index {
        background: #3b6fe0;
        color: #ffffff;
    }

    .register-submit {
        margin-top: 0.75rem;
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0;
    }

    .register-submit:not(.v-btn--disabled) {
        box-shadow: 0 10px 24px rgba(59, 111, 224, 0.28);
    }

    .register-back {
        margin-bottom: 0.75rem;
        padding-inline: 0;
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0;
        color: #3b6fe0;
    }

    .account-prompt {
        margin: 1.25rem 0 0;
        font-size: 0.9375rem;
        font-weight: 400;
        line-height: 1.5;
        color: #556080;
    }

    .account-link {
        margin-left: 0.35rem;
        font-size: inherit;
        font-weight: inherit;
        color: #3b6fe0;
        text-decoration: none;
    }

    .account-link:hover,
    .account-link:focus-visible {
        text-decoration: underline;
        text-underline-offset: 3px;
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
