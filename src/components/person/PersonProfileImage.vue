<template>
    <div class="edit-pen-container">
        <generic-crud-modal
            :form-component="PersonProfileImageForm"
            :form-props="{ fileName: imageName, personId: personId }"
            entity-name="ProfilePicture"
            is-update
            is-section-update
            :read-only="!canEdit"
            @update="fetchImage"
        />

        <v-img
            v-if="imageSrc"
            class="image-container"
            :src="imageSrc"
            alt="Image Preview"
            max-width="500"
        ></v-img>
        <v-icon v-else size="x-large" class="large-researcher-icon">
            {{ accountIcon }}
        </v-icon>
    </div>
</template>
  
<script lang="ts">
import BaseService from '@/services/BaseService';
import { defineComponent, ref, type PropType, watch } from 'vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import PersonProfileImageForm from './update/PersonProfileImageForm.vue';


export default defineComponent({
    name: "PersonProfileImage",
    components: { GenericCrudModal },
    props: {
        filename: {
            type: Object as PropType<string | undefined>,
            required: true
        },
        personId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        canEdit: {
            type: Boolean,
            required: true
        }
    },
    setup(props) {
        const imageSrc = ref<string | null>(null);
        const imageName = ref<string | null>(null);

        const accountIcon = ref('mdi-account-circle');

        watch(() => props.filename, async () => {
            if (props.filename) {
                await fetchImage(props.filename);
            }
        });

        const fetchImage = async (filename: string) => {
            [imageSrc.value, imageName.value] = await BaseService.fetchImageForDisplay(filename);
        };

        return {
            imageSrc, fetchImage, imageName,
            accountIcon, PersonProfileImageForm
        };
    },
});
</script>
  
<style lang="css" scoped>
    #researcher .large-researcher-icon {
        font-size: 20em;
    }

    .image-container {
        border-radius: 0.25em;
        margin-top: 25px;
    }
</style>