<template>
    <div>
        <v-row>
            <v-col cols="5">
                <v-text-field
                    v-model="localHandleId"
                    label="Handle ID"
                    placeholder="Handle ID"
                    :rules="handleIdValidationRules"
                    @update:model-value="emitUpdate"
                />
            </v-col>
            <v-col cols="5">
                <v-text-field
                    v-model="localArxivId"
                    label="ArXiv ID"
                    placeholder="ArXiv ID"
                    :rules="arxivIdValidationRules"
                    @update:model-value="emitUpdate"
                />
            </v-col>
        </v-row>
        
        <v-row>
            <v-col cols="5">
                <v-text-field
                    v-model="localPubmedId"
                    label="PubMed ID"
                    placeholder="PubMed ID"
                    :rules="pubmedIdValidationRules"
                    @update:model-value="emitUpdate"
                />
            </v-col>
            <v-col cols="5">
                <v-text-field
                    v-model="localSsrnId"
                    label="SSRN ID"
                    placeholder="SSRN ID"
                    :rules="ssrnIdValidationRules"
                    @update:model-value="emitUpdate"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field
                    v-model="localNationalId"
                    :label="$t('nationalIdLabel')"
                    :placeholder="$t('nationalIdLabel')"
                    @update:model-value="emitUpdate"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="cityRef"
                    v-model="localCity"
                    :label="$t('cityLabel')"
                    @update:model-value="emitUpdate"
                />
            </v-col>
        </v-row>
        
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="geoSpaceDescriptionRef"
                    v-model="localGeoSpaceDescription"
                    :label="$t('geoSpaceDescriptionLabel')"
                    @update:model-value="emitUpdate"
                />
            </v-col>
        </v-row>
        
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="chronologicalSpaceDescriptionRef"
                    v-model="localChronologicalSpaceDescription"
                    :label="$t('chronologicalSpaceDescriptionLabel')"
                    @update:model-value="emitUpdate"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="editionRef"
                    v-model="localEdition"
                    :label="$t('editionLabel')"
                    @update:model-value="emitUpdate"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="5">
                <v-checkbox
                    v-model="localPeerReviewed"
                    :label="$t('peerReviewedLabel')"
                    @update:model-value="emitUpdate"
                />
            </v-col>
            <v-col cols="5">
                <v-checkbox
                    v-model="localOpenAccess"
                    :label="$t('isOpenAccessLabel')"
                    @update:model-value="emitUpdate"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-select
                    v-model="localPublicationStatus"
                    :items="publicationStatuses"
                    :label="$t('publicationStatusLabel')"
                    item-title="title"
                    item-value="value"
                    return-object
                    @update:model-value="emitUpdate"
                />
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch, onMounted, computed } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { type CommonFieldsData, PublicationStatus } from '@/models/PublicationModel';
import { getPublicationStatusesForGivenLocale, getPublicationStatusTitleFromValueAutoLocale } from '@/i18n/publicationStatus';


export default defineComponent({
    name: "DocumentCommonFields",
    components: { MultilingualTextInput },
    props: {
        modelValue: {
            type: Object as PropType<CommonFieldsData>,
            default: () => ({})
        },
        presetData: {
            type: Object as PropType<CommonFieldsData | undefined>,
            default: undefined
        }
    },
    emits: ["update:modelValue", "change"],
    setup(props, { emit }) {
        const { languageTags } = useLanguageTags();

        const {
            handleIdValidationRules,
            arxivIdValidationRules,
            pubmedIdValidationRules,
            ssrnIdValidationRules
        } = useValidationUtils();

        const localHandleId = ref(props.modelValue?.handleId || props.presetData?.handleId || "");
        const localArxivId = ref(props.modelValue?.arxivId || props.presetData?.arxivId || "");
        const localPubmedId = ref(props.modelValue?.pubmedId || props.presetData?.pubmedId || "");
        const localSsrnId = ref(props.modelValue?.ssrnId || props.presetData?.ssrnId || "");
        const localNationalId = ref(props.modelValue?.nationalId || props.presetData?.nationalId || "");
        const localCity = ref<any[]>(props.modelValue?.city || props.presetData?.city || []);
        const localEdition = ref<any[]>(props.modelValue?.edition || props.presetData?.edition || []);
        const localGeoSpaceDescription = ref<any[]>(
            props.modelValue?.geoSpaceDescription || props.presetData?.geoSpaceDescription || []
        );
        const localChronologicalSpaceDescription = ref<any[]>(
            props.modelValue?.chronologicalSpaceDescription || props.presetData?.chronologicalSpaceDescription || []
        );
        const localPeerReviewed = ref(props.modelValue?.peerReviewed || props.presetData?.peerReviewed || false);
        const localOpenAccess = ref(props.modelValue?.openAccess || props.presetData?.openAccess || false);
        
        const getPublicationStatusObject = (status: any): { title: string; value: PublicationStatus } => {
            if (status && typeof status === 'object' && 'value' in status) {
                return status as { title: string; value: PublicationStatus };
            }

            if (status && typeof status === 'string') {
                return { 
                    title: getPublicationStatusTitleFromValueAutoLocale(status as PublicationStatus) as string, 
                    value: status as PublicationStatus 
                };
            }
            
            return { 
                title: getPublicationStatusTitleFromValueAutoLocale(PublicationStatus.PUBLISHED) as string, 
                value: PublicationStatus.PUBLISHED 
            };
        };

        const localPublicationStatus = ref<{ title: string; value: PublicationStatus }>(
            getPublicationStatusObject(props.modelValue?.publicationStatus || props.presetData?.publicationStatus)
        );

        const cityRef = ref<typeof MultilingualTextInput>();
        const geoSpaceDescriptionRef = ref<typeof MultilingualTextInput>();
        const chronologicalSpaceDescriptionRef = ref<typeof MultilingualTextInput>();
        const editionRef = ref<typeof MultilingualTextInput>();

        const publicationStatuses = computed(() => getPublicationStatusesForGivenLocale());

        const emitUpdate = () => {
            const data: CommonFieldsData = {
                handleId: localHandleId.value,
                arxivId: localArxivId.value,
                pubmedId: localPubmedId.value,
                ssrnId: localSsrnId.value,
                nationalId: localNationalId.value,
                city: localCity.value,
                geoSpaceDescription: localGeoSpaceDescription.value,
                chronologicalSpaceDescription: localChronologicalSpaceDescription.value,
                peerReviewed: localPeerReviewed.value,
                openAccess: localOpenAccess.value,
                publicationStatus: localPublicationStatus.value.value,
                edition: localEdition.value
            };
            emit("update:modelValue", data);
            emit("change", data);
        };

        watch(() => props.presetData, (newPresetData) => {
            if (newPresetData) {
                refreshForm(newPresetData);
            }
        }, { deep: true });

        watch(() => props.modelValue, (newModelValue) => {
            if (newModelValue) {
                localHandleId.value = newModelValue.handleId || "";
                localArxivId.value = newModelValue.arxivId || "";
                localPubmedId.value = newModelValue.pubmedId || "";
                localSsrnId.value = newModelValue.ssrnId || "";
                localNationalId.value = newModelValue.nationalId || "";
                localCity.value = newModelValue.city || [];
                localEdition.value = newModelValue.edition || [];
                localGeoSpaceDescription.value = newModelValue.geoSpaceDescription || [];
                localChronologicalSpaceDescription.value = newModelValue.chronologicalSpaceDescription || [];
                localPeerReviewed.value = newModelValue.peerReviewed || false;
                localOpenAccess.value = newModelValue.openAccess || false;

                const status = newModelValue.publicationStatus || PublicationStatus.PUBLISHED;
                localPublicationStatus.value = { 
                    title: getPublicationStatusTitleFromValueAutoLocale(status) as string, 
                    value: status
                };
            }
        }, { deep: true });

        const refreshForm = (data: CommonFieldsData) => {
            localHandleId.value = data.handleId || "";
            localArxivId.value = data.arxivId || "";
            localPubmedId.value = data.pubmedId || "";
            localSsrnId.value = data.ssrnId || "";
            localNationalId.value = data.nationalId || "";
            localCity.value = data.city || [];
            localEdition.value = data.edition || [];
            localGeoSpaceDescription.value = data.geoSpaceDescription || [];
            localChronologicalSpaceDescription.value = data.chronologicalSpaceDescription || [];
            localPeerReviewed.value = data.peerReviewed || false;
            localOpenAccess.value = data.openAccess || false;

            const status = data.publicationStatus || PublicationStatus.PUBLISHED;
            localPublicationStatus.value = { 
                title: getPublicationStatusTitleFromValueAutoLocale(status) as string, 
                value: status
            };

            if (cityRef.value && data.city) {
                cityRef.value.forceRefreshModelValue(toMultilingualTextInput(data.city, languageTags.value));
            }

            if (editionRef.value && data.edition) {
                editionRef.value.forceRefreshModelValue(toMultilingualTextInput(data.edition, languageTags.value));
            }

            if (geoSpaceDescriptionRef.value && data.geoSpaceDescription) {
                geoSpaceDescriptionRef.value.forceRefreshModelValue(toMultilingualTextInput(data.geoSpaceDescription, languageTags.value));
            }
            
            if (chronologicalSpaceDescriptionRef.value && data.chronologicalSpaceDescription) {
                chronologicalSpaceDescriptionRef.value.forceRefreshModelValue(toMultilingualTextInput(data.chronologicalSpaceDescription, languageTags.value));
            }
        };

        const clearInputs = () => {
            localHandleId.value = "";
            localArxivId.value = "";
            localPubmedId.value = "";
            localSsrnId.value = "";
            localNationalId.value = "";
            localCity.value = [];
            localEdition.value = [];
            localGeoSpaceDescription.value = [];
            localChronologicalSpaceDescription.value = [];
            localPeerReviewed.value = false;
            localOpenAccess.value = false;
            localPublicationStatus.value = { 
                title: getPublicationStatusTitleFromValueAutoLocale(PublicationStatus.PUBLISHED) as string, 
                value: PublicationStatus.PUBLISHED 
            };

            cityRef.value?.clearInput();
            geoSpaceDescriptionRef.value?.clearInput();
            chronologicalSpaceDescriptionRef.value?.clearInput();
        };

        onMounted(() => {
            if (props.presetData) {
                refreshForm(props.presetData);
            }
        });

        return {
            localHandleId, localEdition,
            localArxivId, localPubmedId,
            localSsrnId, localCity,
            localGeoSpaceDescription,
            localChronologicalSpaceDescription,
            localPeerReviewed, localOpenAccess,
            localPublicationStatus,
            publicationStatuses, editionRef,
            geoSpaceDescriptionRef, cityRef,
            chronologicalSpaceDescriptionRef,
            handleIdValidationRules,
            arxivIdValidationRules,
            pubmedIdValidationRules,
            ssrnIdValidationRules,
            emitUpdate, refreshForm,
            clearInputs, localNationalId
        };
    }
});
</script>
