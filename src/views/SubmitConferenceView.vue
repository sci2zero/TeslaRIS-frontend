<template>
    <v-flex class="text-center">
        <h1>{{ $t("addConferenceLabel") }}</h1>
    </v-flex>
    <br />
    <br />
    <conference-submission-form></conference-submission-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ConferenceSubmissionForm from "@/components/event/ConferenceSubmissionForm.vue";

export default defineComponent({
    name: "SubmitConferenceView",
    components: {ConferenceSubmissionForm},
    setup() {
        
    }
});
</script>