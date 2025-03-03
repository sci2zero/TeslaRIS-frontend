<template>
    <v-row>
        <v-col :cols="inComparator ? 4 : 2">
            <h2>{{ $t("proceedingsListLabel") }}</h2>  
        </v-col>
        <v-col v-if="!readonly && userRole === 'ADMIN'" cols="3">
            <generic-crud-modal
                :form-component="ProceedingsSubmissionForm"
                :form-props="{conference: convertToListEntry(presetEvent)}"
                entity-name="Proceedings"
                is-submission
                :read-only="false"
                @create="refreshProceedingsList"
            />
        </v-col>
    </v-row>
    <v-row v-if="proceedings?.length > 0">
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
    <v-list lines="two">
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
    <h3 v-if="proceedings?.length === 0" class="no-proceedings-message">
        {{ $t("noAvailableProceedingsMessage") }}
    </h3>

    <toast v-model="snackbar" :message="message" />
</template>
  
<script lang="ts">
import { defineComponent, onMounted, ref, type PropType } from 'vue';
import type { Conference } from "@/models/EventModel";
import type { ProceedingsResponse } from '@/models/ProceedingsModel';
import ProceedingsService from '@/services/ProceedingsService';
import { watch } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import router from '@/router';
import { useI18n } from 'vue-i18n';
import { VueDraggableNext } from 'vue-draggable-next'
import { computed } from 'vue';
import UserService from '@/services/UserService';
import Toast from '../core/Toast.vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import ProceedingsSubmissionForm from './ProceedingsSubmissionForm.vue';


export default defineComponent({
    name: "ProceedingsList",
    components: { GenericCrudModal, draggable: VueDraggableNext, Toast },
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
            startProceedingsMetadataComparison, ProceedingsSubmissionForm
        };
    },
  });
</script>

<style scoped>

.no-proceedings-message {
    margin-bottom: 10px;
}

</style>
