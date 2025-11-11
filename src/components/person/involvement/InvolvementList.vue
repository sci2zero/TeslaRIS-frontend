<template>
    <draggable 
        :list="involvements" item-key="id"
        :group="dragGroup" 
        :disabled="!inComparator"
    >
        <div v-for="(involvement, index) in involvements" :key="index" class="py-5">
            <!-- <v-menu
                v-if="canEdit"
                v-model="menus[index]"
                :close-on-content-click="true"
                location="bottom"
            >
                <template #activator="{ props }">
                    <div class="edit-pen">
                        <v-btn
                            v-bind="props"
                            icon="mdi-file-edit-outline"
                        >
                        </v-btn>
                    </div>
                </template>

                <v-list min-width="150">
                    <person-involvement-modal
                        :read-only="!canEdit"
                        edit
                        :preset-involvement="involvement"
                        @update="updateInvolvement">
                    </person-involvement-modal>
                    <v-list-item @click="deleteInvolvement(involvement.id)">
                        <v-list-item-title>{{ $t("deleteLabel") }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu> -->
            <h4>
                <localized-link
                    v-if="involvement.organisationUnitId"
                    :to="'organisation-units/' + involvement.organisationUnitId">
                    <strong>{{ returnCurrentLocaleContent(involvement.organisationUnitName) }}</strong>
                </localized-link>
                <strong v-else>{{ returnCurrentLocaleContent(involvement.organisationUnitName) }}</strong>
                <v-icon icon="mdi-circle-small">
                </v-icon>
                <strong v-if="involvement.involvementType === 'MEMBER_OF'">{{ returnCurrentLocaleContent((involvement as Membership).role) }}</strong>
                <strong v-if="involvement.involvementType === 'STUDIED_AT' || involvement.involvementType === 'POSTDOC_AT' || involvement.involvementType === 'COMPLETED_COURSE_AT'">{{ returnCurrentLocaleContent((involvement as Education).title) }}</strong>
                <strong v-if="involvement.involvementType === 'EMPLOYED_AT' || involvement.involvementType === 'HIRED_BY' || involvement.involvementType === 'CANDIDATE'">{{ getEmploymentPositionTitleFromValueAutoLocale((involvement as Employment).employmentPosition as EmploymentPosition) }} ({{ getInvolvementTypeTitleFromValueAutoLocale(involvement.involvementType) }})</strong>
                <v-icon icon="mdi-circle-small">
                </v-icon>
                <span v-if="involvement.dateFrom">
                    {{ `${localiseDate(involvement.dateFrom)} - ${involvement.dateTo ? localiseDate(involvement.dateTo) : $t("presentLabel")}` }}
                </span>
                <span v-else>
                    {{ involvement.dateTo ? `${$t("unknownDateMessage")} - ${localiseDate(involvement.dateTo)}` : $t("currentLabel") }}
                </span>
                <div v-if="canEdit" class="inline-flex justify-end edit-pen!">
                    <v-btn
                        class="mt-1! ml-2!"
                        icon variant="outlined"
                        color="primary"
                        size="medium"
                        @click="deleteInvolvement(involvement.id)">
                        <v-icon size="large" icon="mdi-delete"></v-icon>
                    </v-btn>
                    <person-involvement-modal
                        class="mt-1! ml-2!"
                        :read-only="!canEdit"
                        edit
                        :preset-involvement="involvement"
                        @update="updateInvolvement">
                    </person-involvement-modal>
                </div>
            </h4>
            <p v-if="involvement.involvementType === 'MEMBER_OF'">
                {{ returnCurrentLocaleContent((involvement as Membership).contributionDescription) }}
            </p>
            <p v-if="(involvement.involvementType === 'STUDIED_AT' || involvement.involvementType === 'POSTDOC_AT' || involvement.involvementType === 'COMPLETED_COURSE_AT') && (involvement as Education).thesisTitle && (involvement as Education).thesisTitle!.length > 0">
                {{ $t("thesisTitleLabel") }}: {{ returnCurrentLocaleContent((involvement as Education).thesisTitle) }}
            </p>
            <p v-if="involvement.involvementType === 'EMPLOYED_AT' || involvement.involvementType === 'HIRED_BY' || involvement.involvementType === 'CANDIDATE'">
                {{ returnCurrentLocaleContent((involvement as Employment).role) }}
            </p>
            <attachment-list
                :attachments="involvement.proofs ? involvement.proofs : []" is-proof :can-edit="canEdit" @create="addInvolvementProof($event, involvement)"
                @delete="deleteInvolvementProof(involvement, $event)" @update="updateInvolvementProof(involvement, $event)"></attachment-list>
        </div>
    </draggable>
</template>

<script lang="ts">
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { getInvolvementTypeTitleFromValueAutoLocale } from '@/i18n/involvementType';
import type { DocumentFile } from '@/models/DocumentFileModel';
import type { Education, Employment, Membership } from '@/models/InvolvementModel';
import { EmploymentPosition, type PersonResponse } from '@/models/PersonModel';
import DocumentFileService from '@/services/DocumentFileService';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import PersonInvolvementModal from './PersonInvolvementModal.vue';
import AttachmentList from '@/components/core/AttachmentList.vue';
import InvolvementService from '@/services/InvolvementService';
import { ref } from 'vue';
import { watch } from 'vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import { localiseDate } from '@/utils/DateUtil';
import { VueDraggableNext } from 'vue-draggable-next'
import { getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';


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

        return { returnCurrentLocaleContent, addInvolvementProof, menus,
            deleteInvolvementProof, updateInvolvementProof, deleteInvolvement,
            getInvolvementTypeTitleFromValueAutoLocale, updateInvolvement,
            localiseDate, getEmploymentPositionTitleFromValueAutoLocale,
            EmploymentPosition };
    }
});
</script>
