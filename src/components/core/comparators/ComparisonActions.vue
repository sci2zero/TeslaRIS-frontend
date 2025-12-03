<template>
    <div class="mt-15">
        <v-row
            v-if="allowFlaggingAsNotDuplicate"
            class="d-flex flex-row justify-center mb-3!">
            <v-btn
                color="blue darken-1" 
                @click="flagAsNotDuplicates">
                {{ $t("flagAsNotDuplicatesLabel") }}
            </v-btn>
        </v-row>
        <v-row class="d-flex flex-row justify-center">
            <v-btn color="blue darken-1" @click="deleteLeft">
                {{ $t("deleteLeftLabel") }}
            </v-btn>
            <delete-dropdown
                v-if="supportsForceDelete"
                @delete="forceDeleteLeft">
            </delete-dropdown>

            <v-btn
                color="blue darken-1"
                class="ml-2"
                :disabled="!isFormValid"
                @click="updateBoth">
                {{ $t("updateLabel") }}
            </v-btn>

            <v-btn color="blue darken-1" class="ml-2" @click="deleteRight">
                {{ $t("deleteRightLabel") }}
            </v-btn>
            <delete-dropdown
                v-if="supportsForceDelete"
                @delete="forceDeleteRight">
            </delete-dropdown>

            <persistent-question-dialog
                ref="dialogRef"
                :title="$t('areYouSureLabel')"
                :message="dialogMessage"
                @continue="completeForceDelete"
            />
        </v-row>
        <v-row
            v-if="aggregatedEntitiesComparisonPage"
            class="d-flex flex-row justify-center mt-8! mb-5!">
            <v-btn @click="navigateToAggregatedEntitiesComparison">
                {{ $t("compareAggregatedEntitiesLabel") }}
            </v-btn>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType, ref, watch } from 'vue';
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import DeleteDropdown from './DeleteDropdown.vue';
import PersistentQuestionDialog from './PersistentQuestionDialog.vue';
import { useRouter } from 'vue-router';
import DeduplicationService from '@/services/DeduplicationService';


export default defineComponent({
    name: "ComparisonActions",
    components: { DeleteDropdown, PersistentQuestionDialog },
    props: {
        supportsForceDelete: {
            type: Boolean,
            default: false
        },
        leftWarningMessage: {
            type: String,
            default: ""
        },
        rightWarningMessage: {
            type: String,
            default: ""
        },
        isFormValid: {
            type: Boolean,
            required: true
        },
        aggregatedEntitiesComparisonPage: {
            type: String,
            default: undefined
        },
        leftId: {
            type: Number,
            required: true
        },
        rightId: {
            type: Number,
            required: true
        },
        entityType: {
            type: Object as PropType<EntityType>,
            required: true
        }
    },
    emits: ["delete", "update"],
    setup(props, { emit }) {
        const dialogRef = ref<typeof PersistentQuestionDialog>();
        const dialogMessage = ref("");
        const side = ref(ComparisonSide.LEFT);

        const router = useRouter();
        const suggestionId = ref<string | null>(null);
        const allowFlaggingAsNotDuplicate = ref(false);

        onMounted(() => {
            fetchSuggestionId();
        });

        watch([
            () => props.leftId,
            () => props.rightId
        ], () => {
            fetchSuggestionId();
        })

        const fetchSuggestionId = () => {
            if (!props.leftId || !props.rightId) {
                return;   
            }

            DeduplicationService.getSuggestionId(
                props.leftId, props.rightId, props.entityType
            ).then((response) => {
                suggestionId.value = response.data;
                allowFlaggingAsNotDuplicate.value = !!suggestionId.value;
            });
        };

        const deleteLeft = () => {
            emit("delete", ComparisonSide.LEFT, false);
        };

        const deleteRight = () => {
            emit("delete", ComparisonSide.RIGHT, false);
        };

        const forceDeleteLeft = () => {
            side.value = ComparisonSide.LEFT;
            if (props.leftWarningMessage) {
                dialogMessage.value = props.leftWarningMessage;
                dialogRef.value?.toggle();
            } else {
                completeForceDelete();
            }
        };

        const forceDeleteRight = () => {
            side.value = ComparisonSide.RIGHT;
            if (props.rightWarningMessage) {
                dialogMessage.value = props.rightWarningMessage;
                dialogRef.value?.toggle();
            } else {
                completeForceDelete();
            }
        };

        const completeForceDelete = () => {
            emit("delete", side.value, true);
        };

        const updateBoth = () => {
            emit("update");
        };

        const navigateToAggregatedEntitiesComparison = () => {
            router.push({name: props.aggregatedEntitiesComparisonPage, params: {
                leftId: props.leftId, rightId: props.rightId
            }});
        };

        const flagAsNotDuplicates = () => {
            if (!suggestionId.value) {
                return;
            }

            DeduplicationService.flagAsNotDuplicate(suggestionId.value).then(() => {
                router.push({name: "deduplication"});
            });
        };

        return {
            navigateToAggregatedEntitiesComparison,
            deleteLeft, deleteRight, updateBoth,
            forceDeleteLeft, forceDeleteRight,
            dialogRef, completeForceDelete,
            dialogMessage, flagAsNotDuplicates,
            allowFlaggingAsNotDuplicate
        };
    },
});
</script>
