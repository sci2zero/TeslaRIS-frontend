<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent class="wide">
            <template #activator="scope">
                <v-btn
                    :disabled="disabled"
                    density="compact"
                    class="bottom-spacer"
                    v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ $t("exportTableLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("exportTableLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col cols="12">
                                    <v-select 
                                        v-model="selectedFields" 
                                        :items="fields"
                                        item-value="value"
                                        :label="$t('exportColumnsLabel')" 
                                        dense
                                        multiple
                                    />
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-select
                                        v-model="selectedLang"
                                        :items="langItems"
                                        :label="$t('languageLabel') + '*'"
                                        :rules="requiredSelectionRules"
                                        return-object>
                                    </v-select>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-select
                                        v-model="selectedExportFileFormat"
                                        :items="exportFileFormats"
                                        :label="$t('exportFileFormatLabel') + '*'"
                                        :rules="requiredSelectionRules"
                                        return-object>
                                    </v-select>
                                </v-col>
                            </v-row>
                            <v-row v-if="potentialMaxAmountRequested">
                                <v-col cols="12" sm="6">
                                    <v-checkbox
                                        v-model="exportAll"
                                        :label="$t('exportAllLabel')"
                                    ></v-checkbox>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="exportPageOffset"
                                        type="number"
                                        min="1"
                                        :max="Math.ceil(totalResults / maxExportsPerPage)"
                                        :disabled="!exportAll"
                                        :label="$t('pageLabel', [maxExportsPerPage]) + '*'"
                                        :placeholder="$t('pageLabel', [maxExportsPerPage]) + '*'"
                                        :rules="requiredNumericGreaterThanZeroFieldRules"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-container v-if="exportEntity === ExportEntity.DOCUMENT">
                                <h4>{{ $t("citationFormatsLabel") }}</h4>
                                <v-row>
                                    <v-col cols="3" sm="2">
                                        <v-checkbox
                                            v-model="apa"
                                            label="APA"
                                        ></v-checkbox>
                                    </v-col>
                                    <v-col cols="3" sm="2">
                                        <v-checkbox
                                            v-model="mla"
                                            label="MLA"
                                        ></v-checkbox>
                                    </v-col>
                                    <v-col cols="3" sm="2">
                                        <v-checkbox
                                            v-model="chicago"
                                            label="Chicago"
                                        ></v-checkbox>
                                    </v-col>
                                    <v-col cols="3" sm="2">
                                        <v-checkbox
                                            v-model="harvard"
                                            label="Harvard"
                                        ></v-checkbox>
                                    </v-col>
                                    <v-col cols="3" sm="2">
                                        <v-checkbox
                                            v-model="vancouver"
                                            label="Vancouver"
                                        ></v-checkbox>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="performExport">
                        {{ $t("exportLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType, ref, watch } from "vue";
import { type CSVExportRequest, type DocumentCSVExportRequest, ExportEntity, ExportFileFormat, type SearchFieldsResponse } from "@/models/Common";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { useI18n } from "vue-i18n";
import { getLangItems } from "@/i18n/languages";
import { useValidationUtils } from "@/utils/ValidationUtils";
import TableExportService from "@/services/TableExportService";
import PersonService from "@/services/PersonService";
import OrganisationUnitService from "@/services/OrganisationUnitService";


export default defineComponent({
    name: "TableExportModal",
    props: {
        exportIds: {
            type: Array<number>,
            required: true
        },
        potentialMaxAmountRequested: {
            type: Boolean,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        exportEntity: {
            type: Object as PropType<ExportEntity>,
            required: true
        },
        totalResults: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const dialog = ref(false);
        const isFormValid = ref(false);
        const maxExportsPerPage = ref(1);

        const fieldData = ref<SearchFieldsResponse[]>([]);
        const fields = ref<{ title: string; value: string; type: string }[]>([]);
        const selectedFields = ref<string[]>([]);
        const exportAll = ref(false);
        const exportPageOffset = ref(1);

        const langItems = getLangItems();
        const selectedLang = ref<{title: string, value: string}>({title: "Srpski", value: "sr"});
        const exportFileFormats = ref<ExportFileFormat[]>([ExportFileFormat.CSV, ExportFileFormat.XLS]);
        const selectedExportFileFormat = ref<ExportFileFormat>(ExportFileFormat.CSV);
        
        const apa = ref<boolean>(false);
        const mla = ref<boolean>(false);
        const chicago = ref<boolean>(false);
        const harvard = ref<boolean>(false);
        const vancouver = ref<boolean>(false);

        const i18n = useI18n();
        const { requiredSelectionRules, requiredNumericGreaterThanZeroFieldRules } = useValidationUtils();

        const serviceMap = {
            [ExportEntity.DOCUMENT]: DocumentPublicationService,
            [ExportEntity.PERSON]: PersonService,
            [ExportEntity.ORGANISATION_UNIT]: OrganisationUnitService
        };

        const fetchFields = async () => {
            const service = serviceMap[props.exportEntity];
            if (service) {
                service.getSearchFields().then(response => {
                    fieldData.value = response.data;
                    populateFieldData();
                });
            }
        };

        onMounted(() => {
            fetchFields();

            TableExportService.getMaxExportsPerPage()
            .then(response => {
                maxExportsPerPage.value = response.data > 0 ? response.data : 1;
            });
        });

        watch(i18n.locale, () => {
            populateFieldData();
        });

        const populateFieldData = () => {
            fields.value.splice(0);
            fieldData.value.forEach(searchField => {
                fields.value.push(
                    {
                        title: returnCurrentLocaleContent(searchField.b) as string,
                        value: searchField.a,
                        type: searchField.c
                    }
                );
            });
        };

        const performExport = () => {
            const exportRequest: CSVExportRequest = {
                columns: selectedFields.value,
                bulkExportOffset: exportPageOffset.value - 1,
                exportMaxPossibleAmount: exportAll.value,
                exportEntityIds: props.exportIds,
                exportFileType: selectedExportFileFormat.value,
                exportLanguage: selectedLang.value.value
            };

            switch(props.exportEntity) {
                case ExportEntity.PERSON:
                    TableExportService.exportPersonTable(exportRequest as DocumentCSVExportRequest);
                    break;
                case ExportEntity.ORGANISATION_UNIT:
                    TableExportService.exportOrganisationUnitTable(exportRequest as DocumentCSVExportRequest);
                    break;
                case ExportEntity.DOCUMENT:
                    (exportRequest as DocumentCSVExportRequest).apa = apa.value;
                    (exportRequest as DocumentCSVExportRequest).mla = mla.value;
                    (exportRequest as DocumentCSVExportRequest).harvard = harvard.value;
                    (exportRequest as DocumentCSVExportRequest).chicago = chicago.value;
                    (exportRequest as DocumentCSVExportRequest).vancouver = vancouver.value;

                    TableExportService.exportDocumentTable(exportRequest as DocumentCSVExportRequest);
                    break;
            }
        };

        return { 
            dialog, fields, selectedFields, isFormValid,
            ExportEntity, langItems, selectedLang,
            requiredSelectionRules, exportFileFormats,
            selectedExportFileFormat, exportAll,
            performExport, exportPageOffset,
            requiredNumericGreaterThanZeroFieldRules,
            apa, mla, chicago, harvard, vancouver,
            maxExportsPerPage
        };
    }
});
</script>

<style scoped>

.wide {
    width: 100%;
    max-width: 1500px;
}

</style>
