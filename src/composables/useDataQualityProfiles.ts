import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import DataQualityService from "@/services/revision/DataQualityService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import type { DataQualityProfileSummary } from "@/models/RevisionModel";


const profiles = ref<DataQualityProfileSummary[]>([]);
let pendingFetch: Promise<void> | null = null;

const loadProfiles = (): Promise<void> => {
    if (!pendingFetch) {
        pendingFetch = DataQualityService.listProfileNames()
            .then(response => {
                profiles.value = response.data;
            })
            .catch(() => {
                profiles.value = [];
            });
    }

    return pendingFetch;
};

/**
 * A profile is identified by its raw name everywhere, so selections stay keyed on `profileName`
 * and only the label is translated.
 */
export function useDataQualityProfiles() {
    const { locale } = useI18n();

    const fetchProfiles = () => {
        pendingFetch = null;
        return loadProfiles();
    };

    const profileLabels = computed<Record<string, string>>(() => {
        // Read so that every label recomputes on a language switch.
        const _activeLocale = locale.value;

        return Object.fromEntries(profiles.value.map(profile => [
            profile.profileName,
            returnCurrentLocaleContent(profile.name) ?? profile.profileName
        ]));
    });

    const profileLabel = (profileName: string | undefined | null): string =>
        profileName ? (profileLabels.value[profileName] ?? profileName) : "";

    const toProfileItems = (profileNames: (string | undefined)[]) =>
        [...new Set(profileNames.filter((profileName): profileName is string => !!profileName))]
            .map(profileName => ({ title: profileLabel(profileName), value: profileName }));

    const profileKeys = computed(() =>
        [...new Set(profiles.value.map(profile => profile.profileName))]);

    const profileItems = computed(() => toProfileItems(profileKeys.value));

    loadProfiles();

    return { profiles, fetchProfiles, profileKeys, profileItems, profileLabel, toProfileItems };
}
