<template>
    <v-row>
        <v-col cols="12">
            <publication-table-component
                ref="tableRef"
                :publications="personPublications"
                :total-publications="totalPersonPublications"
                shows-research-outputs
                allow-selection
                @switch-page="switchPage">
            </publication-table-component>
        </v-col>
    </v-row>

    <div class="notificationContainer">
        <v-slide-y-transition group>
            <v-alert
                v-for="notification in notifications"
                :key="notification[0]"
                theme="dark"
            >
                {{ notification[1] }}
            </v-alert>
        </v-slide-y-transition>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { ref } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import ThesisResearchOutputService from '@/services/ThesisResearchOutputService';
import { getErrorMessageForErrorKey } from '@/i18n';
import PublicationTableComponent from './PublicationTableComponent.vue';
import { type DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "ThesisResearchOutputForm",
    components: { PublicationTableComponent },
    props: {
        thesisId: {
            type: Number,
            required: true
        },
        researcherId: {
            type: Number,
            required: true
        }
    },
    emits: ["update", "updatePersist"],
    setup(props, { emit }) {
        const isFormValid = computed(() => tableRef.value!.selectedPublications.length > 0);

        const i18n = useI18n();
        const notifications = ref<Map<string, string>>(new Map());

        const tableRef = ref<typeof PublicationTableComponent>();
        const personPublications = ref<DocumentPublicationIndex[]>([]);
        const totalPersonPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const { requiredFieldRules } = useValidationUtils();

        watch(() => props.researcherId, () => {
            fetchPersonPublications();
        })

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPersonPublications();
        };

        const fetchPersonPublications = () => {
            if (!props.researcherId) {
                return;
            }

            DocumentPublicationService.findResearchOutputIds(props.thesisId).then(researchOutputResponse => {
                let ignore = "";
                researchOutputResponse.data.forEach(researchOutputId => {
                    ignore += `&ignore=${researchOutputId}`;
                });

                DocumentPublicationService.findResearcherPublications(
                    props.researcherId as number,
                    `page=${page.value}&size=${size.value}&sort=${sort.value}${ignore}`
                ).then((publicationResponse) => {
                    personPublications.value = publicationResponse.data.content;
                    totalPersonPublications.value = publicationResponse.data.totalElements
                });
            });
        };

        const submit = () => {
            const selectedResearchOutput = tableRef.value!.selectedPublications;
            const isInSerbian = i18n.locale.value === "sr";

            let noneFailed = true;

            Promise.all(selectedResearchOutput.map((publication: DocumentPublicationIndex) => {
                return ThesisResearchOutputService.addThesisResearchOutput(
                    props.thesisId, publication.databaseId as number
                ).then(() => {
                    addNotification(i18n.t("researchOutputAddedNotification", { name: isInSerbian ? publication.titleSr : publication.titleOther }));
                }).catch((error) => {
                    noneFailed = false;
                    addNotification(i18n.t("researchOutputNotAddedNotification", { name: isInSerbian ? publication.titleSr : publication.titleOther, error: getErrorMessageForErrorKey(error.response.data.message) }));
                });
            })).then(() => {
                if (noneFailed) {
                    emit("update");
                } else {
                    emit("updatePersist");
                }
            });   
        };

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 5000);
        };

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        };

        return {
            isFormValid, submit,
            requiredFieldRules,
            personPublications,
            totalPersonPublications,
            tableRef, switchPage,
            notifications
        };
    }
});
</script>
