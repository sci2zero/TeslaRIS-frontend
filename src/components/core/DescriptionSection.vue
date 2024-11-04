<template>
    <v-row v-if="canEdit || (description && description.length > 0)">
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <description-or-biography-update-modal :preset-description-or-biography="description ? description : []" :is-biography="isBiography" :read-only="!canEdit" @update="emitToParent"></description-or-biography-update-modal>

                    <div><b>{{ isBiography ? $t("biographyLabel") : $t("abstractLabel") }}</b></div>
                    <strong v-if="!description || description.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    <p>{{ returnCurrentLocaleContent(description) }}</p>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateModal from './update/DescriptionOrBiographyUpdateModal.vue';


export default defineComponent({
    name: "DescriptionSection",
    components: { DescriptionOrBiographyUpdateModal },
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
    setup(_, { emit }) {
        
        const emitToParent = (description: MultilingualContent[]) => {
            emit("update", description)
        };

        return { emitToParent, returnCurrentLocaleContent };
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
