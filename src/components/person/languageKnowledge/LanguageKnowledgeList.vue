<template>
    <landing-section-card
        class="[&>header]:flex-wrap [&>header>h3]:min-w-24"
        :title="$t('languageKnowledgesLabel')"
        :count="languageKnowledges?.length ?? 0"
        icon="mdi-translate"
        icon-class="bg-emerald-50 text-emerald-600">
        <template v-if="canEdit" #action>
            <language-knowledge-modal
                :read-only="!canEdit"
                :mother-tongue-taken="motherTongueTaken()"
                @create="createLanguageKnowledge" />
        </template>
        <p v-if="!languageKnowledges?.length" class="px-4 py-5 text-sm text-slate-500">
            {{ $t("notYetSetMessage") }}
        </p>
        <draggable
            :list="languageKnowledges" item-key="id"
            group="languageKnowledges"
            class="divide-y divide-slate-100"
            :disabled="!inComparator">
            <div v-for="(languageKnowledge, index) in languageKnowledges" :key="index" class="px-4 py-4">
                <div class="flex items-start justify-between gap-3">
                    <h4 class="min-w-0 break-words text-sm font-semibold text-slate-800">
                        {{ languageName(languageKnowledge) }}
                    </h4>
                    <div class="flex shrink-0 items-center gap-2">
                        <v-chip v-if="languageKnowledge.motherTongue" variant="tonal" size="small" color="success">
                            {{ $t("motherTongueLabel") }}
                        </v-chip>
                        <language-knowledge-modal
                            v-if="canEdit"
                            :read-only="!canEdit" edit
                            :preset-language-knowledge="languageKnowledge"
                            :mother-tongue-taken="motherTongueTaken(languageKnowledge)"
                            @update="updateLanguageKnowledge">
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
                                            @click="deleteLanguageKnowledge(languageKnowledge.id)" />
                                    </v-list>
                                </v-menu>
                            </template>
                        </language-knowledge-modal>
                    </div>
                </div>
                <div
                    v-if="levelsOf(languageKnowledge).length > 0"
                    class="mt-3 flex flex-wrap gap-2">
                    <v-chip
                        v-for="level in levelsOf(languageKnowledge)"
                        :key="level.labelKey" variant="tonal" size="small">
                        {{ $t(level.labelKey) }}: {{ level.value }}
                    </v-chip>
                </div>
                <attachment-list
                    v-if="isDigitalRepositoryEnabled"
                    class="mt-3" is-proof
                    :attachments="languageKnowledge.proofs"
                    :can-edit="canEdit"
                    @create="addLanguageKnowledgeProof($event, languageKnowledge)"
                    @update="updateLanguageKnowledgeProof(languageKnowledge, $event)"
                    @delete="deleteLanguageKnowledgeProof(languageKnowledge, $event)" />
            </div>
        </draggable>

        <toast v-model="snackbar" :message="message" />
    </landing-section-card>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import AttachmentList from "@/components/core/AttachmentList.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import LanguageKnowledgeModal from "./LanguageKnowledgeModal.vue";
import Toast from "@/components/core/Toast.vue";
import { getErrorMessageForErrorKey } from "@/i18n";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import type { DocumentFile } from "@/models/DocumentFileModel";
import type { LanguageKnowledge, LanguageKnowledgeResponse, PersonResponse } from "@/models/PersonModel";
import DocumentFileService from "@/services/DocumentFileService";
import LanguageKnowledgeService from "@/services/LanguageKnowledgeService";
import { useCrisContextInformation } from "@/composables/useCrisContextInformation";


export default defineComponent({
    name: "LanguageKnowledgeList",
    components: { LandingSectionCard, AttachmentList, LanguageKnowledgeModal, Toast, draggable: VueDraggableNext },
    props: {
        languageKnowledges: {
            type: Object as PropType<LanguageKnowledgeResponse[] | undefined>,
            required: true
        },
        person: {
            type: Object as PropType<PersonResponse | undefined>,
            default: undefined
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
    setup(props, { emit }) {
        const { isDigitalRepositoryEnabled } = useCrisContextInformation();

        const snackbar = ref(false);
        const message = ref("");

        const languageName = (languageKnowledge: LanguageKnowledgeResponse) =>
            returnCurrentLocaleContent(languageKnowledge.language?.name) ??
            returnCurrentLocaleContent(languageKnowledge.name) ??
            languageKnowledge.language?.languageCode ?? "";

        // The levels are CEFR codes, so they stay as they are in every language.
        const levelsOf = (languageKnowledge: LanguageKnowledgeResponse) =>
            [
                { labelKey: "overallLevelLabel", value: languageKnowledge.overall },
                { labelKey: "readingLevelLabel", value: languageKnowledge.reading },
                { labelKey: "writingLevelLabel", value: languageKnowledge.writing },
                { labelKey: "speakingLevelLabel", value: languageKnowledge.speaking },
                { labelKey: "listeningLevelLabel", value: languageKnowledge.listening },
                { labelKey: "academicReviewLevelLabel", value: languageKnowledge.academicReview },
                { labelKey: "academicWritingLevelLabel", value: languageKnowledge.academicWriting }
            ].filter(level => !!level.value);

        const motherTongueTaken = (languageKnowledge?: LanguageKnowledgeResponse) =>
            (props.languageKnowledges ?? []).some(
                existing => existing.motherTongue && existing.id !== languageKnowledge?.id);

        const reportError = (error: any) => {
            message.value = getErrorMessageForErrorKey(error.response?.data?.message);
            snackbar.value = true;
        };

        const createLanguageKnowledge = (languageKnowledge: LanguageKnowledge) => {
            LanguageKnowledgeService.createLanguageKnowledge(
                languageKnowledge, props.person?.id as number
            ).then(() => {
                emit("crud");
            }).catch(reportError);
        };

        const updateLanguageKnowledge = (languageKnowledge: LanguageKnowledge) => {
            LanguageKnowledgeService.updateLanguageKnowledge(
                languageKnowledge, props.person?.id as number, languageKnowledge.id as number
            ).then(() => {
                emit("crud");
            }).catch(reportError);
        };

        const deleteLanguageKnowledge = (languageKnowledgeId: number) => {
            LanguageKnowledgeService.deleteLanguageKnowledge(
                props.person?.id as number, languageKnowledgeId
            ).then(() => {
                emit("crud");
            }).catch(reportError);
        };

        const addLanguageKnowledgeProof = (proof: DocumentFile, languageKnowledge: LanguageKnowledgeResponse) => {
            DocumentFileService.addLanguageKnowledgeProof(
                proof, languageKnowledge.id, props.person?.id as number
            ).then(response => {
                languageKnowledge.proofs?.push(response.data);
            });
        };

        const updateLanguageKnowledgeProof = (languageKnowledge: LanguageKnowledgeResponse, proof: DocumentFile) => {
            DocumentFileService.updateLanguageKnowledgeProof(
                proof, props.person?.id as number
            ).then(response => {
                if (languageKnowledge.proofs) {
                    languageKnowledge.proofs = languageKnowledge.proofs.filter(
                        existingProof => existingProof.id !== response.data.id);
                }
                languageKnowledge.proofs?.push(response.data);
            });
        };

        const deleteLanguageKnowledgeProof = (languageKnowledge: LanguageKnowledgeResponse, proofId: number) => {
            DocumentFileService.deleteLanguageKnowledgeProof(
                proofId, languageKnowledge.id, props.person?.id as number
            ).then(() => {
                if (languageKnowledge.proofs) {
                    languageKnowledge.proofs = languageKnowledge.proofs.filter(
                        proof => proof.id !== proofId);
                }
            });
        };

        return {
            languageName, levelsOf, motherTongueTaken, isDigitalRepositoryEnabled,
            snackbar, message,
            createLanguageKnowledge, updateLanguageKnowledge, deleteLanguageKnowledge,
            addLanguageKnowledgeProof, updateLanguageKnowledgeProof,
            deleteLanguageKnowledgeProof
        };
    }
});
</script>
