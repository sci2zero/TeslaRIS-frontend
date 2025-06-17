<template>
    <v-container>
        <h1 v-if="!confirmationSuccessfull && !confirmationFailed">
            {{ $t("emailUpdateConfirmationInProgressMessage") }}
        </h1>
        <h1 v-if="confirmationSuccessfull">
            {{ $t("emailUpdateConfirmationSuccessMessage") }}
        </h1>
        <h1 v-if="confirmationFailed">
            {{ $t("emailUpdateConfirmationFailedMessage") }}
        </h1>
    </v-container>
</template>

<script lang="ts">
import { onMounted } from "vue";
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserService from "@/services/UserService";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import AuthenticationService from "@/services/AuthenticationService";
import { useLoginStore } from "@/stores/loginStore";


export default defineComponent({
    name: "EmailUpdateConfirmation",
    setup() {
        const i18n = useI18n();
        const router = useRouter();
        const currentRoute = useRoute();
        const confirmationSuccessfull = ref(false);
        const confirmationFailed = ref(false);

        const loginStore = useLoginStore();

        onMounted(async () => {
            if (AuthenticationService.userLoggedIn()) {
                AuthenticationService.logoutUser();
                loginStore.explicitlyLogout();
            }

            await router.isReady()
            const confirmationToken = currentRoute.params.confirmationToken as string;
            
            UserService.confirmEmailChange(
                {
                    confirmationToken: confirmationToken
                }
            ).then(() => {
                confirmationSuccessfull.value = true;
                confirmationFailed.value = false;

                setTimeout(() => router.push({ name: "login" }), 5000);
            }).catch(() => {
                confirmationSuccessfull.value = false;
                confirmationFailed.value = true;
            });

            document.title = i18n.t("accountActivationLabel");
        });

        return {
            confirmationSuccessfull, confirmationFailed
        };
    }
});
</script>
