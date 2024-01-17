<template>
    <h1>Activating account...</h1>
    <h1 v-if="accountSuccessfullyActivated">
        Account successfully activated, you can now close this page and login.
    </h1>
    <h1 v-if="accountActivationFailed">
        Account activation failed, if this issue persists please contact platform administrator.
    </h1>
</template>

<script lang="ts">
import { onMounted } from "vue";
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserService from "@/services/UserService";
import { ref } from "vue";

export default defineComponent({
    name: "AccountActivationView",
    setup() {
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
        });

        return {accountSuccessfullyActivated, accountActivationFailed}
    }
});
</script>
