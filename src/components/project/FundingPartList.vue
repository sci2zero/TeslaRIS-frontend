<template>
    <v-card class="pa-3" variant="flat" color="grey-lighten-5">
        <v-card-text class="edit-pen-container">
            <funding-part-submission-modal
                v-if="canEdit"
                @create="sendDataToParent"
            />

            <v-row>
                <v-list
                    :lines="false"
                    density="compact"
                    class="pa-0 overflow-hidden"
                >
                    <draggable
                        :list="fundingParts"
                        item-key="id"
                        group="fundingItems"
                        :disabled="false"
                    >
                        <v-list-item
                            v-for="(fundingPart, fundingIndex) in fundingParts"
                            :key="fundingIndex"
                            :value="fundingPart.id"
                            color="primary"
                        >
                            <template #prepend>
                                <v-icon icon="mdi-cash-multiple" />
                            </template>

                            <v-list-item-title>
                                <strong>{{ formatAmount(fundingPart.amount?.amount, locale) }} {{ fundingPart.amount?.currencyCode }}</strong>
                            </v-list-item-title>

                            <v-list-item-subtitle>
                                {{ returnCurrentLocaleContent(fundingPart.description) }}
                            </v-list-item-subtitle>

                            <template #append>
                                <v-row v-if="canEdit">
                                    <v-col v-if="!disableUpdates || isInstitutionalLibrarian || isAdmin || isHeadOfLibrary">
                                        <v-btn
                                            icon variant="outlined" size="x-small" color="primary"
                                            class="inline-action" @click="sendDeleteRequestToParent(fundingPart.id)">
                                            <v-icon size="x-large" icon="mdi-delete" />
                                        </v-btn>
                                    </v-col>
                                    <v-col v-if="!disableUpdates">
                                        <funding-part-submission-modal
                                            edit
                                            :preset-funding-part="fundingPart"
                                            @update="sendUpdateRequestToParent($event, fundingPart.id)"
                                        />
                                    </v-col>
                                </v-row>
                            </template>
                        </v-list-item>
                    </draggable>
                </v-list>
                <h4 v-if="fundingParts && fundingParts.length === 0">
                    {{ $t("noFundingPartsMessage") }}
                </h4>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useUserRole } from '@/composables/useUserRole';
import { useI18n } from 'vue-i18n';
import { formatAmount } from "@/utils/MonetaryUtil";
import type { FundingPart } from '@/models/FundingModel';
import FundingPartSubmissionModal from "@/components/project/FundingPartSubmissionModal.vue";

const { locale } = useI18n();

const props = withDefaults(
    defineProps<{
        fundingParts: FundingPart[];
        canEdit?: boolean;
        disableUpdates?: boolean;
    }>(),
    {
        canEdit: false,
        disableUpdates: false
    }
);

const emit = defineEmits<{
    (e: 'create', fundingPart: FundingPart): void;
    (e: 'update', fundingPart: FundingPart): void;
    (e: 'delete', id: number): void;
}>();

const { isAdmin, isHeadOfLibrary, isInstitutionalLibrarian } = useUserRole();

const sendDataToParent = (fundingPart: FundingPart) => {
    emit("create", fundingPart);
};

const sendUpdateRequestToParent = (fundingPart: FundingPart, fundingPartId: number | undefined) => {
    if (fundingPartId !== undefined) {
        fundingPart.id = fundingPartId;
    }
    emit("update", fundingPart);
};

const sendDeleteRequestToParent = (fundingPartId: number | undefined) => {
    if (fundingPartId !== undefined) {
        emit("delete", fundingPartId);
    }
};

</script>

<style scoped>
.edit-pen-container {
    position: relative;
}
</style>