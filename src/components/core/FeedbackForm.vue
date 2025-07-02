<template>
    <v-row class="d-flex justify-center align-center mt-10">
        <v-col cols="12" md="6">
            <div class="text-start">
                <h1>{{ $t("contactLabel") }}</h1>
                <h3>{{ $t("feedbackMessage") }}</h3>
            </div>
        </v-col>
    </v-row>

    <v-row class="d-flex justify-center align-center mt-10">
        <v-col cols="12" md="6">
            <v-form v-model="isFormValid" @submit.prevent>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="name" :label="$t('fullNameLabel') + '*'" :placeholder="$t('fullNameLabel') + '*'"
                            :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="senderEmail" :label="$t('emailLabel') + '*'" :placeholder="$t('emailLabel') + '*'"
                            :rules="emailFieldRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="subject" :label="$t('subjectLabel') + '*'" :placeholder="$t('subjectLabel') + '*'"
                            :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-textarea
                            v-model="body" :label="$t('bodyLabel') + '*'" :placeholder="$t('bodyLabel') + '*'"
                            :rules="requiredFieldRules" rows="15"></v-textarea>
                    </v-col>
                </v-row>

                <v-row>
                    <p class="required-fields-message">
                        {{ $t("requiredFieldsMessage") }}
                    </p>
                </v-row>
            </v-form>
        </v-col>
    </v-row>

    <v-row class="d-flex justify-center align-start mt-5">
        <v-col cols="12" md="6">
            <vue-recaptcha
                ref="vueRecaptcha"
                :sitekey="siteKey"
                size="normal"
                theme="light"
                :hl="locale"
                :loading-timeout="30000"
                @verify="handleVerifyCallback"
                @expire="resetChallenge"
                @error="resetChallenge">
            </vue-recaptcha>
        </v-col>
    </v-row>

    <v-row class="d-flex justify-center align-center">
        <v-col cols="12" md="6">
            <v-btn
                color="blue darken-1"
                :disabled="!isFormValid || !token"
                @click="submitFeedback">
                {{ $t("submitFeedbackLabel") }}
            </v-btn>
        </v-col>
    </v-row>

    <v-row class="d-flex justify-center align-center mt-15">
        <v-col cols="12" md="6">
            <h2>{{ $t("locationLabel") }}</h2>
        </v-col>
    </v-row>

    <v-row class="d-flex justify-center align-center mt-2 mb-2">
        <v-col cols="12" md="6">
            <open-layers-map
                ref="mapRef"
                height="450px"
                :init-coordinates="[19.84729726232776, 45.2445057070595]" 
                :read-only="true"
            />
        </v-col>
    </v-row>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { useValidationUtils } from '@/utils/ValidationUtils';
import { computed, defineComponent, ref } from 'vue';
import OpenLayersMap from './OpenLayersMap.vue';
import FeedbackService from '@/services/FeedbackService';
import Toast from './Toast.vue';
import { useI18n } from 'vue-i18n';
import VueRecaptcha from 'vue3-recaptcha2';


export default defineComponent({
    name: "FeedbackForm",
    components: { OpenLayersMap, Toast, VueRecaptcha },
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);
        const message = ref("");

        const i18n = useI18n();
        const locale = computed(() => i18n.locale.value);

        const name = ref("");
        const senderEmail = ref("");
        const subject = ref("");
        const body = ref("");

        const vueRecaptcha = ref<typeof VueRecaptcha>();
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;
        const token = ref("");

        const { emailFieldRules, requiredFieldRules } = useValidationUtils();

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
            vueRecaptcha, token
        };
    }
});
</script>
