<template>
    <generic-crud-modal
        class="mt-5 ml-5"
        :form-component="EntityIndicatorForm"
        :form-props="{ applicableTypes: applicableTypes, entityId: entityId, entityType: entityType }"
        entity-name="EntityIndicator"
        :read-only="!canEdit"
        @create="createIndicator"
    />
    <v-row v-if="indicators.length > 0">
        <v-col v-if="showStatistics && (!viewIndicatorsEmpty || !downloadIndicatorsEmpty)">
            <div
                v-show="(viewsRef && viewsRef.statisticsEntityIndicators.length > 0) || (downloadsRef && downloadsRef.statisticsEntityIndicators.length > 0)"
                class="statistics mt-3">
                <h2>{{ $t("statisticsIndicatorsLabel") }}</h2>
                <statistics-view
                    ref="viewsRef"
                    :entity-indicators="indicators"
                    :statistics-type="StatisticsType.VIEW"
                    @no-indicators-present="viewIndicatorsEmpty = true"
                />
                <statistics-view
                    v-show="hasAttachedFiles"
                    ref="downloadsRef"
                    :entity-indicators="indicators"
                    :statistics-type="StatisticsType.DOWNLOAD"
                    @no-indicators-present="downloadIndicatorsEmpty = true"
                />
            </div>
        </v-col>
        <v-col>
            <div class="statistics">
                <indicators-view 
                    :entity-indicators="indicators" 
                    :exclude-prefixes="['view', 'download']" :can-edit="canEdit" 
                    :entity-id="entityId" 
                    :containing-entity-type="entityType"
                    @updated="refreshIndicators"
                />
            </div>
        </v-col>
    </v-row>
    <h3 v-else>
        {{ $t("noIndicatorsLabel") }}
    </h3>
</template>

<script lang="ts">
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import StatisticsView from '../statistics/StatisticsView.vue';
import IndicatorsView from './IndicatorsView.vue';
import { ApplicableEntityType } from '@/models/Common';
import EntityIndicatorForm from './EntityIndicatorForm.vue';
import { type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import { defineComponent, ref, type PropType } from 'vue';


export default defineComponent({
    name: "IndicatorsSection",
    components: { StatisticsView, IndicatorsView, GenericCrudModal },
    props: {
        indicators: {
            type: Array<EntityIndicatorResponse>,
            required: true
        },
        applicableTypes: {
            type: Array<ApplicableEntityType>,
            required: true
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        entityType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        showStatistics: {
            type: Boolean,
            default: false
        },
        hasAttachedFiles: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create", "updated"],
    setup(_, {emit}) {
        const viewsRef = ref<typeof StatisticsView>();
        const downloadsRef = ref<typeof StatisticsView>();

        const viewIndicatorsEmpty = ref(false);
        const downloadIndicatorsEmpty = ref(false);

        const createIndicator = (entityIndicator: any) => {
            emit("create", entityIndicator);
        };

        const refreshIndicators = () => {
            emit("updated");
        };

        return {
            EntityIndicatorForm, ApplicableEntityType,
            createIndicator, refreshIndicators,
            StatisticsType, viewsRef, downloadsRef,
            viewIndicatorsEmpty, downloadIndicatorsEmpty
        };
    }
});
</script>