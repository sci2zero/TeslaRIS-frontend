<template>
    <v-btn
        v-show="remarksPresent"
        size="small"
        color="primary"
        @click="dialog = true">
        {{ $t("dataQualityReportLabel") }}
    </v-btn>

    <v-dialog
        v-model="dialog"
        max-width="1000">
        <v-card
            prepend-icon="mdi-alert"
            :title="$t('dataQualityReportLabel')">
            <v-card-text>
                <v-tabs
                    v-model="selectedTab"
                    color="primary">
                    <v-tab
                        v-for="(profile, index) in reports"
                        :key="profile.profileName"
                        :value="index">
                        {{ profile.profileName }}
                    </v-tab>
                </v-tabs>

                <v-window
                    v-model="selectedTab"
                    class="mt-5">
                    <v-window-item
                        v-for="(profile, index) in reports"
                        :key="profile.profileName"
                        :value="index">
                        <template
                            v-for="pair in profile.report"
                            :key="pair.a">
                            <v-alert
                                class="mb-3"
                                variant="tonal"
                                :icon="severityIcons[pair.a]"
                                :type="severityColors[pair.a] as ('success' | 'info' | 'warning' | 'error') ?? 'info'">
                                {{ returnCurrentLocaleContent(pair.b) }}
                            </v-alert>
                        </template>
                    </v-window-item>
                </v-window>
            </v-card-text>

            <template #actions>
                <v-btn
                    class="ms-auto"
                    :text="$t('closeLabel')"
                    @click="dialog = false"
                />
            </template>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import type { PropType } from "vue";
import RevisionService from "@/services/revision/RevisionService";
import { IssueSeverity, type QualityReportResponse } from "@/models/RevisionModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";


export default defineComponent({
    name: "QualityReportDialog",
    props: {
        entityType: {
            type: String,
            required: true
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        }
    },
    setup(props) {
        const dialog = ref(false);
        const remarksPresent = ref(false);

        const reports = ref<QualityReportResponse[]>([]);
        const selectedTab = ref(0);

        const severityIcons = {
            [IssueSeverity.ERROR]: "mdi-alert-circle",
            [IssueSeverity.WARNING]: "mdi-alert",
            [IssueSeverity.INFO]: "mdi-information"
        };

        const severityColors = {
            [IssueSeverity.ERROR]: "error",
            [IssueSeverity.WARNING]: "warning",
            [IssueSeverity.INFO]: "info"
        };

        const getContent = () => {
            if (!props.entityId) {
                reports.value = [];
                remarksPresent.value = false;
                return;
            }

            RevisionService.getQualityReportForEntity(
                props.entityType,
                props.entityId
            ).then(response => {
                reports.value = response.data;
                remarksPresent.value = reports.value.length > 0;
                selectedTab.value = 0;
            });
        };

        onMounted(() => getContent());

        watch(
            () => [props.entityId, props.entityType],
            getContent
        );

        return {
            dialog, remarksPresent,
            reports, selectedTab,
            severityIcons, severityColors,
            returnCurrentLocaleContent
        };
    }
});
</script>
