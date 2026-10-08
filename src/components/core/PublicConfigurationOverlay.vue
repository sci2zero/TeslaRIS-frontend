<template>
    <div v-if="isVisible" class="config-gate">
        <div class="config-gate-toolbar">
            <lang-change-item variant="home" theme="dark" :z-index="10000" />
        </div>

        <div class="config-gate-content">
            <img
                :src="publicConfigurationStore.logoDisplayUrl"
                alt=""
                class="config-gate-logo"
            >

            <template v-if="publicConfigurationStore.loading">
                <p class="config-gate-title">
                    {{ $t("loadingConfigurationLabel") }}
                </p>
                <p class="config-gate-description">
                    {{ $t("loadingConfigurationDescription") }}
                </p>
                <v-progress-circular
                    indeterminate
                    size="56"
                    width="5"
                    color="#ffffff"
                />
            </template>

            <template v-else>
                <p class="config-gate-title">
                    {{ $t("applicationUnavailableLabel") }}
                </p>
                <p class="config-gate-description">
                    {{ $t("applicationUnavailableDescription") }}
                </p>
                <v-btn
                    variant="outlined"
                    color="white"
                    :loading="publicConfigurationStore.refreshing"
                    @click="publicConfigurationStore.refreshFromBackend()">
                    {{ $t("retryConnectionLabel") }}
                </v-btn>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import LangChangeItem from "@/components/core/LangChangeItem.vue";
import { usePublicConfigurationStore } from "@/stores/publicConfigurationStore";


export default defineComponent({
    name: "PublicConfigurationOverlay",
    components: { LangChangeItem },
    setup() {
        const publicConfigurationStore = usePublicConfigurationStore();
        const isVisible = computed(() =>
            publicConfigurationStore.loading || publicConfigurationStore.backendUnavailable
        );

        return {
            publicConfigurationStore,
            isVisible
        };
    }
});
</script>

<style scoped>
.config-gate {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0b1220;
}

.config-gate-toolbar {
    position: absolute;
    top: 1rem;
    right: 1rem;
}

.config-gate-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 2rem;
    text-align: center;
    color: #ffffff;
}

.config-gate-logo {
    height: 4rem;
    width: auto;
    filter: brightness(0) invert(1);
}

.config-gate-title {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 600;
    letter-spacing: 0.01em;
}

.config-gate-description {
    margin: 0;
    max-width: 28rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #cbd5e1;
}
</style>
