<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedIdentifier"
                    :items="applicableIdentifiers"
                    :label="$t('identifierLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                    :readonly="presetIdentifier !== undefined"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    ref="form"
                    v-model="identifierValue"
                    :label="$t('valueLabel') + '*'"
                    :placeholder="$t('valueLabel') + '*'"
                    :rules="[...requiredFieldRules, identifierRegexRule]"
                />
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, type PropType } from 'vue';
import { ref } from 'vue';
import { ApplicableEntityType } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { DocumentIdentifier, EntityIdentifier, EntityIdentifierResponse, EventIdentifier, IdentifierResponse, OrganisationUnitIdentifier, PersonIdentifier, PublicationSeriesIdentifier } from '@/models/IdentifierModel';
import IdentifierService from '@/services/IdentifierService';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "EntityIdentifierForm",
    props: {
        presetIdentifier: {
            type: Object as PropType<EntityIdentifierResponse | undefined>,
            default: undefined
        },
        applicableTypes: {
            type: Array<ApplicableEntityType>,
            required: true
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        entityType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const i18n = useI18n();

        const applicableIdentifiersRaw = ref<IdentifierResponse[]>([]);
        const applicableIdentifiers = ref<{title: string, value: number}[]>([]);

        onMounted(() => {
            fetchDetails();
        });

        const form = ref<HTMLFormElement | null>(null);

        const fetchDetails = () => {
            IdentifierService.fetchIdentifiersForApplicableTypes(props.applicableTypes).then(response => {
                applicableIdentifiers.value.splice(0);
                applicableIdentifiersRaw.value.splice(0);

                response.data.forEach(identifier => {
                    applicableIdentifiersRaw.value.push(identifier);
                    applicableIdentifiers.value.push({title: returnCurrentLocaleContent(identifier.title) as string, value: identifier.id});
                });

                if(props.presetIdentifier) {
                    selectedIdentifier.value = 
                        {
                            title: returnCurrentLocaleContent(props.presetIdentifier.identifierResponse.title) as string,
                            value: props.presetIdentifier.identifierResponse.id
                        };
                }

                nextTick(() => {
                    form.value?.validate();
                });
            });
        };

        const selectedIdentifier = ref<{ title: string, value: number }>({title: "", value: -1});
        
        const identifierValue = ref<string>(props.presetIdentifier?.value as string);

        const { requiredFieldRules, requiredSelectionRules, requiredNumericFieldRules } = useValidationUtils();

        const submit = () => {
            const entityIdentifier: EntityIdentifier = {
                value: identifierValue.value,
                identifierId: selectedIdentifier.value?.value as number,
            };

            if (props.entityType === ApplicableEntityType.DOCUMENT) {
                (entityIdentifier as DocumentIdentifier).documentId = props.entityId as number
            } else if (props.entityType === ApplicableEntityType.EVENT) {
                (entityIdentifier as EventIdentifier).eventId = props.entityId as number
            } else if (props.entityType === ApplicableEntityType.PERSON) {
                (entityIdentifier as PersonIdentifier).personId = props.entityId as number
            } else if (props.entityType === ApplicableEntityType.ORGANISATION_UNIT) {
                (entityIdentifier as OrganisationUnitIdentifier).organisationUnitId = props.entityId as number
            } else if (props.entityType === ApplicableEntityType.PUBLICATION_SERIES) {
                (entityIdentifier as PublicationSeriesIdentifier).publicationSeriesId = props.entityId as number
            }

            emit("create", { identifier: entityIdentifier });
        };

        const identifierRegexRule = computed(() => {
            return (value: string) => {
                if (!value) {
                    return false;
                }

                const regex = applicableIdentifiersRaw.value
                    .find(identifier => identifier.id === selectedIdentifier.value.value)?.regularExpression;

                if (!regex) {
                    return true;
                }

                try {
                    const re = new RegExp(`^(?:${regex})$`);
                    return re.test(value) || i18n.t("entityIdentifierRegexMismatchMessage");
                } catch (_e) {
                    return i18n.t("entityIdentifierRegexMismatchMessage");
                }
            };
        });

        return {
            isFormValid, identifierValue, submit, form,
            requiredFieldRules, requiredSelectionRules,
            applicableIdentifiers, selectedIdentifier,
            requiredNumericFieldRules, identifierRegexRule
        };
    }
});
</script>
