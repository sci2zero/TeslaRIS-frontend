<template>
    <v-sheet
        class="d-flex align-center flex-column mt-12"
        height="200"
    >
        <v-row class="d-flex flex-row justify-center">
            <h2>{{ $t("redirectingToMessage", [url]) }}</h2>
        </v-row>
        <v-row class="d-flex flex-row justify-center">
            <v-progress-circular
                :size="70"
                :width="7"
                color="blue"
                indeterminate
            ></v-progress-circular>
        </v-row>
        <v-row class="d-flex flex-row justify-center">
            <h3>{{ $t("doNotCloseMessage") }}</h3>
        </v-row>
    </v-sheet>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
    name: "ExternalRedirect",
    props: {
        url: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const { url } = props;

        onMounted(() => {
            window.location.href = url as string;
        });
    },
});
</script>