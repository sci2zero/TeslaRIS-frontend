<template>
    <div id="login-page">
        <div class="login-wrapper">
            <h2 class="login-title">
                {{ $t('loginLabel') }}
            </h2>
            <v-form v-model="isFormValid" @submit.prevent>
                <v-text-field v-model="email" :rules="emailFieldRules" name="email" :label="$t('emailLabel')"></v-text-field>
                <v-text-field
                    v-model="password" :rules="passwordFieldRules" name="password" type="password"
                    :label="$t('passwordLabel')"></v-text-field>

                <br />
                <v-btn
                    class="login-submit" block type="submit" :disabled="!isFormValid"
                    @click="login">
                    {{ $t('loginLabel') }}
                </v-btn>

                <br />
                <a href="#" class="forgot-password-link">{{ $t("forgotPasswordLabel") }}</a>
                <br />
                <localized-link to="register">
                    {{ $t("registerFromLoginLabel") }}
                </localized-link>
            </v-form>
        </div>
    </div>
    <v-snackbar
        v-model="snackbar"
        :timeout="timeout">
        {{ $t("emailOrPasswordIncorrectError") }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
</template>


<script lang="ts">
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import AuthenticationService from "@/services/AuthenticationService";
import {useLoginStore} from "@/stores/loginStore"
import { computed } from "vue";
import { ref } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

export default defineComponent(
    {
        name: "LoginView",
        components: { LocalizedLink },
        setup() {
            const isFormValid = ref(false);
            const snackbar = ref(false);
            const timeout = 5000;
            const email = ref("");
            const password = ref("");
            const loginStore = useLoginStore();
            const router = useRouter();
            const i18n = useI18n();
            const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
            const emailFormatMessage = computed(() => i18n.t("emailFormatError"));

            const emailFieldRules = [
                (value: string) => {
                    if (!value) return requiredFieldMessage.value;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) return emailFormatMessage.value;
                    return true;
                }
            ];

            const passwordFieldRules = [
                (value: string) => {
                    if (!value) return requiredFieldMessage.value;
                    return true;
                }
            ];

            const login = () => {
                AuthenticationService.login({email: email.value, password: password.value}).then((response) => {
                    sessionStorage.setItem("jwt", response.data.token);
                    sessionStorage.setItem("refreshToken", response.data.refreshToken);

                    loginStore.emitLoginSuccess();
                    router.push({ name: "home" });
                }).catch(() => {
                    snackbar.value = true;
                });
            };

            return {email, emailFieldRules, password, passwordFieldRules, snackbar, timeout, isFormValid, login};
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
            text-align: right;
            display: block;
        }

        .register-link {
            display: block;
            text-align: center;
        }
    }

</style>