<template>
    <v-row>
        <v-col cols="2">
            <h2>{{ $t("proceedingsLabel") }}</h2>  
        </v-col>
        <v-col class="proceedings-submission" cols="3">
            <proceedings-submission-modal :conference="convertToListEntry(presetEvent)" @create="refreshProceedingsList"></proceedings-submission-modal>
        </v-col>
    </v-row>
    <v-list lines="two">
        <v-list-item
            v-for="item in proceedings"
            :key="item.id"
            :title="(returnCurrentLocaleContent(item.title) as string)"
            :subtitle="item.documentDate ? item.documentDate : presetEvent?.dateTo.split('-')[0]"
            @click="navigateToProceedings(item.id as number)"
        >
            <template #append>
                <v-row>
                    <v-col cols="auto">
                        <v-icon @click.stop="deleteProceedings(item)">
                            mdi-delete
                        </v-icon>
                    </v-col>
                </v-row>
            </template>
        </v-list-item>
    </v-list>

    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ message }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
</template>
  
<script lang="ts">
import { defineComponent, onMounted, ref, type PropType } from 'vue';
import type { Conference } from "@/models/EventModel";
import ProceedingsSubmissionModal from '@/components/proceedings/ProceedingsSubmissionModal.vue';
import type { ProceedingsResponse } from '@/models/ProceedingsModel';
import ProceedingsService from '@/services/ProceedingsService';
import { watch } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import router from '@/router';
import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: "ProceedingsList",
    components: {ProceedingsSubmissionModal},
    props: {
        presetEvent: {
            type: Object as PropType<Conference | undefined>,
            required: true
        }
    },
    setup(props) {
        const proceedings = ref<ProceedingsResponse[]>([]);

        const snackbar = ref(false);
        const message = ref("");

        const i18n = useI18n();

        onMounted(() => {
            fetchProceedings();
        });

        watch(() => props.presetEvent, () => {
            fetchProceedings();
        });

        const fetchProceedings = () => {
            if (!props.presetEvent?.id) {
                return;
            }

            ProceedingsService.readProceedingsForEvent(props.presetEvent?.id as number).then((response) => {
                proceedings.value = response.data;
            });
        };

        const navigateToProceedings = (proceedingsId: number) => {
                router.push({ name: "proceedingsLandingPage", params: {id: proceedingsId} });
            };

        const refreshProceedingsList = () => {
            proceedings.value = [];
            fetchProceedings();
        };

        const convertToListEntry = (conference: Conference | undefined) => {
            return {title: returnCurrentLocaleContent(conference?.name) as string, value: conference?.id as number};
        };

        const deleteProceedings = (proceedings: ProceedingsResponse) => {
            ProceedingsService.deleteProceedings(proceedings.id as number).then(() => {
                refreshProceedingsList();
                message.value = i18n.t("deleteSuccessNotification", {name: returnCurrentLocaleContent(proceedings.title)});
                snackbar.value = true;
            }).catch(() => {
                message.value = i18n.t("deleteFailedNotification", {name: returnCurrentLocaleContent(proceedings.title)});
                snackbar.value = true;
            });
        };

        return {
            proceedings, returnCurrentLocaleContent,
            refreshProceedingsList, convertToListEntry,
            deleteProceedings, navigateToProceedings,
            snackbar, message
        };
    },
  });
</script>

<style scoped>

.proceedings-submission {
    margin-top: 10px;
}

</style>
