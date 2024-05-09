<template>
    <v-card class="pa-3" variant="flat" color="grey-lighten-5">
        <v-card-text class="edit-pen-container">
            <prize-modal @create="createPrize"></prize-modal>
            <div><b>{{ $t("prizesLabel") }}</b></div>
            <strong v-if="prizes?.length === 0">{{ $t("notYetSetMessage") }}</strong>
            <br />
            
            <div v-for="(prize, index) in prizes" :key="index" class="py-5">
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
                            <prize-modal :read-only="!canEdit" edit :preset-prize="prize" @update="updatePrize"></prize-modal>
                            <v-list-item @click="deletePrize(prize.id)">
                                <v-list-item-title>{{ $t("deleteLabel") }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </v-menu>

                <h4><strong>{{ returnCurrentLocaleContent(prize.title) }}</strong></h4>
                <p>{{ returnCurrentLocaleContent(prize.description) }}</p>
                
                <br />
                <attachment-list
                    :attachments="prize.proofs" :can-edit="canEdit" is-proof @create="addPrizeProof($event, prize)"
                    @update="updatePrizeProof(prize, $event)" @delete="deletePrizeProof(prize, $event)"></attachment-list>
                <v-divider v-if="index < (prizes ? prizes.length : 1) - 1 " class="mt-10"></v-divider>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import type { DocumentFile } from '@/models/DocumentFileModel';
import DocumentFileService from '@/services/DocumentFileService';
import { defineComponent, type PropType } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import type { PersonResponse, Prize, PrizeResponse } from '@/models/PersonModel';
import AttachmentList from '@/components/core/AttachmentList.vue';
import PrizeModal from './PrizeModal.vue';
import { ref } from 'vue';
import PrizeService from '@/services/PrizeService';


export default defineComponent({
    name: "PrizeList",
    components: { AttachmentList, PrizeModal },
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
            returnCurrentLocaleContent, createPrize, updatePrize, deletePrize };
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
