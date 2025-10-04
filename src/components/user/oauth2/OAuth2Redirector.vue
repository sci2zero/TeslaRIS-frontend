<template>
    <div class="d-flex flex-row justify-center mt-15">
        <div v-if="loading">
            <h1>
                {{ $t("authorizingLabel", {name: name}) }}. {{ $t("pleaseWaitLabel") }}.
            </h1>
            <div class="d-flex flex-row justify-center mt-5">
                <v-progress-circular
                    color="primary"
                    indeterminate
                    size="128"
                ></v-progress-circular>
            </div>
            <div class="mt-10">
                <img
                    v-if="registrationId === 'orcid'"
                    src="@/assets/oauth2/orcid_logotype.png"
                    alt="ORCID logotype"
                />
            </div>
        </div>
        <div v-else>
            <h1>
                {{ $t("redirectingLabel") }}
            </h1>
        </div>

        <div v-if="error">
            <h1>
                {{ $t("genericErrorMessage") }}
            </h1>
        </div>
    </div>
</template>

<script lang="ts">
import AuthenticationService from '@/services/AuthenticationService';
import UserService from '@/services/UserService';
import { useLoginStore } from '@/stores/loginStore';
import { useRouteStore } from '@/stores/routeStore';
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';


  export default defineComponent({
    name: "OAuth2Redirector",
    setup() {
        const currentRoute = useRoute();
        const router = useRouter();

        const loginStore = useLoginStore();
        const routeStore = useRouteStore();

        const name = ref<string>("");
        const loading = ref<boolean>(false);
        const error = ref<boolean>(false);

        const registrationId = ref<string>("");

        onMounted(async () => {
            await router.isReady();
            
            name.value = currentRoute.query.name as string;
            registrationId.value = currentRoute.query.registrationId as string;
            finishWorkflow();
        });

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        
        const finishWorkflow = () => {
            loading.value = true;
            const code = currentRoute.query.code as string;
            const identifier = currentRoute.query.identifier as string;

            AuthenticationService.finishOAuth2Workflow(code, identifier).then(async (response) => {
                localStorage.setItem("jwt", response.data.token);
                localStorage.setItem("refreshToken", response.data.refreshToken);

                await delay(3000);

                loginStore.emitLoginSuccess();
                const preferredUILanguage = UserService.provideUserPreferredUILanguage();

                if (routeStore.nextRoute != null) {
                    const routeName = routeStore.fetchAndClearRoute();
                    const routeParams = routeStore.fetchAndClearParams();
                    
                    router.push(
                        {
                            name: routeName,
                            params: {...routeParams, locale: preferredUILanguage }
                        }
                    );

                    return;
                }

                loading.value = false;

                router.push({ name: "home", params: { locale: preferredUILanguage } });
            }).catch(() => {
                error.value = true;
                loading.value = false;
            });
        };
    
        return {
            name, loading,
            error, registrationId
        };
    }
  });
</script>
