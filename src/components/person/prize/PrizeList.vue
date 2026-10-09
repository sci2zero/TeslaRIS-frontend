<template>
    <landing-section-card
        class="[&>header]:flex-wrap [&>header>h3]:min-w-24"
        :title="$t('prizesLabel')"
        :count="prizes?.length ?? 0"
        icon="mdi-trophy-outline"
        icon-class="bg-amber-50 text-amber-600">
        <template v-if="canEdit" #action>
            <prize-modal :read-only="!canEdit" @create="createPrize" />
        </template>
        <p v-if="!prizes?.length" class="px-4 py-5 text-sm text-slate-500">
            {{ $t("notYetSetMessage") }}
        </p>
        <draggable
            :list="prizes" item-key="id"
            group="prizes"
            class="divide-y divide-slate-100"
            :disabled="!inComparator">
            <div v-for="(prize, index) in prizes" :key="index" class="px-4 py-4">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1 break-words">
                        <h4 class="text-sm font-semibold text-slate-800">
                            {{ returnCurrentLocaleContent(prize.title) }}
                        </h4>
                        <p v-if="prize.date" class="mt-1 text-xs text-slate-500">
                            {{ localiseDate(prize.date) }}
                        </p>
                    </div>
                    <prize-modal
                        v-if="canEdit"
                        :read-only="!canEdit" edit
                        :preset-prize="prize"
                        @update="updatePrize">
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
                                        @click="deletePrize(prize.id)" />
                                </v-list>
                            </v-menu>
                        </template>
                    </prize-modal>
                </div>
                <p v-if="returnCurrentLocaleContent(prize.description)" class="mt-2 break-words text-sm text-slate-600">
                    {{ returnCurrentLocaleContent(prize.description) }}
                </p>
                <div v-if="prize.keywords && prize.keywords.length > 0" class="mt-3 flex flex-wrap gap-2">
                    <v-chip
                        v-for="(keyword, keywordIndex) in returnCurrentLocaleContent(prize.keywords)?.split('\n')"
                        :key="keywordIndex" variant="tonal" size="small">
                        {{ keyword }}
                    </v-chip>
                </div>
                <attachment-list
                    class="mt-3"
                    :attachments="prize.proofs"
                    :can-edit="canEdit" is-proof
                    @create="addPrizeProof($event, prize)"
                    @update="updatePrizeProof(prize, $event)"
                    @delete="deletePrizeProof(prize, $event)" />
            </div>
        </draggable>
    </landing-section-card>
</template>

<script lang="ts">
import type { DocumentFile } from '@/models/DocumentFileModel';
import DocumentFileService from '@/services/DocumentFileService';
import { defineComponent, type PropType } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { PersonResponse, Prize, PrizeResponse } from '@/models/PersonModel';
import AttachmentList from '@/components/core/AttachmentList.vue';
import LandingSectionCard from '@/components/landing/LandingSectionCard.vue';
import PrizeModal from './PrizeModal.vue';
import { ref } from 'vue';
import PrizeService from '@/services/PrizeService';
import { localiseDate } from '@/utils/DateUtil';
import { VueDraggableNext } from 'vue-draggable-next'


export default defineComponent({
    name: "PrizeList",
    components: { LandingSectionCard, AttachmentList, PrizeModal, draggable: VueDraggableNext },
    props: {
        prizes: {
            type: Object as PropType<PrizeResponse[] | undefined>,
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

        const addPrizeProof = (proof: DocumentFile, prize: PrizeResponse) => {
            DocumentFileService.addPrizeProof(proof, prize.id as number, props.person?.id as number).then((response => {
                prize.proofs?.push(response.data);
            }));
        };

        const updatePrizeProof = (prize: PrizeResponse, proof: DocumentFile) => {
            DocumentFileService.updatePrizeProof(proof, props.person?.id as number).then((response) => {
                if (prize.proofs) {
                    prize.proofs = prize.proofs.filter(proof => proof.id !== response.data.id);
                }
                prize.proofs?.push(response.data);
            });
        };

        const deletePrizeProof = (prize: PrizeResponse, proofId: number) => {
            DocumentFileService.deletePrizeProof(proofId, prize.id as number, props.person?.id as number).then(() => {
                if (prize.proofs) {
                    prize.proofs = prize.proofs.filter(proof => proof.id !== proofId);
                }
            });
        };

        const createPrize = (prize: Prize) => {
            PrizeService.createPrize(prize, props.person?.id as number).then(() => {
                emit("crud");
            });
        };

        const updatePrize = (prize: Prize) => {
            PrizeService.updatePrize(prize, props.person?.id as number, prize?.id as number).then(() => {
                emit("crud");
            });
        };

        const deletePrize = (prizeId: number) => {
            PrizeService.deletePrize(props.person?.id as number, prizeId).then(() => {
                emit("crud");
            });
        };

        return { addPrizeProof, updatePrizeProof, deletePrizeProof, menus,
            returnCurrentLocaleContent, createPrize, updatePrize, deletePrize,
            localiseDate };
    }
});
</script>
