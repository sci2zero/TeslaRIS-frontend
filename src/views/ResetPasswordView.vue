<template>
    <v-container class="text-center">
        <v-sheet class="text-center">
            <h1>{{ $t("resetPasswordLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <v-row v-if="success === null">
            <v-col cols="12">
                <v-form v-model="isFormValid" @submit.prevent>
                    <v-row justify="center">
                        <v-col cols="6" class="bg-blue-grey-lighten-5">
                            <password-input-with-meter :label="$t('newPasswordLabel')" @password-change="newPassword = $event" @show-repeated-password="showRepeatedPassword = !showRepeatedPassword"></password-input-with-meter>
                        </v-col>
                    </v-row>
                    <v-row justify="center">
                        <v-col cols="6" class="bg-blue-grey-lighten-5">
                            <v-text-field
                                v-model="repeatNewPassword"
                                :label="$t('repeatNewPasswordLabel')"
                                :rules="repeatPasswordRules"
                                validate-on-blur
                                :type="showRepeatedPassword ? 'text' : 'password'"
                            ></v-text-field>
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
        <v-sheet class="text-center">
            <h1 v-if="success === true">
                {{ $t("resetPasswordSuccessMessage") }}
            </h1>
            <h1 v-if="success === false">
                {{ $t("resetPasswordFailedMessage") }}
            </h1>
        </v-sheet>
    </v-container>
</template>
  

<script lang="ts">
import PasswordInputWithMeter from "@/components/core/PasswordInputWithMeter.vue";
import type { ResetPasswordRequest } from "@/models/AuthenticationModel";
import AuthenticationService from "@/services/AuthenticationService";
import { computed, onMounted } from "vue";
import { ref } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";


export default defineComponent(
{
    name: "ResetPasswordView",
    components: { PasswordInputWithMeter },
    setup() {
        const showRepeatedPassword = ref(false);
        const isFormValid = ref(false);

        const success = ref<boolean | null>(null); 

        const newPassword = ref("");
        const repeatNewPassword = ref("");

        const router = useRouter();
        const currentRoute = useRoute();

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const passwordsDontMatchMessage = computed(() => i18n.t("passwordsDontMatchMessage"));

        onMounted(() => {
            document.title = i18n.t("resetPasswordLabel");
        });
        
        const repeatPasswordRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                if (newPassword.value !== repeatNewPassword.value) return passwordsDontMatchMessage.value;
                return true;
            }
        ];

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

        return {isFormValid, showRepeatedPassword, setNewPassword, repeatPasswordRules, newPassword, repeatNewPassword, success};
    }
}
);
</script>
