import { computed, ref, watch, type ComputedRef, type Ref } from "vue";

export type LandingOverviewContent = {
    visible: boolean;
    settled: boolean;
};

export function useLandingOverview<T>(
    entity: Ref<T>,
    currentTab: Ref<string>,
    fallbackTab: string,
): {
    showOverview: ComputedRef<boolean>;
    showOverviewTab: ComputedRef<boolean>;
    onOverviewContent: (state: LandingOverviewContent) => void;
} {
    const overviewVisible = ref(false);
    const overviewSettled = ref(false);
    const redirectedFromOverview = ref(false);
    const showOverview = computed(() => overviewVisible.value);
    const showOverviewTab = computed(() => !overviewSettled.value || overviewVisible.value);

    const onOverviewContent = (state: LandingOverviewContent) => {
        overviewVisible.value = state.visible;
        overviewSettled.value = state.settled;
    };

    watch(currentTab, (tab) => {
        if (redirectedFromOverview.value && tab !== fallbackTab && tab !== "overview") {
            redirectedFromOverview.value = false;
        }
    });

    watch([entity, overviewVisible, overviewSettled], () => {
        if (!entity.value || !overviewSettled.value) {
            return;
        }

        if (!overviewVisible.value && currentTab.value === "overview") {
            redirectedFromOverview.value = true;
            currentTab.value = fallbackTab;
            return;
        }

        if (overviewVisible.value && redirectedFromOverview.value && currentTab.value === fallbackTab) {
            redirectedFromOverview.value = false;
            currentTab.value = "overview";
        }
    });

    return { showOverview, showOverviewTab, onOverviewContent };
}
