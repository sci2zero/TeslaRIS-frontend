<template>
    <div justify="start" :class="{ 'contents': hideActivator }">
        <v-dialog
            v-model="dialog"
            :persistent="!readOnly && edited"
            max-width="1200px"
            @click:outside="onClickOutside"
            @keydown.esc="onClickOutside">
            <template v-if="!hideActivator" #activator="scope">
                <v-btn
                    color="primary" dark
                    density="compact"
                    variant="outlined"
                    v-bind="scope.props"
                    :class="readOnly ? 'bottom-spacer' : ''"
                    :disabled="readOnly && otherNames.length === 0">
                    {{ $t("viewAllPersonNamesLabel") }}
                </v-btn>
            </template>
            <v-card
                ref="cardRef"
                class="bg-slate-100"
                @pointerdown.capture="onPointerDown"
                @keydown.capture="onKeyDown"
                @input.capture="onFieldEvent"
                @change.capture="onFieldEvent"
            >
                <v-card-title>
                    <span class="text-h5">{{ $t("otherNamesLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col cols="3">
                                    <ui-input
                                        v-model="primaryName.firstname"
                                        :label="$t('firstNameLabel') + (readOnly ? '' : '*')"
                                        :placeholder="$t('firstNameLabel')"
                                        :rules="requiredFieldRules" :readonly="readOnly">
                                        <template #append-inner>
                                            <v-btn 
                                                icon
                                                variant="text"
                                                class="ml-2"
                                                @click="[primaryName.firstname, primaryName.lastname] = [primaryName.lastname, primaryName.firstname]">
                                                <v-icon>mdi-swap-horizontal</v-icon>
                                            </v-btn>
                                        </template>
                                    </ui-input>
                                </v-col>
                                <v-col v-if="readOnly ? primaryName.otherName : true" :cols="readOnly ? 3 : 2">
                                    <ui-input
                                        v-model="primaryName.otherName"
                                        :label="$t('middleNameLabel')"
                                        :readonly="readOnly" />
                                </v-col>
                                <v-col cols="3">
                                    <ui-input
                                        v-model="primaryName.lastname"
                                        :label="$t('surnameLabel') + (readOnly ? '' : '*')"
                                        :placeholder="$t('surnameLabel')"
                                        :rules="requiredFieldRules" 
                                        :readonly="readOnly" />
                                </v-col>
                                <v-col :cols="readOnly ? 3 : 2">
                                    <ui-input
                                        v-model="primaryName.personNameType"
                                        control="select"
                                        :items="nameTypes"
                                        :label="$t('nameTypeLabel') + (readOnly ? '' : '*')"
                                        :rules="requiredSelectionRules"
                                        :readonly="readOnly"
                                        item-title="title"
                                        item-value="value"
                                    >
                                        <template #item="{ props, item }">
                                            <v-list-item
                                                :title="item.raw.title"
                                                v-bind="props"
                                                :subtitle="undefined"
                                            />
                                        </template>
                                    </ui-input>
                                </v-col>
                            </v-row>
                            <h3 v-if="readOnly && presetPerson && presetPerson.personOtherNames.length === 0">
                                {{ $t("noOtherNamesMessage") }}
                            </h3>
                            <v-row v-for="(element, index) in otherNames" v-else :key="index">
                                <v-col cols="3">
                                    <ui-input
                                        v-model="element.firstname"
                                        :label="$t('firstNameLabel') + (readOnly ? '' : '*')"
                                        :placeholder="$t('firstNameLabel')"
                                        :rules="requiredFieldRules" :readonly="readOnly">
                                        <template #append-inner>
                                            <v-btn 
                                                icon
                                                variant="text"
                                                class="ml-2"
                                                @click="[element.firstname, element.lastname] = [element.lastname, element.firstname]">
                                                <v-icon>mdi-swap-horizontal</v-icon>
                                            </v-btn>
                                        </template>
                                    </ui-input>
                                </v-col>
                                <v-col v-if="readOnly ? element.otherName : true" :cols="readOnly ? 3 : 2">
                                    <ui-input
                                        v-model="element.otherName"
                                        :label="$t('middleNameLabel')"
                                        :readonly="readOnly" />
                                </v-col>
                                <v-col cols="3">
                                    <ui-input
                                        v-model="element.lastname"
                                        :label="$t('surnameLabel') + (readOnly ? '' : '*')"
                                        :placeholder="$t('surnameLabel')"
                                        :rules="requiredFieldRules"
                                        :readonly="readOnly" />
                                </v-col>
                                <v-col :cols="readOnly ? 3 : 2">
                                    <ui-input
                                        v-model="element.personNameType"
                                        control="select"
                                        :items="nameTypes"
                                        :label="$t('nameTypeLabel') + (readOnly ? '' : '*')"
                                        :rules="requiredSelectionRules"
                                        :readonly="readOnly"
                                        item-title="title"
                                        item-value="value"
                                    >
                                        <template #item="{ props, item }">
                                            <v-list-item
                                                :title="item.raw.title"
                                                v-bind="props"
                                                :subtitle="undefined"
                                            />
                                        </template>
                                    </ui-input>
                                </v-col>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-btn
                                        v-if="!readOnly && ((presetPerson && presetPerson.personOtherNames?.length > 0))"
                                        icon
                                        @click="removeOtherName(index)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                    <v-btn
                                        v-if="!readOnly && element.id"
                                        icon
                                        @click="selectOtherName(element)">
                                        <v-icon>mdi-check-circle</v-icon>
                                    </v-btn>
                                    <v-btn
                                        v-if="!readOnly && (index === otherNames.length - 1)"
                                        icon
                                        @click="addOtherName">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-btn v-if="!readOnly && (otherNames.length === 0)" icon @click="addOtherName">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-container>
                    <p v-if="!readOnly" class="required-fields-message">
                        {{ $t("requiredFieldsMessage") }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn v-if="!readOnly" color="blue darken-1" :disabled="!isFormValid" @click="update">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <persistent-question-dialog
            v-if="!readOnly"
            v-model="confirmClose"
            :title="$t('areYouSureLabel')"
            :message="$t('unsavedChangesMessage')"
            :cancel-text="$t('keepEditingLabel')"
            :continue-text="$t('closeLabel')"
            emphasize-cancel
            @continue="discardChanges"
        />
    </div>
</template>

<script lang="ts">
import { computed, ref } from "vue";
import { defineComponent } from "vue";
import { useValidationUtils } from "@/utils/ValidationUtils";
import type { PropType } from "vue";
import { PersonNameType, type PersonName, type PersonResponse } from "@/models/PersonModel";
import { watch } from "vue";
import { getPersonNameTypesForGivenLocale } from "@/i18n/personNameType";
import { usePersistentWhenEdited } from "@/composables/usePersistentWhenEdited";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import UiInput from "@/components/ui/input/Input.vue";


export default defineComponent({
    name: "PersonOtherNameModal",
    components: { UiInput, PersistentQuestionDialog },
    props: {
        presetPerson: {
            type: Object as PropType<PersonResponse | undefined>,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: true,
        },
        hideActivator: {
            type: Boolean,
            default: false,
        }
    },
    emits: ["selectPrimary", "update"],
    setup(props, {emit}) {
        const dialog = ref(false);
        const isFormValid = ref(false);
        const cardRef = ref<{ $el?: HTMLElement } | null>(null);
        const { edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges } = usePersistentWhenEdited(
            dialog,
            () => cardRef.value?.$el ?? null,
            computed(() => !props.readOnly)
        );

        const primaryName = ref<PersonName>({firstname: "", lastname: "", otherName: "", personNameType: PersonNameType.DISPLAY_NAME});
        const otherNames = ref<PersonName[]>([]);

        const nameTypes = getPersonNameTypesForGivenLocale();

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        watch(() => props.presetPerson, () => {
            if (props.presetPerson && props.presetPerson.personOtherNames.length > 0) {
                otherNames.value = [];
                props.presetPerson.personOtherNames.forEach((personName) => {
                    otherNames.value.push({
                        id: personName.id, 
                        firstname: personName.firstname, 
                        lastname: personName.lastname, 
                        otherName: personName.otherName, 
                        personNameType: personName.personNameType ? personName.personNameType : PersonNameType.DISPLAY_NAME
                    });
                });
            }

            if (props.presetPerson) {
                const personName = props.presetPerson.personName;
                primaryName.value = {
                    id: personName.id, 
                    firstname: personName.firstname, 
                    lastname: personName.lastname, 
                    otherName: personName.otherName, 
                    personNameType: personName.personNameType ? personName.personNameType : PersonNameType.FULL_NAME
                };
            }
        });

        const addOtherName = () => {
            otherNames.value.push({firstname: "", lastname: "", otherName: "", personNameType: PersonNameType.DISPLAY_NAME});
        };

        const removeOtherName = (index: number) => {
            otherNames.value.splice(index, 1);
        };

        const selectOtherName = (otherName: PersonName) => {
            emit("selectPrimary", otherName.id);
            dialog.value = false;
        };

        const update = () => {
            const newOtherNames: PersonName[] = [];
            otherNames.value.forEach(personName => newOtherNames.push({
                id: personName.id, 
                firstname: personName.firstname, 
                lastname: personName.lastname, 
                otherName: personName.otherName, 
                personNameType: personName.personNameType
            }));
            emit("update", primaryName.value, newOtherNames);
            dialog.value = false;
        };

        return { 
            dialog, cardRef, edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges,
            isFormValid, requiredFieldRules,
            addOtherName, otherNames, removeOtherName,
            update, selectOtherName, primaryName,
            nameTypes, requiredSelectionRules
        };
    }
});
</script>
