<template>
    <div v-for="(involvement, index) in involvements" :key="index" class="py-5">
        <person-involvement-modal :read-only="!canEdit" edit :preset-involvement="involvement" @update="updateInvolvement"></person-involvement-modal>
        <v-btn icon @click="deleteInvolvement(involvement.id)">
            <v-icon>mdi-delete</v-icon>
        </v-btn>
        <h4>
            <localized-link :to="'organisation-units/' + involvement.organisationUnitId">
                <strong>{{ returnCurrentLocaleContent(involvement.organisationUnitName) }}</strong>
            </localized-link>
            <v-icon icon="mdi-circle-small">
            </v-icon>
            <strong v-if="involvement.involvementType === 'MEMBER_OF'">{{ returnCurrentLocaleContent((involvement as Membership).role) }}</strong>
            <strong v-if="involvement.involvementType === 'STUDIED_AT' || involvement.involvementType === 'POSTDOC_AT' || involvement.involvementType === 'COMPLETED_COURSE_AT'">{{ returnCurrentLocaleContent((involvement as Education).title) }}</strong>
            <strong v-if="involvement.involvementType === 'EMPLOYED_AT' || involvement.involvementType === 'HIRED_BY'">{{ (involvement as Employment).employmentPosition }} ({{ getInvolvementTypeTitleFromValueAutoLocale(involvement.involvementType) }})</strong>
            <v-icon icon="mdi-circle-small">
            </v-icon>
            {{ involvement.dateFrom ? `${involvement.dateFrom} - ${involvement.dateTo ? involvement.dateTo : $t("presentLabel")}` : $t("currentLabel") }}
        </h4>
        <p v-if="involvement.involvementType === 'MEMBER_OF'">
            {{ returnCurrentLocaleContent((involvement as Membership).contributionDescription) }}
        </p>
        <p v-if="(involvement.involvementType === 'STUDIED_AT' || involvement.involvementType === 'POSTDOC_AT' || involvement.involvementType === 'COMPLETED_COURSE_AT') && (involvement as Education).thesisTitle && (involvement as Education).thesisTitle!.length > 0">
            {{ $t("thesisTitleLabel") }}: {{ returnCurrentLocaleContent((involvement as Education).thesisTitle) }}
        </p>
        <p v-if="involvement.involvementType === 'EMPLOYED_AT' || involvement.involvementType === 'HIRED_BY'">
            {{ returnCurrentLocaleContent((involvement as Employment).role) }}
        </p>
        <attachment-list
            :attachments="involvement.proofs ? involvement.proofs : []" is-proof :can-edit="canEdit" @create="addInvolvementProof($event, involvement)"
            @delete="deleteInvolvementProof(involvement, $event)" @update="updateInvolvementProof(involvement, $event)"></attachment-list>
    </div>
</template>

<script lang="ts">
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import { getInvolvementTypeTitleFromValueAutoLocale } from '@/i18n/involvementType';
import type { DocumentFile } from '@/models/DocumentFileModel';
import type { Education, Employment, Membership } from '@/models/InvolvementModel';
import type { PersonResponse } from '@/models/PersonModel';
import DocumentFileService from '@/services/DocumentFileService';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import PersonInvolvementModal from './PersonInvolvementModal.vue';
import AttachmentList from '@/components/core/AttachmentList.vue';
import InvolvementService from '@/services/InvolvementService';


export default defineComponent({
    name: "InvolvementList",
    components: { PersonInvolvementModal, AttachmentList },
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
        }
    },
    emits: ["refreshInvolvements"],
    setup(props, { emit }) {
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
            console.log(involvement)
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

        return { returnCurrentLocaleContent, addInvolvementProof,
            deleteInvolvementProof, updateInvolvementProof, deleteInvolvement,
            getInvolvementTypeTitleFromValueAutoLocale, updateInvolvement };
    }
});
</script>
