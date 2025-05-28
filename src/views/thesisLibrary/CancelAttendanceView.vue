<template>
    <div
        v-if="!cancellationComplete"
        class="d-flex flex-row justify-center">
        <h1> {{ $t("cancelAttendanceMessage") }}</h1>
    </div>
    <div
        v-if="!cancellationComplete"
        class="d-flex flex-row justify-center mt-5">
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
    </div>
    <div v-if="cancellable">
        <div
            v-if="!cancellationComplete"
            class="d-flex flex-row justify-center mt-5">
            <v-btn
                density="comfortable" class="bottom-spacer"
                color="primary"
                @click="cancelAttendance">
                {{ $t("cancelAttendanceLabel") }}
            </v-btn>
        </div>
        <div v-else class="d-flex flex-row justify-center mt-5">
            <h1> {{ $t("cancellationCompleteMessage") }}</h1>
        </div>
    </div>
</template>

<script lang="ts">
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import { computed, defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import VueRecaptcha from 'vue3-recaptcha2';


export default defineComponent({
    name: "CancelAttendanceView",
    components: { VueRecaptcha },
    setup() {
        const currentRoute = useRoute();
        const cancellable = ref(false);
        const cancellationComplete = ref(false);

        const token = ref("");
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;
        const vueRecaptcha = ref<typeof VueRecaptcha>();
        const i18n = useI18n();
        const locale = computed(() => i18n.locale.value);

        watch(token, () => {
            if (token.value) {
                RegistryBookService.isAttendanceCancellable(
                    currentRoute.params.attendanceIdentifier as string
                ).then((response) => {
                    cancellable.value = response.data;
                });
            }
        })

        const cancelAttendance = () => {
            RegistryBookService.cancelAttendance(
                currentRoute.params.attendanceIdentifier as string,
                token.value
            ).then(() => {
                cancellationComplete.value = true;
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
            cancelAttendance,
            cancellationComplete,
            cancellable, siteKey,
            vueRecaptcha, locale,
            resetChallenge,
            handleVerifyCallback
        };
    }
});
</script>
