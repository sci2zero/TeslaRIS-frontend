<template>
    <entity-details-sheet
        v-if="item"
        :model-value="modelValue"
        :title="$i18n.locale.startsWith('sr') ? item.nameSr : item.nameOther"
        :to="'organisation-units/' + item.databaseId"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <template #icon>
            <organisation-unit-avatar :organisation-unit-id="item.databaseId" />
        </template>
        <div class="entity-details-grid">
            <entity-detail-field v-if="item.superOUId" :label="$t('superOULabel')" class="entity-details-full-width">
                <localized-link :to="'organisation-units/' + item.superOUId">
                    {{ $i18n.locale.startsWith('sr') ? item.superOUNameSr : item.superOUNameOther }}
                </localized-link>
            </entity-detail-field>
            <entity-detail-field :label="$t('researchAreasLabel')" class="entity-details-full-width">
                <p class="whitespace-pre-line">
                    {{ displayTextOrPlaceholder($i18n.locale.startsWith('sr') ? item.researchAreasSr : item.researchAreasOther) }}
                </p>
            </entity-detail-field>
            <entity-detail-field :label="$t('keywordsLabel')" class="entity-details-full-width">
                <div v-if="keywords.length" class="flex flex-wrap gap-1">
                    <localized-link
                        v-for="keyword in keywords" :key="keyword"
                        :to="`advanced-search?searchQuery=${encodeURIComponent(keyword)}&tab=organisationUnits`"
                        class="max-w-full rounded-md bg-slate-100 px-2 py-1 text-xs"
                    >
                        {{ keyword }}
                    </localized-link>
                </div>
                <span v-else>{{ displayTextOrPlaceholder('') }}</span>
            </entity-detail-field>
        </div>
    </entity-details-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OrganisationUnitIndex } from '@/models/OrganisationUnitModel';
import OrganisationUnitAvatar from "./OrganisationUnitAvatar.vue";
import EntityDetailsSheet from '../core/EntityDetailsSheet.vue';
import EntityDetailField from '../core/EntityDetailField.vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
const props = defineProps<{ modelValue: boolean; item: OrganisationUnitIndex | null }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();
const { locale } = useI18n();
const keywords = computed(() => {
    if (!props.item) return [];
    return ((locale.value.startsWith('sr') ? props.item.keywordsSr : props.item.keywordsOther) || '').split('\n').filter(Boolean);
});
</script>
