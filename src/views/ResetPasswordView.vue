<template>
    <v-container>
        <header class="mb-8">
            <h1 class="text-3xl font-bold tracking-tight text-slate-800">
                {{ $t("resetPasswordLabel") }}
            </h1>
        </header>
        <v-row v-if="success === null">
            <v-col cols="12">
                <v-form v-model="isFormValid" @submit.prevent>
                    <v-row justify="center">
                        <v-col cols="6" class="bg-blue-grey-lighten-5">
                            <password-input-with-meter :label="$t('newPasswordLabel')" repeat-password @password-change="newPassword = $event" />
                        </v-col>
                    </v-row>
                    <v-row justify="center">
                        <v-col cols="6">
                            <v-btn
                                block type="submit"
                                :disabled="!isFormValid"
                                color="primary"
                                @click="setNewPassword">
                                {{ $t('resetPasswordLabel') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
        <h1 v-if="success === true" class="text-3xl font-bold tracking-tight text-slate-800">
            {{ $t("resetPasswordSuccessMessage") }}
        </h1>
        <h1 v-if="success === false" class="text-3xl font-bold tracking-tight text-slate-800">
            {{ $t("resetPasswordFailedMessage") }}
        </h1>
    </v-container>
</template>
  

<script lang="ts">
import PasswordInputWithMeter from "@/components/core/PasswordInputWithMeter.vue";
import type { ResetPasswordRequest } from "@/models/AuthenticationModel";
import AuthenticationService from "@/services/AuthenticationService";
import { onMounted } from "vue";
import { ref } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";


export default defineComponent(
{
    name: "ResetPasswordView",
    components: { PasswordInputWithMeter },
    setup() {
        const isFormValid = ref(false);

        const success = ref<boolean | null>(null); 

        const newPassword = ref("");

        const router = useRouter();
        const currentRoute = useRoute();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("resetPasswordLabel");
        });

        const setNewPassword = async () => {
            await router.isReady();
            const resetRequest: ResetPasswordRequest = {
                newPassword: newPassword.value,
                resetToken: currentRoute.params.resetToken as string
            };

            AuthenticationService.resetPassword(resetRequest).then(() => {
                success.value = true;
            }).catch(() => {
                success.value = false;
            });
        }

        return {isFormValid, setNewPassword, newPassword, success};
    }
}
);
</script>
