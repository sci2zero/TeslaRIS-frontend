<template>
    <v-card
        class="rounded-xl pa-6 text-center total-count-card"
        elevation="6">
        <v-card-title class="justify-center text-h6">
            {{ label }}
        </v-card-title>
        <v-card-text class="d-flex flex-column align-center justify-center">
            <h1 v-if="displayValue >= 0" class="text-h2 font-weight-bold">
                {{ displayValue }}
            </h1>
            <v-progress-circular
                v-else
                color="primary"
                indeterminate
            ></v-progress-circular>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">

defineProps({
    displayValue: {
        type: Number,
        required: true
    },
    label: {
        type: String,
        required: true
    }
});

</script>
