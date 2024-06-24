<template>
    <v-container>
        <h1>{{ $t("currentlyLoadingLabel") }}: {{ returnCurrentLocaleContent(currentLoadRecord?.title) }}</h1>
        <h3>{{ $t("yearOfPublicationLabel") }}: {{ localiseDate(currentLoadRecord?.documentDate) }}</h3>

        <br />
        <v-stepper
            v-model="stepperValue" :items="steps"
            :next-text="$t('nextLabel')"
            :prev-text="$t('previousLabel')">
            <template v-for="(contribution, index) in currentLoadRecord?.contributions" :key="index" #[`item.${index+1}`]>
                <import-author :ref="(el) => (importAuthorsRef[index] = el)" :person-for-loading="contribution.person" :institutions-for-loading="contribution.institutions"></import-author>
            </template>

            <template #[`item.${steps.length-1}`]>
                <h1>Sredjujem casopis</h1>
            </template>

            <template #[`item.${steps.length}`]>
                <h1>Sredjujem detalje</h1>
            </template>

            <template #actions>
                <div class="d-flex flex-row justify-between">
                    <v-btn :disabled="stepperValue === 1" @click="previousStep">
                        {{ $t('previousLabel') }}
                    </v-btn>
                    <v-btn :disabled="stepperValue === steps.length || !canAdvance" @click="nextStep">
                        {{ $t('nextLabel') }}
                    </v-btn>
                </div>
            </template>
        </v-stepper>

        <v-btn style="margin-top: 30px;" @click="skipDocument">
            {{ $t('skipDocumentLabel') }}
        </v-btn>

        <v-btn style="margin-top: 30px;" @click="smartSkip">
            {{ $t('smartSkipLabel') }}
        </v-btn>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ errorMessage }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script lang="ts">
import { returnCurrentLocaleContent } from "@/i18n/TranslationUtil";
import { localiseDate } from "@/i18n/dateLocalisation";
import type { JournalPublicationLoad, ProceedingsPublicationLoad } from "@/models/LoadModel";
import ImportService from "@/services/ImportService";
import { ref } from "vue";
import { onMounted } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import ImportAuthor from "@/components/import/ImportAuthor.vue";


export default defineComponent({
    name: "LoaderView",
    components: {ImportAuthor},
    setup() {
        const importAuthorsRef = ref<any[]>([]);

        const isFormValid = ref(false);
        
        const snackbar = ref(false);
        const errorMessage = ref("");
        const i18n = useI18n();

        const stepperValue = ref(1);
        const canAdvance = ref(true);
        const steps = ref<string[]>([])
        
        const nextStep = () => {
            stepperValue.value += 1;
        };

        const previousStep = () => {
            stepperValue.value -= 1;
        };

        const currentLoadRecord = ref<JournalPublicationLoad|ProceedingsPublicationLoad>();

        onMounted(() => {
            fetchNextRecordForLoading();
        });

        const fetchNextRecordForLoading = () => {
            ImportService.getNextFromWizard().then(response => {
                currentLoadRecord.value = response.data;
                steps.value = [];
                currentLoadRecord.value.contributions.forEach((contribution) => {
                    steps.value.push(`${contribution.person.firstName} ${contribution.person.lastName}`);
                })

                if ((currentLoadRecord.value as ProceedingsPublicationLoad).proceedingsPublicationType) {
                    steps.value.push(i18n.t("proceedingsLabel"));
                } else if ((currentLoadRecord.value as JournalPublicationLoad).journalPublicationType) {
                    steps.value.push(i18n.t("journalLabel"));
                }

                steps.value.push(i18n.t("otherDetailsLabel"));
            });
        };

        const skipDocument = () => {
            ImportService.skipWizard().then(() => {
                stepperValue.value = 1;
                fetchNextRecordForLoading();
            });
        };

        const waitForImportAuthor = (index: number): Promise<void> => {
            return new Promise(resolve => {
                const intervalId = setInterval(() => {
                if (importAuthorsRef.value[index]) {
                    if (importAuthorsRef.value[index].isReady()) {
                        clearInterval(intervalId);
                        resolve();
                    }
                }
                }, 200); // Check every 200 milliseconds
            });
        };

        const smartSkip = async () => {
            let shouldStep = true;
            while (shouldStep) {
                nextStep();
                await waitForImportAuthor(stepperValue.value - 1);
                shouldStep = importAuthorsRef.value[stepperValue.value - 1].isAutomaticallyHandled();
            }
        };

        return {
            isFormValid, snackbar,
            errorMessage, currentLoadRecord,
            returnCurrentLocaleContent,
            localiseDate, stepperValue, steps,
            nextStep, previousStep, canAdvance,
            skipDocument, importAuthorsRef, smartSkip
        };
    },
});
</script>
