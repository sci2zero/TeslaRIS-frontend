<template>
    <v-row v-if="canEdit || (description && description.length > 0)">
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <generic-crud-modal
                        :form-component="DescriptionOrBiographyUpdateForm"
                        :form-props="{ presetDescriptionOrBiography: description ? description : [] }"
                        :entity-name="isBiography ? 'Biography' : 'Abstract'"
                        is-update
                        is-section-update
                        :read-only="!canEdit"
                        wide
                        @update="emitToParent"
                    />

                    <div><b>{{ isBiography ? $t("biographyLabel") : $t("abstractLabel") }}</b></div>
                    <strong v-if="!description || description.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    <rich-text-editor v-model="descriptionDisplay" :editable="false"></rich-text-editor>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, ref, watch, type PropType } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { MultilingualContent } from '@/models/Common';
import GenericCrudModal from './GenericCrudModal.vue';
import DescriptionOrBiographyUpdateForm from './update/DescriptionOrBiographyUpdateForm.vue';
import RichTextEditor from './RichTextEditor.vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "DescriptionSection",
    components: { GenericCrudModal, RichTextEditor },
    props: {
        canEdit: {
            type: Boolean,
            default: false
        },
        isBiography: {
            type: Boolean,
            default: false
        },
        description: {
            type: Object as PropType<MultilingualContent[] | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const descriptionDisplay = ref("");

        const i18n = useI18n();

        const emitToParent = (description: MultilingualContent[]) => {
            emit("update", description);
        };

        watch([() => props.description, i18n.locale], () => {
            descriptionDisplay.value = returnCurrentLocaleContent(props.description) as string;
        });

        return { 
            emitToParent, returnCurrentLocaleContent,
            DescriptionOrBiographyUpdateForm,
            descriptionDisplay
        };
    },
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
