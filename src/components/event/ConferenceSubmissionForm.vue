<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <multilingual-text-input :rules="requiredFieldRules" :label="$t('nameLabel')" @set-input="name = $event"></multilingual-text-input>
        <multilingual-text-input :label="$t('nameAbbreviationLabel')" @set-input="nameAbbreviation = $event"></multilingual-text-input>
        <multilingual-text-input :is-area="true" :label="$t('descriptionLabel')" @set-input="description = $event"></multilingual-text-input>
        <multilingual-text-input :label="$t('keywordsLabel')" @set-input="keywords = $event"></multilingual-text-input>
        <v-row>
            <v-checkbox v-model="serialEvent" :label="$t('serialEventLabel')"></v-checkbox>
        </v-row>
        <h3>{{ $t("tookPlaceLabel") }}</h3>
        <v-row>
            <v-col cols="2">
                <v-text-field v-model="dateFrom" type="date" :label="$t('fromLabel')"></v-text-field>
            </v-col>
            <v-col cols="2">
                <v-text-field v-model="dateTo" type="date" :label="$t('toLabel')"></v-text-field>
            </v-col>
        </v-row>
        <multilingual-text-input :label="$t('stateLabel')" @set-input="state = $event"></multilingual-text-input>
        <multilingual-text-input :label="$t('placeLabel')" @set-input="place = $event"></multilingual-text-input>
        
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

export default defineComponent({
    name: "ConferenceSubmissionForm",
    components: {MultilingualTextInput},
    setup() {
        const isFormValid = ref(false);

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

        const name = ref();
        const nameAbbreviation = ref();
        const description = ref();
        const keywords = ref();
        const dateFrom = ref();
        const dateTo = ref();
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
            keywords, dateFrom, dateTo, state, place, 
            conferenceNumber, entryFee, serialEvent, 
            requiredFieldRules, addConference};
    }
});
</script>