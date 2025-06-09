<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent class="narrow">
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("selectYourselfLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-list
                            :lines="false"
                            density="comfortable"
                        >
                            <v-list-item
                                v-for="(authorship, index) in contributions" :key="index"
                                :value="authorship.orderNumber"
                            >
                                <v-list-item-title
                                    class="text-h6"
                                    @click="selectYourself(authorship.orderNumber)">
                                    {{ authorship.personName?.firstname }} {{ authorship.personName?.lastname }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import type { JournalPublication, ProceedingsPublication, PersonDocumentContribution } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import PersonService from "@/services/PersonService";
import { type PropType, ref } from "vue";
import { defineComponent } from "vue";


export default defineComponent({
    name: "AuthorshipSelectionModal",
    props: {
        contributions: {
            type: Array<PersonDocumentContribution>,
            required: true
        },
        submission: {
            type: Object as PropType<JournalPublication | ProceedingsPublication | undefined>,
            required: true
        }
    },
    emits: ["select"],
    setup(props, { emit }) {
        const dialog = ref(false);

        const selectYourself = (orderNumber: number) => {
            PersonService.getPersonId().then(response => {
                if (!props.submission) {
                    return; // should never happen
                }

                const personId = response.data;
                const submissionDTO = props.submission;
                submissionDTO.contributions?.forEach(contribution => {
                    if (contribution.orderNumber === orderNumber) {
                        contribution.personId = personId;
                    }
                });

                if ("volume" in submissionDTO) {
                    DocumentPublicationService.createJournalPublication(
                        submissionDTO,
                        self.crypto.randomUUID()
                    )
                    .then(() => {
                        emit("select");
                        dialog.value = false;
                    });
                } else {
                    DocumentPublicationService.createProceedingsPublication(
                        submissionDTO,
                        self.crypto.randomUUID()
                    )
                    .then(() => {
                        emit("select");
                        dialog.value = false;
                    });
                }
            });
        };

        const show = () => {
            dialog.value = true;
        };

        return { 
            dialog, show,
            selectYourself
        };
    }
});
</script>

<style scoped>

.narrow {
    max-width: 400px;
}

</style>
