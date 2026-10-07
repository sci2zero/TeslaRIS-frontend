<template>
    <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header class="mb-8 max-w-2xl">
            <h1 class="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
                {{ $t("contactLabel") }}
            </h1>
            <p class="mt-3 text-base text-slate-600">
                {{ $t("feedbackMessage") }}
            </p>
        </header>

        <div class="grid items-start gap-6 lg:grid-cols-5">
            <section
                class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
                :class="showContactAside ? 'lg:col-span-3' : 'mx-auto w-full max-w-3xl lg:col-span-5'"
            >
                <v-form v-model="isFormValid" class="space-y-4" @submit.prevent="submitFeedback">
                    <ui-input
                        v-model="name"
                        :label="$t('fullNameLabel') + '*'"
                        :placeholder="$t('fullNameLabel')"
                        :rules="requiredFieldRules"
                    />
                    <ui-input
                        v-model="senderEmail"
                        :label="$t('emailLabel') + '*'"
                        :placeholder="$t('emailLabel')"
                        :rules="emailFieldRules"
                    />
                    <ui-input
                        v-model="subject"
                        :label="$t('subjectLabel') + '*'"
                        :placeholder="$t('subjectLabel')"
                        :rules="requiredFieldRules"
                    />
                    <ui-input
                        v-model="body"
                        control="textarea"
                        :label="$t('bodyLabel') + '*'"
                        :placeholder="$t('bodyLabel')"
                        :rules="requiredFieldRules"
                        rows="8"
                    />

                    <p class="text-xs text-slate-500">
                        {{ $t("requiredFieldsMessage") }}
                    </p>

                    <vue-recaptcha
                        ref="vueRecaptcha"
                        :sitekey="siteKey"
                        size="normal"
                        theme="light"
                        :hl="locale"
                        :loading-timeout="30000"
                        @verify="handleVerifyCallback"
                        @expire="resetChallenge"
                        @error="resetChallenge"
                    />

                    <UiButton
                        type="submit"
                        :disabled="!isFormValid || !token"
                    >
                        {{ $t("submitFeedbackLabel") }}
                    </UiButton>
                </v-form>
            </section>

            <aside
                v-if="showContactAside"
                class="space-y-4 lg:col-span-2"
            >
                <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 class="text-lg font-semibold text-slate-800">
                        {{ $t("locationLabel") }}
                    </h2>

                    <div class="mt-4 space-y-4">
                        <div v-if="formattedAddress" class="flex items-start gap-3">
                            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-600 text-white">
                                <span class="mdi mdi-map-marker text-sm" aria-hidden="true" />
                            </span>
                            <p class="pt-1 text-sm font-medium text-slate-800">
                                {{ formattedAddress }}
                            </p>
                        </div>
                        <div v-if="phoneNumber" class="flex items-start gap-3">
                            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-600 text-white">
                                <span class="mdi mdi-phone text-sm" aria-hidden="true" />
                            </span>
                            <a
                                :href="`tel:${phoneNumber}`"
                                class="pt-1 text-sm font-medium text-slate-800 underline decoration-slate-400 underline-offset-2 hover:text-blue-700"
                            >
                                {{ phoneNumber }}
                            </a>
                        </div>
                    </div>
                </section>

                <div v-if="hasLocation" class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <iframe
                        class="h-80 w-full border-0"
                        :src="mapEmbedUrl"
                        :title="$t('locationLabel')"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                        allowfullscreen
                    />
                </div>
            </aside>
        </div>
    </div>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { useValidationUtils } from '@/utils/ValidationUtils';
import { computed, defineComponent, onMounted, ref } from 'vue';
import FeedbackService from '@/services/FeedbackService';
import Toast from './Toast.vue';
import { useI18n } from 'vue-i18n';
import VueRecaptcha from 'vue3-recaptcha2';
import { useBrandingInformation } from '@/composables/useBrandingInformation';
import UiInput from '@/components/ui/input/Input.vue';
import { UiButton } from '@/components/ui/button';


export default defineComponent({
    name: "FeedbackForm",
    components: { Toast, VueRecaptcha, UiInput, UiButton },
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);
        const message = ref("");

        const {
            location, phoneNumber, formattedAddress, hasLocation
        } = useBrandingInformation();

        const showContactAside = computed(() =>
            !!formattedAddress.value || !!phoneNumber.value || hasLocation.value
        );

        const i18n = useI18n();
        const locale = computed(() => i18n.locale.value);

        const mapEmbedUrl = computed(() => {
            if (!location.value?.latitude || !location.value?.longitude) {
                return "";
            }

            const params = new URLSearchParams({
                q: `${location.value.address}`,
                z: "16",
                hl: locale.value,
                output: "embed",
            });

            return `https://maps.google.com/maps?${params.toString()}`;
        });

        const name = ref("");
        const senderEmail = ref("");
        const subject = ref("");
        const body = ref("");

        const vueRecaptcha = ref<typeof VueRecaptcha>();
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;
        const token = ref("");

        const { emailFieldRules, requiredFieldRules } = useValidationUtils();

        onMounted(() => {
            document.title = i18n.t("contactLabel");
        });

        const submitFeedback = () => {
            FeedbackService.submitFeedback(
                {
                    name: name.value,
                    senderEmail: senderEmail.value,
                    subject: subject.value,
                    message: body.value,
                    captchaToken: token.value
                }
            ).then(() => {
                snackbar.value = true;
                message.value = i18n.t('messageSentLabel');
            }).catch(() => {
                snackbar.value = true;
                message.value = i18n.t('genericErrorMessage');
            });
        };

        const resetChallenge = () => {
            token.value = "";
            vueRecaptcha.value?.reset();
        };
        
        const handleVerifyCallback = (response: string) => {
            token.value = response;
        };

        return {
            isFormValid, siteKey,
            name, senderEmail,
            emailFieldRules,
            requiredFieldRules,
            subject, body,
            submitFeedback,
            snackbar, message,
            locale, resetChallenge,
            handleVerifyCallback,
            vueRecaptcha, token,
            phoneNumber, formattedAddress, hasLocation,
            showContactAside, mapEmbedUrl
        };
    }
});
</script>
