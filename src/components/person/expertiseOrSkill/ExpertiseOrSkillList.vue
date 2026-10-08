<template>
    <landing-section-card
        class="[&>header]:flex-wrap [&>header>h3]:min-w-24"
        :title="$t('expertisesAndSkillsLabel')"
        :count="expertiseOrSkills?.length ?? 0"
        icon="mdi-lightbulb-outline"
        icon-class="bg-blue-50 text-blue-600">
        <template v-if="canEdit" #action>
            <expertise-or-skill-modal :read-only="!canEdit" @create="createExpertiseOrSkill" />
        </template>
        <p v-if="!expertiseOrSkills?.length" class="px-4 py-5 text-sm text-slate-500">
            {{ $t("notYetSetMessage") }}
        </p>
        <draggable
            :list="expertiseOrSkills" item-key="id"
            group="expertiseOrSkills"
            class="divide-y divide-slate-100"
            :disabled="!inComparator">
            <div v-for="(expertiseOrSkill, index) in expertiseOrSkills" :key="index" class="px-4 py-4">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1 break-words">
                        <h4 class="text-sm font-semibold text-slate-800">
                            {{ returnCurrentLocaleContent(expertiseOrSkill.name) }}
                        </h4>
                    </div>
                    <expertise-or-skill-modal
                        v-if="canEdit"
                        :read-only="!canEdit" edit
                        :preset-expertise-or-skill="expertiseOrSkill"
                        @update="updateExpertiseOrSkill">
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
                                        @click="deleteExpertiseOrSkill(expertiseOrSkill.id)" />
                                </v-list>
                            </v-menu>
                        </template>
                    </expertise-or-skill-modal>
                </div>
                <p v-if="returnCurrentLocaleContent(expertiseOrSkill.description)" class="mt-2 break-words text-sm text-slate-600">
                    {{ returnCurrentLocaleContent(expertiseOrSkill.description) }}
                </p>
                <div v-if="expertiseOrSkill.keywords && expertiseOrSkill.keywords.length > 0" class="mt-3 flex flex-wrap gap-2">
                    <v-chip
                        v-for="(keyword, keywordIndex) in returnCurrentLocaleContent(expertiseOrSkill.keywords)?.split('\n')"
                        :key="keywordIndex" variant="tonal" size="small">
                        {{ keyword }}
                    </v-chip>
                </div>
                <attachment-list
                    class="mt-3"
                    :attachments="expertiseOrSkill.proofs"
                    :can-edit="canEdit" is-proof
                    @create="addExpertiseOrSkillProof($event, expertiseOrSkill)"
                    @update="updateExpertiseOrSkillProof(expertiseOrSkill, $event)"
                    @delete="deleteExpertiseOrSkillProof(expertiseOrSkill, $event)" />
            </div>
        </draggable>
    </landing-section-card>
</template>

<script lang="ts">
import type { DocumentFile } from '@/models/DocumentFileModel';
import DocumentFileService from '@/services/DocumentFileService';
import { defineComponent, type PropType } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { PersonResponse, ExpertiseOrSkill, ExpertiseOrSkillResponse } from '@/models/PersonModel';
import AttachmentList from '@/components/core/AttachmentList.vue';
import LandingSectionCard from '@/components/landing/LandingSectionCard.vue';
import ExpertiseOrSkillModal from './ExpertiseOrSkillModal.vue';
import { ref } from 'vue';
import ExpertiseOrSkillService from '@/services/ExpertiseOrSkillService';
import { VueDraggableNext } from 'vue-draggable-next'


export default defineComponent({
    name: "ExpertiseOrSkillList",
    components: { LandingSectionCard, AttachmentList, ExpertiseOrSkillModal, draggable: VueDraggableNext },
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
        inComparator: {
            type: Boolean,
            default: false
        }
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
