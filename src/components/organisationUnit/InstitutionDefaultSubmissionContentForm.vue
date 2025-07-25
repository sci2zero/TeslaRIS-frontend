<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="placeOfKeepRef"
                            v-model="placeOfKeep"
                            :label="$t('placeOfKeepLabel')"
                            :initial-value="toMultilingualTextInput(oldContent?.placeOfKeep, languageTags)">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="typeOfTitleRef"
                            v-model="typeOfTitle"
                            :label="$t('typeOfTitleLabel')"
                            :initial-value="toMultilingualTextInput(oldContent?.typeOfTitle, languageTags)">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { InstitutionDefaultSubmissionContent } from "@/models/OrganisationUnitModel";
import { getErrorMessageForErrorKey } from '@/i18n';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import InstitutionDefaultSubmissionContentService from '@/services/InstitutionDefaultSubmissionContentService';


export default defineComponent({
    name: "InstitutionDefaultSubmissionContentForm",
    components: {MultilingualTextInput},
    props: {
        institutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const message = ref("");

        const placeOfKeepRef = ref<typeof MultilingualTextInput>();
        const typeOfTitleRef = ref<typeof MultilingualTextInput>();

        const placeOfKeep = ref<any[]>([]);
        const typeOfTitle = ref<any[]>([]);

        const oldContent = ref<InstitutionDefaultSubmissionContent>();

        const { languageTags } = useLanguageTags();
        watch(() => languageTags.value, () => {
            presetContent();
        });

        const presetContent = async () => {
            InstitutionDefaultSubmissionContentService.getContentForInstitution(
                props.institutionId
            ).then(response => {
                oldContent.value = response.data;
            });
        };

        const submit = () => {
            const newContent: InstitutionDefaultSubmissionContent = {
                placeOfKeep: placeOfKeep.value,
                typeOfTitle: typeOfTitle.value
            };

            InstitutionDefaultSubmissionContentService.saveContent(
                props.institutionId, newContent
            ).then(() => {
                emit("update");
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        return {
            isFormValid, 
            additionalFields,
            snackbar, message,
            submit, placeOfKeep,
            typeOfTitle, placeOfKeepRef,
            typeOfTitleRef, oldContent,
            toMultilingualTextInput,
            languageTags
        };
    }
});
</script>

