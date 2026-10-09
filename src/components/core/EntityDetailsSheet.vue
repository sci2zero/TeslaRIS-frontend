<template>
    <v-bottom-sheet
        :model-value="modelValue"
        :aria-labelledby="titleId"
        inset
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <v-card class="entity-details-sheet" rounded="t-xl">
            <div class="entity-details-sheet__handle" aria-hidden="true">
                <span />
            </div>
            <header class="entity-details-sheet__header">
                <div class="entity-details-sheet__heading">
                    <div v-if="$slots.icon" class="entity-details-sheet__icon">
                        <slot name="icon" />
                    </div>
                    <h2 :id="titleId" class="entity-details-sheet__title">
                        <localized-link v-if="to" :to="to">
                            <slot name="title">
                                {{ title }}
                            </slot>
                        </localized-link>
                        <span v-else>
                            <slot name="title">{{ title }}</slot>
                        </span>
                    </h2>
                </div>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    class="entity-details-sheet__close"
                    :aria-label="$t('closeLabel')"
                    :title="$t('closeLabel')"
                    @click="$emit('update:modelValue', false)"
                />
            </header>
            <div class="entity-details-sheet__body">
                <slot />
            </div>
            <footer v-if="to" class="entity-details-sheet__footer">
                <localized-link :to="to" class="entity-details-sheet__page-link">
                    {{ openPageLabel || $t('openLandingPageLabel') }}
                    <v-icon icon="mdi-arrow-right" size="18" aria-hidden="true" />
                </localized-link>
            </footer>
        </v-card>
    </v-bottom-sheet>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
defineProps<{ modelValue: boolean; title: string; to?: string; openPageLabel?: string }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();
const titleId = `entity-details-title-${getCurrentInstance()?.uid}`;
</script>

<style scoped>
.v-card.entity-details-sheet {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    max-height: 90dvh;
    overflow: hidden;
}
.entity-details-sheet__handle {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    padding: 10px 0 4px;
}
.entity-details-sheet__handle span {
    width: 40px;
    height: 4px;
    background: #cbd5e1;
    border-radius: 4px;
}
.entity-details-sheet__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 12px;
    flex-shrink: 0;
    padding: 12px 16px 16px;
    border-bottom: 1px solid #e2e8f0;
}
.entity-details-sheet__heading {
    display: flex;
    align-items: start;
    gap: 12px;
    min-width: 0;
    max-height: 28vh;
    max-height: 28dvh;
    overflow-y: auto;
}
.entity-details-sheet__icon,
.entity-details-sheet__close {
    flex-shrink: 0;
}
.entity-details-sheet__title {
    min-width: 0;
    margin: 0;
    padding-top: 4px;
    color: #1e293b;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
    white-space: normal;
    overflow-wrap: anywhere;
}
.entity-details-sheet__body {
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 20px 16px;
}
.entity-details-sheet__body :deep(.entity-details-grid) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
}
.entity-details-sheet__body :deep(.entity-details-full-width) {
    grid-column: 1 / -1;
}
.entity-details-sheet__footer {
    flex-shrink: 0;
    padding: 12px 16px max(16px, env(safe-area-inset-bottom));
    border-top: 1px solid #e2e8f0;
}
.entity-details-sheet .entity-details-sheet__page-link {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 10px;
    background: #1e293b;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
}
.entity-details-sheet__page-link:hover {
    background: #334155;
}
@media (min-width: 600px) {
    .entity-details-sheet__header { padding: 12px 24px 16px; }
    .entity-details-sheet__body { padding: 24px; }
    .entity-details-sheet__footer { padding-inline: 24px; }
    .entity-details-sheet__body :deep(.entity-details-grid) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
