<template>
    <entity-details-sheet
        v-if="item"
        :model-value="modelValue"
        :title="$i18n.locale.startsWith('sr') ? item.nameSr : item.nameOther"
        :to="'project/' + item.databaseId"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <template #icon>
            <span class="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <v-icon icon="mdi-folder-outline" />
            </span>
        </template>
        <div class="entity-details-grid">
            <entity-detail-field :label="$t('coordinatorLabel')" class="entity-details-full-width">
                <localized-link v-if="item.coordinatorId" :to="'organisation-units/' + item.coordinatorId">
                    {{ coordinatorName }}
                </localized-link>
                <span v-else>{{ displayTextOrPlaceholder(coordinatorName) }}</span>
            </entity-detail-field>
            <entity-detail-field :label="$t('statusLabel')" class="entity-details-full-width">
                <v-chip v-if="item.status" size="small" :color="getProjectStatusColor(item.status)" variant="flat">
                    {{ getProjectStatusTitleFromValueAutoLocale(item.status) }}
                </v-chip>
                <span v-else>{{ displayTextOrPlaceholder('') }}</span>
            </entity-detail-field>
            <entity-detail-field :label="$t('dateFromLabel')">
                {{ displayTextOrPlaceholder(localiseDate(item.dateFrom)) }}
            </entity-detail-field>
            <entity-detail-field :label="$t('dateToLabel')">
                {{ displayTextOrPlaceholder(localiseDate(item.dateTo)) }}
            </entity-detail-field>
        </div>
    </entity-details-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ProjectIndex } from '@/models/ProjectModel';
import EntityDetailsSheet from '../core/EntityDetailsSheet.vue';
import EntityDetailField from '../core/EntityDetailField.vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { localiseDate } from '@/utils/DateUtil';
import { getProjectStatusColor, getProjectStatusTitleFromValueAutoLocale } from '@/i18n/projectStatus';
const props = defineProps<{ modelValue: boolean; item: ProjectIndex | null }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();
const { locale } = useI18n();
const coordinatorName = computed(() => locale.value.startsWith('sr') ? props.item?.coordinatorNameSr || '' : props.item?.coordinatorNameOther || '');
</script>
