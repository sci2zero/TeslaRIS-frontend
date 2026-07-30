<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <generic-crud-modal
                        :form-component="DescriptionOrBiographyUpdateForm"
                        :form-props="{ presetDescriptionOrBiography: objectives ? objectives : [], placeholderLabel: $t('objectivesLabel') }"
                        entity-name="Objectives"
                        is-update
                        is-section-update
                        :read-only="!canEdit"
                        wide
                        @update="emitToParent"
                    />

                    <div><b>{{ $t("objectivesLabel") }}</b></div>
                    <strong v-if="!objectives || objectives.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    <rich-text-editor v-model="objectivesDisplay" :editable="false" />
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type PropType } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { MultilingualContent } from '@/models/Common';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import RichTextEditor from '@/components/core/RichTextEditor.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    canEdit: {
        type: Boolean,
        default: false
    },
    objectives: {
        type: Object as PropType<MultilingualContent[] | undefined>,
        required: true
    }
});

const emit = defineEmits(["update"]);

const objectivesDisplay = ref("");

const i18n = useI18n();

const emitToParent = (objectives: MultilingualContent[]) => {
    emit("update", objectives);
};

const displayObjectives = () => {
    if (!props.objectives) {
        return;
    }

    objectivesDisplay.value = returnCurrentLocaleContent(props.objectives) as string;
};

onMounted(() => {
    displayObjectives();
});

watch([() => props.objectives, i18n.locale], () => {
    displayObjectives();
});
</script>

<style scoped>
    .edit-pen-container {
        position:relative;
    }

    .edit-pen-container .edit-pen {
        top: 0px;
        right: 0px;
        position: absolute;
        z-index: 10;
        opacity: 0;
    }

    .edit-pen-container:hover .edit-pen {
        opacity: 0.3;
    }

    .edit-pen-container .edit-pen:hover {
        opacity: 1;
    }

</style>
