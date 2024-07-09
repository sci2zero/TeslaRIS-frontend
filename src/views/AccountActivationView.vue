<template>
    <v-container>
        <h1>{{ $t("accountActivationInProgressMessage") }}</h1>
        <h1 v-if="accountSuccessfullyActivated">
            {{ $t("accountActivationSuccessMessage") }}
        </h1>
        <h1 v-if="accountActivationFailed">
            {{ $t("accountActivationFailedMessage") }}
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

export default defineComponent({
    name: "AccountActivationView",
    setup() {
        const i18n = useI18n();
        const router = useRouter();
        const currentRoute = useRoute();
        const accountSuccessfullyActivated = ref(false);
        const accountActivationFailed = ref(false);

        onMounted(async () => {
            await router.isReady()
            const activationToken = currentRoute.params.activationToken as string;
            
            UserService.activateUserAccount({activationToken: activationToken}).then(() => {
                accountSuccessfullyActivated.value = true;
                accountActivationFailed.value = false;
            }).catch(() => {
                accountSuccessfullyActivated.value = false;
                accountActivationFailed.value = true;
            })

            document.title = i18n.t("accountActivationLabel");
        });

        return {accountSuccessfullyActivated, accountActivationFailed}
    }
});
</script>
