<template>
    <div class="mt-10">
        <h4>{{ $t("shareLabel") }}:</h4>
        <div class="d-flex flex-row ga-2">
            <v-btn icon color="blue-darken-4" @click="shareOnFacebook">
                <v-icon>mdi-facebook</v-icon>
            </v-btn>

            <v-btn icon color="light-blue-darken-3" @click="shareOnTwitter">
                <v-icon>mdi-twitter</v-icon>
            </v-btn>

            <v-btn icon color="indigo-darken-1" @click="shareOnLinkedIn">
                <v-icon>mdi-linkedin</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script lang="ts">
import { PublicationType } from '@/models/PublicationModel';
import { computed, defineComponent, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "ShareButtons",
    props: {
        documentId: {
            type: Number,
            required: true
        },
        documentType: {
            type: Object as PropType<PublicationType>,
            required: true
        }
    },
    emits: ["update:modelValue"],
    setup(props) {
        const i18n = useI18n();
        const baseServerUrl = import.meta.env.VITE_BASE_URL as string;
        const url = computed(() => `${baseServerUrl}share/document/${props.documentType}/${props.documentId}?lang=${i18n.locale.value}`);

        const openPopup = (link: string) => {
            window.open(link, '_blank', 'width=600,height=600');
        };

        const shareOnFacebook = () => {
            const link = `https://www.facebook.com/sharer/sharer.php?u=${url.value}`;
            openPopup(link);
        };

        const shareOnTwitter = () => {
            const link = `https://twitter.com/intent/tweet?url=${url.value}`;
            openPopup(link);
        };

        const shareOnLinkedIn = () => {
            const link = `https://www.linkedin.com/shareArticle?mini=true&url=${url.value}`;
            openPopup(link);
        };

        return { 
            shareOnFacebook,
            shareOnTwitter,
            shareOnLinkedIn
        };
    },
});
</script>
