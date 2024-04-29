<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="850px">
            <template #activator="scope">
                <v-btn
                    color="primary" dark v-bind="scope.props" style="margin-bottom: 20px;"
                    v-on="scope.isActive">
                    {{ $t("viewOtherNamesLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("otherNamesLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <h3 v-if="readOnly && presetOtherNames && presetOtherNames.length === 0">
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
                                    <v-btn v-if="!readOnly && ((presetOtherNames && presetOtherNames?.length > 0) || index > 0)" icon @click="removeOtherName(index)">
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
                        </v-form>
                    </v-container>
                    <p v-if="!readOnly" style="margin-left: 20px;">
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
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { useValidationUtils } from "@/utils/ValidationUtils";
import type { PropType } from "vue";
import type { PersonName } from "@/models/PersonModel";
import { watch } from "vue";


export default defineComponent({
    name: "PersonOtherNameModal",
    props: {
        presetOtherNames: {
            type: Array as PropType<PersonName[] | undefined>,
            required: true,
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

        const otherNames = ref<PersonName[]>([{firstname: "", lastname: "", otherName: ""}]);

        const { requiredFieldRules } = useValidationUtils();

        watch(() => props.presetOtherNames, () => {
            if (props.presetOtherNames && props.presetOtherNames.length > 0) {
                otherNames.value = [];
                props.presetOtherNames.forEach((personName) => {
                    otherNames.value.push({id: personName.id, firstname: personName.firstname, lastname: personName.lastname, otherName: personName.otherName});
                });
            } else {
                otherNames.value = [{firstname: "", lastname: "", otherName: ""}];
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
            emit("update", newOtherNames);
            dialog.value = false;
        };

        return { dialog, isFormValid, requiredFieldRules,
                addOtherName, otherNames, removeOtherName,
                update, selectOtherName };
    }
});
</script>
