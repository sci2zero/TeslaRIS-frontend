<template>
    <div class="size-full">
        <v-img
            v-if="imageSrc"
            class="image-container"
            :src="imageSrc"
            alt="Image Preview"
            max-width="500"
        ></v-img>

        <div v-else class="size-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 20 20"><path fill="currentColor" d="M12 19.2c-2.5 0-4.71-1.28-6-3.2c.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1a7.23 7.23 0 0 1-6 3.2M12 5a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-3A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10" /></svg>
        </div>
    </div>
</template>
  
<script lang="ts">
import BaseService from '@/services/BaseService';
import { defineComponent, ref, type PropType, watch } from 'vue';


export default defineComponent({
    name: "PersonProfileImage",
    props: {
        filename: {
            type: Object as PropType<string | undefined>,
            required: true
        },
        personId: {
            type: Object as PropType<number | undefined>,
            required: true
        }
    },
    setup(props) {
        const imageSrc = ref<string | null>(null);
        const imageName = ref<string | null>(null);

        watch(() => props.filename, async () => {
            if (props.filename) {
                await fetchImage();
            } else {
                imageSrc.value = null;
                imageName.value = null;
            }
        });

        const fetchImage = async () => {
            if (props.personId) {
                [imageSrc.value, imageName.value] = await BaseService.fetchImageForDisplay(props.personId, false);
            }
        };

        return {
            imageSrc, fetchImage, imageName
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
    }
</style>
