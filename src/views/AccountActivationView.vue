<template>
    <v-container>
        <h1 v-if="!accountSuccessfullyActivated && !accountActivationFailed">
            {{ $t("accountActivationInProgressMessage") }}
        </h1>
        <h1 v-if="accountSuccessfullyActivated">
            {{ $t("accountActivationSuccessMessage") }}
        </h1>
        <h1 v-if="accountActivationFailed">
            {{ $t("accountActivationFailedMessage") }}
        </h1>
        <div v-if="accountSuccessfullyActivated" class="mt-4">
            <p>
                {{ $t("redirectingToLoginMessage", {count: secondsUntilRedirect}) }}
            </p>
            <v-btn color="primary" class="mt-3" @click="goToLogin">
                {{ $t("loginLabel") }}
            </v-btn>
        </div>
    </v-container>
</template>

<script lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserService from "@/services/UserService";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const REDIRECT_COUNTDOWN_SECONDS = 5;

export default defineComponent({
    name: "AccountActivationView",
    setup() {
        const i18n = useI18n();
        const router = useRouter();
        const currentRoute = useRoute();
        const accountSuccessfullyActivated = ref(false);
        const accountActivationFailed = ref(false);
        const secondsUntilRedirect = ref(REDIRECT_COUNTDOWN_SECONDS);

        let countdownInterval: ReturnType<typeof setInterval> | undefined;

        const stopCountdown = () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = undefined;
            }
        };

        const goToLogin = () => {
            stopCountdown();
            router.push({name: "login"});
        };

        const startRedirectCountdown = () => {
            secondsUntilRedirect.value = REDIRECT_COUNTDOWN_SECONDS;

            countdownInterval = setInterval(() => {
                secondsUntilRedirect.value -= 1;

                if (secondsUntilRedirect.value <= 0) {
                    goToLogin();
                }
            }, 1000);
        };

        onMounted(async () => {
            await router.isReady();
            
            const activationToken = currentRoute.params.activationToken as string;
            
            UserService.activateUserAccount({activationToken: activationToken}).then(() => {
                accountSuccessfullyActivated.value = true;
                accountActivationFailed.value = false;
                startRedirectCountdown();
            }).catch(() => {
                accountSuccessfullyActivated.value = false;
                accountActivationFailed.value = true;
            })

            document.title = i18n.t("accountActivationLabel");
        });

        onBeforeUnmount(() => {
            stopCountdown();
        });

        return {accountSuccessfullyActivated, accountActivationFailed, secondsUntilRedirect, goToLogin}
    }
});
</script>
