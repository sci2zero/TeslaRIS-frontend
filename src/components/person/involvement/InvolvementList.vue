<template>
    <draggable
        :list="involvements" item-key="id"
        :group="dragGroup"
        class="divide-y divide-slate-100"
        :disabled="!inComparator"
    >
        <div v-for="(involvement, index) in sortedInvolvements" :key="index" class="px-4 py-4">
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1 break-words">
                    <h4 class="text-sm font-semibold text-slate-800">
                        <localized-link
                            v-if="involvement.organisationUnitId"
                            :to="'organisation-units/' + involvement.organisationUnitId"
                            class="no-underline hover:underline">
                            {{ returnCurrentLocaleContent(involvement.organisationUnitName) }}
                        </localized-link>
                        <span v-else>{{ returnCurrentLocaleContent(involvement.organisationUnitName) }}</span>
                    </h4>
                    <p class="mt-1 text-sm text-slate-600">
                        <span v-if="involvement.involvementType === 'MEMBER_OF'">{{ returnCurrentLocaleContent((involvement as Membership).role) }}</span>
                        <span v-if="involvement.involvementType === 'STUDIED_AT' || involvement.involvementType === 'POSTDOC_AT' || involvement.involvementType === 'COMPLETED_COURSE_AT'">{{ returnCurrentLocaleContent((involvement as Education).title) }} <span v-if="getEducationStatusTitleFromValueAutoLocale((involvement as Education).educationStatus as EducationStatus)">({{ getEducationStatusTitleFromValueAutoLocale((involvement as Education).educationStatus as EducationStatus) }})</span></span>
                        <span v-if="involvement.involvementType === 'EMPLOYED_AT' || involvement.involvementType === 'HIRED_BY' || involvement.involvementType === 'CANDIDATE'">{{ (involvement as Employment).employmentPositionId ? returnCurrentLocaleContent((involvement as Employment).employmentPositionName) : getEmploymentPositionTitleFromValueAutoLocale((involvement as Employment).employmentPosition as EmploymentPosition) }} ({{ getInvolvementTypeTitleFromValueAutoLocale(involvement.involvementType) }})</span>
                    </p>
                    <p class="mt-1 text-xs text-slate-500">
                        <span v-if="involvement.dateFrom">
                            {{ `${localiseDate(involvement.dateFrom)} - ${involvement.dateTo ? localiseDate(involvement.dateTo) : $t("presentLabel")}` }}
                        </span>
                        <span v-else>
                            {{ involvement.dateTo ? `${$t("unknownDateMessage")} - ${localiseDate(involvement.dateTo)}` : $t("currentLabel") }}
                        </span>
                    </p>
                </div>
                <person-involvement-modal
                    v-if="canEdit"
                    :read-only="!canEdit" edit
                    :preset-involvement="involvement"
                    :researcher-id="person?.id"
                    @update="updateInvolvement">
                    <template #activator="{ props: activatorProps }">
                        <v-menu location="bottom end">
                            <template #activator="{ props: menuProps }">
                                <v-btn
                                    v-bind="menuProps"
                                    icon="mdi-dots-horizontal" variant="text" size="small"
                                    class="shrink-0 text-slate-500"
                                    :aria-label="$t('moreActionsLabel')" />
                            </template>
                            <v-list class="min-w-48 rounded-lg border border-slate-200 py-1" density="compact">
                                <v-list-item
                                    v-bind="activatorProps"
                                    prepend-icon="mdi-pencil-outline"
                                    :title="$t('editActionLabel')" />
                                <v-list-item
                                    prepend-icon="mdi-delete-outline"
                                    :title="$t('deleteLabel')"
                                    class="text-red-600"
                                    @click="deleteInvolvement(involvement.id)" />
                            </v-list>
                        </v-menu>
                    </template>
                </person-involvement-modal>
            </div>
            <p v-if="involvement.involvementType === 'MEMBER_OF'" class="mt-2 break-words text-sm text-slate-600">
                {{ returnCurrentLocaleContent((involvement as Membership).contributionDescription) }}
            </p>
            <div
                v-if="(involvement.involvementType === 'STUDIED_AT' || involvement.involvementType === 'POSTDOC_AT' || involvement.involvementType === 'COMPLETED_COURSE_AT') && (involvement as Education).thesisTitle && (involvement as Education).thesisTitle!.length > 0"
                class="mt-2 space-y-1 break-words text-sm text-slate-600">
                <p v-if="(involvement as Education).thesisTitle">
                    {{ $t("thesisTitleLabel") }}: {{ returnCurrentLocaleContent((involvement as Education).thesisTitle) }}
                </p>
                <p v-if="(involvement as Education).abbreviationTitle">
                    {{ $t("abbreviationTitleLabel") }}: {{ returnCurrentLocaleContent((involvement as Education).abbreviationTitle) }}
                </p>
                <p v-if="((involvement as Education).supervisorNames?.length ?? 0) > 0 && (involvement as Education).supervisorIds?.length">
                    {{ $t("supervisorsLabel") }}:
                    <span v-for="(supervisor, idx) in (involvement as Education).supervisorNames" :key="idx">
                        <localized-link :to="'persons/' + (involvement as Education).supervisorIds?.[idx]">
                            {{ supervisor }}{{ ((idx < (involvement as Education).supervisorNames!.length - 1)) ? ", " : "" }}
                        </localized-link>
                    </span>
                </p>
                <p v-if="((involvement as Education).displaySupervisors?.length ?? 0) > 0">
                    {{ $t("supervisorsLabel") }}: {{ returnCurrentLocaleContent((involvement as Education).displaySupervisors) }}
                </p>
                <p>
                    {{ returnCurrentLocaleContent((involvement as Education).degreeCode) }} {{ returnCurrentLocaleContent((involvement as Education).degreeClassification) }}
                </p>
            </div>
            <p v-if="involvement.involvementType === 'EMPLOYED_AT' || involvement.involvementType === 'HIRED_BY' || involvement.involvementType === 'CANDIDATE'" class="mt-2 break-words text-sm text-slate-600">
                {{ returnCurrentLocaleContent((involvement as Employment).role) }}
            </p>

            <p v-if="returnCurrentLocaleContent(involvement.description)" class="mt-2 break-words text-sm text-slate-600">
                {{ returnCurrentLocaleContent(involvement.description) }}
            </p>

            <div
                v-if="involvement.keywords?.length"
                class="mt-3 flex flex-wrap gap-2">
                <span
                    v-for="(keyword, keywordIndex) in returnCurrentLocaleContent(involvement.keywords)?.split('\n')"
                    :key="keywordIndex">
                    <v-chip
                        variant="tonal"
                        size="small">
                        {{ keyword }}
                    </v-chip>
                </span>
            </div>

            <attachment-list
                class="mt-3"
                :attachments="involvement.proofs ? involvement.proofs : []" is-proof :can-edit="canEdit" @create="addInvolvementProof($event, involvement)"
                @delete="deleteInvolvementProof(involvement, $event)" @update="updateInvolvementProof(involvement, $event)" />
        </div>
    </draggable>
</template>

<script lang="ts">
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { getInvolvementTypeTitleFromValueAutoLocale } from '@/i18n/involvementType';
import type { DocumentFile } from '@/models/DocumentFileModel';
import { type Education, EducationStatus, type Employment, type Membership } from '@/models/InvolvementModel';
import { EmploymentPosition, type PersonResponse } from '@/models/PersonModel';
import DocumentFileService from '@/services/DocumentFileService';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import PersonInvolvementModal from './PersonInvolvementModal.vue';
import AttachmentList from '@/components/core/AttachmentList.vue';
import InvolvementService from '@/services/InvolvementService';
import { ref } from 'vue';
import { watch } from 'vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import { localiseDate } from '@/utils/DateUtil';
import { VueDraggableNext } from 'vue-draggable-next'
import { getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import { getEducationStatusTitleFromValueAutoLocale } from '@/i18n/educationStatus';


export default defineComponent({
    name: "InvolvementList",
    components: { PersonInvolvementModal, AttachmentList, LocalizedLink, draggable: VueDraggableNext },
    props: {
        canEdit: {
            type: Boolean,
            default: false
        },
        person: {
            type: Object as PropType<PersonResponse | undefined>,
            required: true
        },
        involvements: {
            type: Object as PropType<(Education | Membership | Employment)[]>,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        dragGroup: {
            type: String,
            default: "involvements"
        }
    },
    emits: ["refreshInvolvements", "dragged"],
    setup(props, { emit }) {
        const menus = ref<boolean[]>([]);

        watch(() => props.involvements, () => {
            if(props.involvements) {
                menus.value = [];
                props.involvements.forEach(() => {
                    menus.value.push(false);
                });
            }
        });

        const addInvolvementProof = (proof: DocumentFile, involvement: Membership | Education | Employment) => {
            DocumentFileService.addInvolvementProof(proof, involvement.id as number, props.person?.id as number).then((response => {
                involvement.proofs?.push(response.data);
            }));
        };

        const updateInvolvementProof = (involvement: Membership | Education | Employment, proof: DocumentFile) => {
            DocumentFileService.updateInvolvementProof(proof, proof.id, involvement.id as number, props.person?.id as number).then((response) => {
                if (involvement.proofs) {
                    involvement.proofs = involvement.proofs.filter(proof => proof.id !== response.data.id);
                }
                involvement.proofs?.push(response.data);
            });
        };

        const deleteInvolvementProof = (involvement: Membership | Education | Employment, proofId: number) => {
            DocumentFileService.deleteInvolvementProof(proofId, involvement.id as number, props.person?.id as number).then(() => {
                if (involvement.proofs) {
                    involvement.proofs = involvement.proofs.filter(proof => proof.id !== proofId);
                }
            });
        };

        const deleteInvolvement = (involvementId: number | undefined) => {
            if(involvementId && props.person?.id) {
                InvolvementService.deleteInvolvement(props.person.id, involvementId).then(() => {
                    emit("refreshInvolvements");
                });
            }
        };

        const updateInvolvement = (involvement: Education | Membership | Employment) => {
            if(involvement.id && props.person?.id) {
                if("title" in involvement) {
                    InvolvementService.updateEducation(involvement, involvement.id, props.person.id).then(() => {
                        emit("refreshInvolvements")
                    });
                } else if("contributionDescription" in involvement) {
                    InvolvementService.updateMembership(involvement, involvement.id, props.person.id).then(() => {
                        emit("refreshInvolvements")
                    });
                } else if("employmentPosition" in involvement) {
                    InvolvementService.updateEmployment(involvement, involvement.id, props.person.id).then(() => {
                        emit("refreshInvolvements")
                    });
                }
            }
        };

        const sortedInvolvements = computed(() => {
            if (!props.involvements) return [];
            
            return [...props.involvements].sort((a, b) => {
                if (a.dateFrom === null && b.dateFrom === null) return 0;
                if (a.dateFrom === null) return -1;
                if (b.dateFrom === null) return 1;
                
                return b.dateFrom.localeCompare(a.dateFrom);
            });
        });

        return { 
            returnCurrentLocaleContent, addInvolvementProof, menus,
            deleteInvolvementProof, updateInvolvementProof, deleteInvolvement,
            getInvolvementTypeTitleFromValueAutoLocale, updateInvolvement,
            localiseDate, getEmploymentPositionTitleFromValueAutoLocale,
            EmploymentPosition, sortedInvolvements, EducationStatus,
            getEducationStatusTitleFromValueAutoLocale
        };
    }
});
</script>
