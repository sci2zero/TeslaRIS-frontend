<template>
    <v-expansion-panels class="mt-3">
        <v-expansion-panel
            v-for="(indicator, index) in entityIndicatorsFIltered"
            :key="index" :title="titles[index]">
            <v-expansion-panel-text>
                <v-row class="mt-4 mb-1">
                    <p>{{ contents[index] }}</p>
                </v-row>
                <v-row class="align-left">
                    <div>
                        <generic-crud-modal
                            :form-component="DocumentIndicatorForm"
                            :form-props="{ presetDocumentIndicators: indicator, applicableTypes: indicator.indicatorResponse.applicableEntityTypes, entityId: entityId }"
                            entity-name=""
                            is-update
                            :read-only="!canEdit"
                        />
                    </div>
                    <div class="ml-5">
                        <v-btn density="compact">
                            {{ $t("deleteLabel") }}
                        </v-btn>
                    </div>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import type { EntityIndicatorResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useI18n } from 'vue-i18n';
import { localiseDate } from '@/i18n/dateLocalisation';
import DocumentIndicatorForm from './DocumentIndicatorForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { ApplicableEntityType } from '@/models/Common';


export default defineComponent({
    name: "ViewIndicatorsComponent",
    components: { GenericCrudModal },
    props: {
        entityIndicators: {
            type: Array<EntityIndicatorResponse>,
            required: true
        },
        excludePrefixes: {
            type: Array<string>,
            required: true
        },
        canEdit: {
            type: Boolean,
            required: false
        },
        entityId: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const titles = ref<string[]>([]);
        const contents = ref<string[]>([]);
        const entityIndicatorsFIltered = ref<EntityIndicatorResponse[]>([]);

        const i18n = useI18n();
        
        onMounted(() => {
            setIndicators();
        });

        watch(() => props.entityIndicators, () => {
            setIndicators();
        });

        watch(i18n.locale, () => {
            setIndicators();
        });

        const setIndicators = () => {
            titles.value.splice(0);
            contents.value.splice(0);
            entityIndicatorsFIltered.value.splice(0);

            if (props.entityIndicators) {
                props.entityIndicators.forEach(entityIndicator => {
                    for (const codePrefix of props.excludePrefixes) {
                        if (entityIndicator.indicatorResponse.code.startsWith(codePrefix)) {
                            return;   
                        }
                    }

                    entityIndicatorsFIltered.value.push(entityIndicator);
                    buildDisplayData(entityIndicator);
                });
            }
        };

        const buildDisplayData = (entityIndicator: EntityIndicatorResponse) => {
            let displayValue = "";
            if (entityIndicator.textualValue) {
                displayValue += entityIndicator.textualValue;
            } else if (entityIndicator.numericValue !== null && entityIndicator.numericValue !== undefined) {
                displayValue += entityIndicator.numericValue;
            } else {
                if (entityIndicator.booleanValue) {
                    displayValue += i18n.t("trueLabel");
                } else {
                    displayValue += i18n.t("falseLabel");
                }
            }

            titles.value.push(`${returnCurrentLocaleContent(entityIndicator.indicatorResponse.title)}: ${displayValue}`)
            contents.value.push(`${returnCurrentLocaleContent(entityIndicator.indicatorResponse.title)}: ${displayValue} (${localiseDate(entityIndicator.fromDate)} - ${localiseDate(entityIndicator.toDate)}) - ${returnCurrentLocaleContent(entityIndicator.indicatorResponse.description)}`);
        };

        return {
            titles, contents,
            DocumentIndicatorForm,
            entityIndicatorsFIltered,
            ApplicableEntityType
        };
    }
});
</script>
