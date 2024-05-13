<template>
    <v-card class="pa-3" variant="flat" color="grey-lighten-5">
        <v-card-text class="edit-pen-container">
            <expertise-or-skill-modal :read-only="!canEdit" @create="createExpertiseOrSkill"></expertise-or-skill-modal>
            <div><b>{{ $t("expertisesAndSkillsLabel") }}</b></div>
            <strong v-if="expertiseOrSkills?.length === 0">{{ $t("notYetSetMessage") }}</strong>
            <br />
            
            <div v-for="(expertiseOrSkill, index) in expertiseOrSkills" :key="index" class="py-5">
                <v-menu
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

                    <v-card min-width="150">
                        <v-list>
                            <expertiseOrSkill-modal :read-only="!canEdit" edit :preset-expertise-or-skill="expertiseOrSkill" @update="updateExpertiseOrSkill"></expertiseOrSkill-modal>
                            <v-list-item @click="deleteExpertiseOrSkill(expertiseOrSkill.id)">
                                <v-list-item-title>{{ $t("deleteLabel") }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </v-menu>

                <h4><strong>{{ returnCurrentLocaleContent(expertiseOrSkill.name) }}</strong></h4>
                <p>{{ returnCurrentLocaleContent(expertiseOrSkill.description) }}</p>
                
                <br />
                <attachment-list
                    :attachments="expertiseOrSkill.proofs" :can-edit="canEdit" is-proof @create="addExpertiseOrSkillProof($event, expertiseOrSkill)"
                    @update="updateExpertiseOrSkillProof(expertiseOrSkill, $event)" @delete="deleteExpertiseOrSkillProof(expertiseOrSkill, $event)"></attachment-list>
                <v-divider v-if="index < (expertiseOrSkills ? expertiseOrSkills.length : 1) - 1 " class="mt-10"></v-divider>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import type { DocumentFile } from '@/models/DocumentFileModel';
import DocumentFileService from '@/services/DocumentFileService';
import { defineComponent, type PropType } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import type { PersonResponse, ExpertiseOrSkill, ExpertiseOrSkillResponse } from '@/models/PersonModel';
import AttachmentList from '@/components/core/AttachmentList.vue';
import ExpertiseOrSkillModal from './ExpertiseOrSkillModal.vue';
import { ref } from 'vue';
import ExpertiseOrSkillService from '@/services/ExpertiseOrSkillService';


export default defineComponent({
    name: "ExpertiseOrSkillList",
    components: { AttachmentList, ExpertiseOrSkillModal },
    props: {
        expertiseOrSkills: {
            type: Object as PropType<ExpertiseOrSkillResponse[] | undefined>,
            required: true
        },
        person: {
            type: Object as PropType<PersonResponse | undefined>,
            required: true
        },
        canEdit: {
            type: Boolean,
            default: false
        },
    },
    emits: ["crud"],
    setup(props, {emit}) {
        const menus = ref<boolean[]>([]);

        const addExpertiseOrSkillProof = (proof: DocumentFile, expertiseOrSkill: ExpertiseOrSkillResponse) => {
            DocumentFileService.addExpertiseOrSkillProof(proof, expertiseOrSkill.id as number, props.person?.id as number).then((response => {
                expertiseOrSkill.proofs?.push(response.data);
            }));
        };

        const updateExpertiseOrSkillProof = (expertiseOrSkill: ExpertiseOrSkillResponse, proof: DocumentFile) => {
            DocumentFileService.updateExpertiseOrSkillProof(proof, props.person?.id as number).then((response) => {
                if (expertiseOrSkill.proofs) {
                    expertiseOrSkill.proofs = expertiseOrSkill.proofs.filter(proof => proof.id !== response.data.id);
                }
                expertiseOrSkill.proofs?.push(response.data);
            });
        };

        const deleteExpertiseOrSkillProof = (expertiseOrSkill: ExpertiseOrSkillResponse, proofId: number) => {
            DocumentFileService.deleteExpertiseOrSkillProof(proofId, expertiseOrSkill.id as number, props.person?.id as number).then(() => {
                if (expertiseOrSkill.proofs) {
                    expertiseOrSkill.proofs = expertiseOrSkill.proofs.filter(proof => proof.id !== proofId);
                }
            });
        };

        const createExpertiseOrSkill = (expertiseOrSkill: ExpertiseOrSkill) => {
            ExpertiseOrSkillService.createExpertiseOrSkill(expertiseOrSkill, props.person?.id as number).then(() => {
                emit("crud");
            });
        };

        const updateExpertiseOrSkill = (expertiseOrSkill: ExpertiseOrSkill) => {
            ExpertiseOrSkillService.updateExpertiseOrSkill(expertiseOrSkill, props.person?.id as number, expertiseOrSkill?.id as number).then(() => {
                emit("crud");
            });
        };

        const deleteExpertiseOrSkill = (expertiseOrSkillId: number) => {
            ExpertiseOrSkillService.deleteExpertiseOrSkill(props.person?.id as number, expertiseOrSkillId).then(() => {
                emit("crud");
            });
        };

        return { addExpertiseOrSkillProof, updateExpertiseOrSkillProof, deleteExpertiseOrSkillProof, menus,
            returnCurrentLocaleContent, createExpertiseOrSkill, updateExpertiseOrSkill, deleteExpertiseOrSkill };
    }
});
</script>

<style scoped>
    .edit-pen-container {
        position:relative;
    }

    .edit-pen-container .edit-pen {
        top: 20px;
        right: 0px;
        position: absolute;
        z-index: 10;
        opacity: 0;
    }

    .edit-pen-container:hover .edit-pen {
        opacity: 0.3;
    }

    .edit-pen-container .edit-pen:hover {
        opacity: 1;
    }
</style>
