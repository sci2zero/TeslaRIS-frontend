<template>
    <generic-crud-modal
        class="mt-5 ml-5"
        :form-component="EntityIndicatorForm"
        :form-props="{ applicableTypes: applicableTypes, entityId: entityId, entityType: entityType }"
        entity-name="EntityIndicator"
        :read-only="!canEdit"
        @create="createIndicator"
    />
    <v-row>
        <v-col v-if="showStatistics">
            <div class="statistics">
                <h2>{{ $t("statisticsIndicatorsLabel") }}</h2>
                <statistics-view :entity-indicators="indicators" :statistics-type="StatisticsType.VIEW"></statistics-view>
                <statistics-view :entity-indicators="indicators" :statistics-type="StatisticsType.DOWNLOAD"></statistics-view>
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
</template>

<script lang="ts">
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import StatisticsView from '../statistics/StatisticsView.vue';
import IndicatorsView from './IndicatorsView.vue';
import { ApplicableEntityType } from '@/models/Common';
import EntityIndicatorForm from './EntityIndicatorForm.vue';
import { type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import { defineComponent, type PropType } from 'vue';

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
        }
    },
    emits: ["create", "updated"],
    setup(_, {emit}) {
        const createIndicator = (entityIndicator: any) => {
            emit("create", entityIndicator);
        };

        const refreshIndicators = () => {
            emit("updated");
        };


        return {
            EntityIndicatorForm, ApplicableEntityType,
            createIndicator, refreshIndicators,
            StatisticsType
        };
    }
});
</script>