<template>
    <v-btn density="compact" class="mt-5" color="blue darken-1" @click="unbindResearcherFromDocument">
        {{ $t("removeFromPublicationLabel") }}
    </v-btn>

    <persistent-question-dialog ref="dialogRef" :title="$t('areYouSureLabel')" :message="$t('researcherUnbindWarning')" @continue="performUnbinding"></persistent-question-dialog>
</template>

<script lang="ts">
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { defineComponent, ref } from 'vue';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';


export default defineComponent({
    name: "PublicationUnbindButton",
    components: { PersistentQuestionDialog },
    props: {
        documentId: {
            type: Number,
            required: true
        }
    },
    emits: ["unbind"],
    setup(props, { emit }) {
        const dialogRef = ref<typeof PersistentQuestionDialog>();

        const performUnbinding = () => {
            DocumentPublicationService.unbindPersonFromPublication(props.documentId).then(() => {
                emit("unbind");
            });
        };

        const unbindResearcherFromDocument = () => {
            dialogRef.value?.toggle();
        };

        return { 
            dialogRef,
            unbindResearcherFromDocument,
            performUnbinding
        };
    },
});
</script>
