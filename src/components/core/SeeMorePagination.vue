<template>
    <div :aria-busy="loading">
        <slot />
        <div v-if="hasMore" class="see-more-pagination">
            <v-btn
                color="primary" variant="tonal" append-icon="mdi-chevron-down"
                :loading="loading" :disabled="disabled || loading" @click="loadNextPage">
                {{ label || $t('viewMoreLabel') }}
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Page numbers are zero-based, matching the API's Page response.
const props = withDefaults(defineProps<{
    page: number;
    totalPages: number;
    loading?: boolean;
    disabled?: boolean;
    label?: string;
}>(), { loading: false, disabled: false, label: '' });

const emit = defineEmits<{ (event: 'load-page', page: number): void }>();
const hasMore = computed(() => props.page + 1 < props.totalPages);

function loadNextPage() {
    if (hasMore.value && !props.loading && !props.disabled) {
        emit('load-page', props.page + 1);
    }
}
</script>

<style scoped>
.see-more-pagination { display: flex; justify-content: center; padding: 16px 24px; }
.see-more-pagination :deep(.v-btn) { text-transform: none; letter-spacing: 0; }
</style>
