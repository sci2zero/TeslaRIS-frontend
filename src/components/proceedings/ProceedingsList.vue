<template>
    <v-row>
        <v-col :cols="inComparator ? 4 : 2">
            <h2>{{ $t("proceedingsListLabel") }}</h2>  
        </v-col>
        <v-col v-if="!readonly && userRole === 'ADMIN'" class="proceedings-submission" cols="3">
            <proceedings-submission-modal :conference="convertToListEntry(presetEvent)" @create="refreshProceedingsList"></proceedings-submission-modal>
        </v-col>
    </v-row>
    <v-row>
        <v-btn
            v-if="userRole === 'ADMIN'"
            density="compact" class="compare-button" :disabled="selectedProceedings.length !== 2" @click="startProceedingsPublicationComparison">
            {{ $t("comparePublicationsLabel") }}
        </v-btn>
        <v-btn
            v-if="userRole === 'ADMIN'"
            density="compact" class="compare-button" :disabled="selectedProceedings.length !== 2" @click="startProceedingsMetadataComparison">
            {{ $t("compareMetadataLabel") }}
        </v-btn>
    </v-row>
    <v-list v-if="proceedings && proceedings.length > 0" lines="two">
        <draggable 
            :list="proceedings" item-key="id"
            group="proceedings" 
            :disabled="!inComparator"
            @change="onDropCallback"
        >
            <v-list-item
                v-for="item in proceedings"
                :key="item.id"
                :title="(returnCurrentLocaleContent(item.title) as string)"
                :subtitle="item.documentDate ? item.documentDate : presetEvent?.dateTo.split('-')[0]"
                @click="navigateToProceedings(item.id as number)"
            >
                <template v-if="userRole === 'ADMIN'" #prepend>
                    <v-checkbox
                        v-model="selectedProceedings"
                        :value="item"
                        class="table-checkbox"
                        hide-details
                        @click.stop
                    />
                </template>
                <template v-if="!readonly && userRole === 'ADMIN'" #append>
                    <v-row>
                        <v-col cols="auto">
                            <v-icon @click.stop="deleteProceedings(item)">
                                mdi-delete
                            </v-icon>
                        </v-col>
                    </v-row>
                </template>
            </v-list-item>
        </draggable>
    </v-list>
    <h3 v-else class="no-proceedings-message">
        {{ $t("noAvailableProceedingsMessage") }}
    </h3>

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
import { VueDraggableNext } from 'vue-draggable-next'
import { computed } from 'vue';
import UserService from '@/services/UserService';


export default defineComponent({
    name: "ProceedingsList",
    components: { ProceedingsSubmissionModal, draggable: VueDraggableNext },
    props: {
        presetEvent: {
            type: Object as PropType<Conference | undefined>,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            required: true
        }
    },
    emits: ["dragged"],
    setup(props, {emit}) {
        const proceedings = ref<ProceedingsResponse[]>([]);
        const selectedProceedings = ref<ProceedingsResponse[]>([]);

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

        const onDropCallback = (event: any) => {
            emit("dragged", event);
        };

        const startProceedingsPublicationComparison = () => {
            router.push({name: "proceedingsPublicationsComparator", params: {
                leftId: selectedProceedings.value[0].id, rightId: selectedProceedings.value[1].id
            }});
        };

        const startProceedingsMetadataComparison = () => {
            router.push({name: "proceedingsMetadataComparator", params: {
                leftId: selectedProceedings.value[0].id, rightId: selectedProceedings.value[1].id
            }});
        };

        const userRole = computed(() => UserService.provideUserRole());

        return {
            proceedings, returnCurrentLocaleContent,
            refreshProceedingsList, convertToListEntry,
            deleteProceedings, navigateToProceedings,
            snackbar, message, onDropCallback, userRole,
            selectedProceedings, startProceedingsPublicationComparison,
            startProceedingsMetadataComparison
        };
    },
  });
</script>

<style scoped>

.proceedings-submission {
    margin-top: 10px;
}

.no-proceedings-message {
    margin-bottom: 10px;
}

</style>
