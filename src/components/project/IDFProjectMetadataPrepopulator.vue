<template>
    <v-row>
        <v-col cols="11">
            <v-text-field
                ref="doiInputRef"
                v-model="doi"
                label="DOI"
                placeholder="DOI"
                :rules="doiValidationRules"
            />
            <p v-if="errorMessage" class="text-red ml-1">
                {{ errorMessage }}
            </p>
        </v-col>
        <v-col v-if="isLoading" cols="1">
            <v-progress-circular
                color="primary"
                indeterminate
                class="mt-3"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { VTextField } from 'vuetify/lib/components/index.mjs';
import { useValidationUtils } from '@/utils/ValidationUtils';
import ProjectMetadataPrepopulationService from '@/services/project/ProjectMetadataPrepopulationService';
import type { PrepopulatedProjectMetadata } from '@/models/ProjectModel';

const props = withDefaults(defineProps<{
    autoFocus?: boolean;
}>(), {
    autoFocus: true
});

const emit = defineEmits<{
    (e: 'metadataFetched', metadata: PrepopulatedProjectMetadata): void;
    (e: 'update:doi', doi: string): void;
}>();

const i18n = useI18n();

const doi = ref('');
const doiInputRef = ref<InstanceType<typeof VTextField> | null>(null);

const errorMessage = ref('');
const isLoading = ref(false);

const { doiValidationRules } = useValidationUtils();

onMounted(() => {
    nextTick(() => {
        if (doiInputRef.value && props.autoFocus) {
            doiInputRef.value.focus();
        }
    });
});

watch(doi, async () => {
    if (doi.value.startsWith('https://doi.org/')) {
        doi.value = doi.value.replace('https://doi.org/', '');
        return;
    }

    errorMessage.value = '';
    emit('update:doi', doi.value);

    if (!doi.value || doiValidationRules[0](doi.value) !== true) {
        return;
    }

    isLoading.value = true;

    try {
        const response = await ProjectMetadataPrepopulationService.fetchProjectDataForDoi(doi.value);
        isLoading.value = false;

        if (!response.data.doi) {
            errorMessage.value = i18n.t('unableToFetchMetadataMessage');
            return;
        }

        emit('metadataFetched', response.data);
    } catch {
        isLoading.value = false;
        errorMessage.value = i18n.t('unableToFetchMetadataMessage');
    }
});
</script>
