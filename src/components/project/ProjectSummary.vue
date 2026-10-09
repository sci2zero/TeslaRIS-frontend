<template>
    <div class="space-y-2 text-sm text-slate-600">
        <p class="break-words">
            <span class="text-xs text-slate-500">{{ $t('coordinatorLabel') }}: </span>
            <localized-link v-if="item.coordinatorId" :to="'organisation-units/' + item.coordinatorId">
                {{ coordinatorName }}
            </localized-link>
            <span v-else>{{ displayTextOrPlaceholder(coordinatorName) }}</span>
        </p>
        <v-chip v-if="item.status" size="small" :color="getProjectStatusColor(item.status)" variant="flat">
            {{ getProjectStatusTitleFromValueAutoLocale(item.status) }}
        </v-chip>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{{ $t('dateFromLabel') }}: {{ displayTextOrPlaceholder(localiseDate(item.dateFrom)) }}</span>
            <span>{{ $t('dateToLabel') }}: {{ displayTextOrPlaceholder(localiseDate(item.dateTo)) }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ProjectIndex } from '@/models/ProjectModel';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { localiseDate } from '@/utils/DateUtil';
import { getProjectStatusColor, getProjectStatusTitleFromValueAutoLocale } from '@/i18n/projectStatus';
const props = defineProps<{ item: ProjectIndex }>();
const { locale } = useI18n();
const coordinatorName = computed(() => locale.value.startsWith('sr') ? props.item.coordinatorNameSr : props.item.coordinatorNameOther);
</script>
