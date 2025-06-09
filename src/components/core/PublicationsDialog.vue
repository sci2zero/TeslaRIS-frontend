<template>
    <v-btn size="small" color="primary" @click="dialog = true">
        {{ buttonText }}
    </v-btn>

    <v-dialog
        v-model="dialog"
        width="auto"
    >
        <v-card
            max-width="1800"
            :prepend-icon="icon"
            :title="title"
        >
            <v-card-text>
                <pre class="publications-as-text">{{ text }}</pre>
            </v-card-text>
            <template #actions>
                <v-btn
                    class="ms-auto"
                    text="Ok"
                    @click="dialog = false"
                ></v-btn>
            </template>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "TextDialog",
    props: {
        buttonText: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        idForFetching: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const dialog = ref(false);
        const text = ref("");
        const i18n = useI18n();

        onMounted(() => {
            getContent(props.idForFetching);
        });

        const getContent = (researcherId: number) => {
            DocumentPublicationService.findResearcherPublications(researcherId, "page=0&size=10").then(response => {
                if (response.data.totalElements === 0) {
                    text.value = i18n.t("noPublicationsForResearcherMessage");
                    return;
                }
                
                response.data.content.forEach(publication => {
                    if (i18n.locale.value === "sr") {
                        text.value += publication.titleSr + "\n";
                    } else {
                        text.value += publication.titleOther + "\n";
                    }
                });
            });
        };

        return {
          dialog, getContent, text
        }
    }
});
</script>

<style scoped>

.publications-as-text {
    max-height: 300px;
    overflow: auto;
    white-space: pre-wrap;
}

</style>
