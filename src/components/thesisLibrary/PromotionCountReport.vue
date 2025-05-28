<template>
    <v-card>  
        <v-data-table
            v-if="report.length > 0"
            :headers="headers"
            :items="report"
            class="elevation-1"
            :items-per-page="100">
            <template #[`item.index`]="{ index }">
                {{ index + 1 }}
            </template>
  
            <template #[`item.institutionName`]="{ item }">
                {{ returnCurrentLocaleContent(item.institutionName) }}
            </template>
  
            <template #[`body.append`]>
                <tr>
                    <td class="text-right font-weight-bold" colspan="2">
                        {{ $t("totalLabel") }}
                    </td>
                    <td class="font-weight-bold">
                        {{ totalPromoted }}
                    </td>
                    <td class="font-weight-bold">
                        {{ totalOldSystem }}
                    </td>
                </tr>
            </template>

            <template #bottom>
                <td class="text-right font-weight-bold text-subtitle-1">
                    {{ $t("totalPromotedLabel") }}: {{ totalPromoted + totalOldSystem }}
                </td>
            </template>
        </v-data-table>
        <v-card-text v-else>
            <h1>{{ $t("noDataInTableMessage") }}</h1>
        </v-card-text>
    </v-card>
</template>
  
<script lang="ts">
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { type InstitutionPromotionCountsReport } from '@/models/ThesisLibraryModel';
import { defineComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n';


export default defineComponent({
name: "PromotionCountReport",
props: {
    report: {
        type: Array<InstitutionPromotionCountsReport>,
        required: true
    }
},
setup(props) {
    const i18n = useI18n();

    const headers = computed(() => [
        { title: "#", key: "index", sortable: false },
        { title: i18n.t("organisationUnitLabel"), key: "institutionName" },
        { title: i18n.t("promotedDissertationsLabel"), key: "counts.a" },
        { title: i18n.t("promotedMagistersLabel"), key: 'counts.b' }
    ]);

    const totalPromoted = computed(() =>
        props.report.reduce((sum, item) => sum + (item.counts?.a || 0), 0)
    )

    const totalOldSystem = computed(() =>
        props.report.reduce((sum, item) => sum + (item.counts?.b || 0), 0)
    )

    return {
        headers,
        totalPromoted, totalOldSystem,
        returnCurrentLocaleContent
    }
}
})
</script>
  
  <style scoped>
    .v-data-table tfoot td {
            background-color: #f5f5f5;
    }
  </style>
  