<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <multilingual-text-input :rules="requiredFieldRules" :label="$t('nameLabel') + '*'" @set-input="name = $event"></multilingual-text-input>
        <multilingual-text-input :label="$t('nameAbbreviationLabel')" @set-input="nameAbbreviation = $event"></multilingual-text-input>
        <v-row>
            <v-checkbox v-model="serialEvent" :label="$t('serialEventLabel')"></v-checkbox>
        </v-row>
        <h3>{{ $t("tookPlaceLabel") }}</h3>
        <v-row>
            <v-col v-if="timePeriodInput" cols="2">
                <v-text-field v-model="dateFrom" type="date" :label="$t('fromLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
            <v-col v-if="timePeriodInput" cols="2">
                <v-text-field v-model="dateTo" type="date" :label="$t('toLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
            <v-col v-if="!timePeriodInput" cols="4">
                <v-text-field
                    v-model="eventYear" type="number" :min="1950" :max="2030"
                    :label="$t('eventYearLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
            <v-col>
                <v-btn color="blue darken-1" compact @click="timePeriodInput = !timePeriodInput">
                    {{ timePeriodInput ? $t("dontKnowExactDateLabel") : $t("rememberedDateLabel") }}
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-autocomplete v-model="state" :label="$t('stateLabel')" :items="countryList"></v-autocomplete>
            </v-col>
        </v-row>
        <multilingual-text-input :label="$t('placeLabel')" @set-input="place = $event"></multilingual-text-input>
        <multilingual-text-input :is-area="true" :label="$t('descriptionLabel')" @set-input="description = $event"></multilingual-text-input>
        <multilingual-text-input :label="$t('keywordsLabel')" @set-input="keywords = $event"></multilingual-text-input>
        
        <v-row>
            <v-col cols="3">
                <v-text-field
                    v-model="conferenceNumber"
                    :label="$t('conferenceNumberLabel')"
                ></v-text-field>
            </v-col>
            <v-col cols="3">
                <v-text-field
                    v-model="entryFee"
                    :label="$t('entryFeeLabel')"
                ></v-text-field>
            </v-col>
        </v-row>
        
        <v-row>
            <p style="margin-left: 20px;">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>

        <v-row justify="center">
            <v-btn color="blue darken-1" :disabled="!isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="addConference">
                {{ $t("saveLabel") }}
            </v-btn>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { countriesSr, countriesEn } from "@/i18n/countries";

export default defineComponent({
    name: "ConferenceSubmissionForm",
    components: {MultilingualTextInput},
    setup() {
        const isFormValid = ref(false);
        const timePeriodInput = ref(true);

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

        const countryList = computed(() => {
            if (i18n.locale.value === "sr") {
                return countriesSr;
            } else {
                return countriesEn;
            }
        })

        const name = ref();
        const nameAbbreviation = ref();
        const description = ref();
        const keywords = ref();
        const dateFrom = ref();
        const dateTo = ref();
        const eventYear = ref(new Date().getFullYear());
        const state = ref();
        const place = ref();
        const conferenceNumber = ref();
        const entryFee = ref();
        const serialEvent = ref(false);

        const requiredFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];

        const addConference = () => {
            console.log(name.value, nameAbbreviation.value)
        }

        return {isFormValid, 
            name, nameAbbreviation, description, 
            keywords, dateFrom, dateTo, eventYear, state, countryList, place, 
            conferenceNumber, entryFee, serialEvent,
            requiredFieldRules, addConference, timePeriodInput};
    }
});
</script>