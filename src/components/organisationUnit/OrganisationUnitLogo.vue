<template>
    <div class="edit-pen-container">
        <div class="non-solid-bg" style="position: absolute; inset: 0; padding: 12px;">
            <generic-crud-modal
                :form-component="OrganisationUnitLogoForm"
                :form-props="
                    {
                        originalFileName: imageName,
                        orgUnitId: orgUnitId,
                        backgroundColorHex: backgroundColorHex
                    }"
                entity-name="InstitutionLogo"
                is-update
                is-section-update
                :read-only="!canEdit"
                @update="fetchImage"
            />
        </div>

        <v-img
            v-if="imageSrc"
            class="image-container"
            :src="imageSrc"
            alt="Image Preview"
            max-height="350"
            max-width="500"
        ></v-img>
        <v-icon v-else size="x-large" class="large-institution-icon">
            {{ accountIcon }}
        </v-icon>
    </div>
</template>
  
<script lang="ts">
import BaseService from '@/services/BaseService';
import { defineComponent, ref, type PropType, watch } from 'vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import OrganisationUnitLogoForm from './OrganisationUnitLogoForm.vue';


export default defineComponent({
    name: "OrganisationUnitLogo",
    components: { GenericCrudModal },
    props: {
        filename: {
            type: Object as PropType<string | undefined>,
            required: true
        },
        orgUnitId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        canEdit: {
            type: Boolean,
            required: true
        },
        backgroundColorHex: {
            type: String,
            default: ""
        }
    },
    setup(props) {
        const imageSrc = ref<string | null>(null);
        const imageName = ref<string | null>(null);

        const accountIcon = ref('mdi-city');

        watch(() => props.filename, async () => {
            if (props.filename) {
                await fetchImage();
            }
        });

        const fetchImage = async () => {
            if (props.orgUnitId) {
                [imageSrc.value, imageName.value] = await BaseService.fetchLogoForDisplay(props.orgUnitId, false);
            }
        };

        return {
            imageSrc, fetchImage, imageName,
            accountIcon, OrganisationUnitLogoForm
        };
    },
});
</script>
  
<style lang="css" scoped>
    #institution .large-institution-icon {
        font-size: 20em;
    }

    .image-container {
        border-radius: 0.25em;
    }
</style>