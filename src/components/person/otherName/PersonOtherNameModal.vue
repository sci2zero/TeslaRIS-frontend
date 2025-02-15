<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent max-width="850px">
            <template #activator="scope">
                <v-btn
                    color="primary" dark v-bind="scope.props" :class="readOnly ? 'bottom-spacer' : ''"
                    v-on="scope.isActive">
                    {{ $t("viewAllPersonNamesLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("otherNamesLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col :cols="readOnly ? 4 : 3">
                                    <v-text-field
                                        v-model="primaryName.firstname" :label="$t('firstNameLabel') + (readOnly ? '' : '*')" :placeholder="$t('firstNameLabel')" outlined
                                        :rules="requiredFieldRules" :readonly="readOnly"></v-text-field>
                                </v-col>
                                <v-col v-if="readOnly ? primaryName.otherName : true" :cols="readOnly ? 4 : 3">
                                    <v-text-field
                                        v-model="primaryName.otherName" :label="$t('middleNameLabel')" :placeholder="$t('middleNameLabel')" outlined
                                        :readonly="readOnly"></v-text-field>
                                </v-col>
                                <v-col :cols="readOnly ? 4 : 3">
                                    <v-text-field
                                        v-model="primaryName.lastname" :label="$t('surnameLabel') + (readOnly ? '' : '*')" :placeholder="$t('surnameLabel')" outlined
                                        :rules="requiredFieldRules" :readonly="readOnly"></v-text-field>
                                </v-col>
                            </v-row>
                            <h3 v-if="readOnly && presetPerson && presetPerson.personOtherNames.length === 0">
                                {{ $t("noOtherNamesMessage") }}
                            </h3>
                            <v-row v-for="(element, index) in otherNames" v-else :key="index">
                                <v-col :cols="readOnly ? 4 : 3">
                                    <v-text-field
                                        v-model="element.firstname" :label="$t('firstNameLabel') + (readOnly ? '' : '*')" :placeholder="$t('firstNameLabel')" outlined
                                        :rules="requiredFieldRules" :readonly="readOnly"></v-text-field>
                                </v-col>
                                <v-col v-if="readOnly ? element.otherName : true" :cols="readOnly ? 4 : 3">
                                    <v-text-field
                                        v-model="element.otherName" :label="$t('middleNameLabel')" :placeholder="$t('middleNameLabel')" outlined
                                        :readonly="readOnly"></v-text-field>
                                </v-col>
                                <v-col :cols="readOnly ? 4 : 3">
                                    <v-text-field
                                        v-model="element.lastname" :label="$t('surnameLabel') + (readOnly ? '' : '*')" :placeholder="$t('surnameLabel')" outlined
                                        :rules="requiredFieldRules" :readonly="readOnly"></v-text-field>
                                </v-col>
                                <v-col cols="3">
                                    <v-btn v-if="!readOnly && ((presetPerson && presetPerson.personOtherNames?.length > 0))" icon @click="removeOtherName(index)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                    <v-btn v-if="!readOnly && element.id" icon @click="selectOtherName(element)">
                                        <v-icon>mdi-check-circle</v-icon>
                                    </v-btn>
                                    <v-btn v-if="!readOnly && (index === otherNames.length - 1)" icon @click="addOtherName">
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
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn v-if="!readOnly" color="blue darken-1" :disabled="!isFormValid" @click="update">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { useValidationUtils } from "@/utils/ValidationUtils";
import type { PropType } from "vue";
import type { PersonName, PersonResponse } from "@/models/PersonModel";
import { watch } from "vue";


export default defineComponent({
    name: "PersonOtherNameModal",
    props: {
        presetPerson: {
            type: Object as PropType<PersonResponse | undefined>,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: true,
        }
    },
    emits: ["selectPrimary", "update"],
    setup(props, {emit}) {
        const dialog = ref(false);
        const isFormValid = ref(false);

        const primaryName = ref<PersonName>({firstname: "", lastname: "", otherName: ""});
        const otherNames = ref<PersonName[]>([]);

        const { requiredFieldRules } = useValidationUtils();

        watch(() => props.presetPerson, () => {
            if (props.presetPerson && props.presetPerson.personOtherNames.length > 0) {
                otherNames.value = [];
                props.presetPerson.personOtherNames.forEach((personName) => {
                    otherNames.value.push({id: personName.id, firstname: personName.firstname, lastname: personName.lastname, otherName: personName.otherName});
                });
            }

            if (props.presetPerson) {
                const personName = props.presetPerson.personName;
                primaryName.value = {id: personName.id, firstname: personName.firstname, lastname: personName.lastname, otherName: personName.otherName};
            }
        });

        const addOtherName = () => {
            otherNames.value.push({firstname: "", lastname: "", otherName: ""});
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
            otherNames.value.forEach(personName => newOtherNames.push({id: personName.id, firstname: personName.firstname, lastname: personName.lastname, otherName: personName.otherName}));
            emit("update", primaryName.value, newOtherNames);
            dialog.value = false;
        };

        return { dialog, isFormValid, requiredFieldRules,
                addOtherName, otherNames, removeOtherName,
                update, selectOtherName, primaryName };
    }
});
</script>
