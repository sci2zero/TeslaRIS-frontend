<template>
    <v-row>
        <v-col cols="11">
            <v-text-field
                ref="doiInputRef"
                v-model="doi"
                label="DOI"
                placeholder="DOI"
                :rules="doiValidationRules">
            </v-text-field>
            <p v-if="errorMessage" class="text-red ml-1">
                {{ errorMessage }} {{ harvestedDocumentType }}
            </p>
        </v-col>
        <v-col v-if="isLoading" cols="1">
            <v-progress-circular
                color="primary"
                indeterminate
                class="mt-3"
            ></v-progress-circular>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';
import { PublicationType } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import MetadataPrepopulationService from '@/services/MetadataPrepopulationService';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { computed, defineComponent, nextTick, onMounted, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { VTextField } from 'vuetify/lib/components/index.mjs';


export default defineComponent({
    name: "IDFMetadataPrepopulator",
    props: {
        documentType: {
            type: Object as PropType<PublicationType>,
            required: true
        },
        autoFocus: {
            type: Boolean,
            default: true
        }
    },
    emits: ["metadataFetched"],
    setup(props, { emit }) {
        const doi = ref("");

        const doiInputRef = ref<InstanceType<typeof VTextField> | null>(null);

        const i18n = useI18n();
        const mismatchedTypesMessage = computed(() => i18n.t("mismatchedPublicationTypesMessage"));
        
        const errorMessage = ref("");
        const harvestedDocumentType = ref("");

        const isLoading = ref(false);

        const { doiValidationRules } = useValidationUtils();

        onMounted(() => {
            nextTick(() => {
                if (doiInputRef.value && props.autoFocus) {
                    doiInputRef.value.focus();
                }
            });
        });

        watch(doi, async () => {
            if (doi.value.startsWith("https://doi.org/")) {
                doi.value = doi.value.replace("https://doi.org/", "");
                return;
            }

            errorMessage.value = "";
            if (doi.value && doiValidationRules[0](doi.value) === true) {
                const isDoiInUse = await DocumentPublicationService.checkDoiUsage(doi.value);
                if (isDoiInUse.data) {
                    errorMessage.value = i18n.t("doiExistsError");
                    return;
                }

                isLoading.value = true;
                MetadataPrepopulationService.fetchMetadataForDoi(
                    doi.value
                ).then(response => {
                    isLoading.value = false;
                    if (response.data.documentPublicationType && response.data.documentPublicationType !== props.documentType) {
                        harvestedDocumentType.value = getPublicationTypeTitleFromValueAutoLocale(response.data.documentPublicationType) as string;
                        errorMessage.value = mismatchedTypesMessage.value;
                        return;
                    }

                    if (response.data.doi === null) {
                        errorMessage.value = i18n.t("unableToFetchMetadataMessage");
                        return;
                    }

                    emit("metadataFetched", response.data)
                }).catch(() => {
                    isLoading.value = false;
                    errorMessage.value = i18n.t("unableToFetchMetadataMessage");
                });
            }
        });

        return {
            doi, errorMessage,
            doiValidationRules,
            isLoading, doiInputRef,
            harvestedDocumentType
        };
    }
});
</script>
