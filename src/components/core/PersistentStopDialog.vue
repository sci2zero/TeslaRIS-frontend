<template>
    <v-dialog
        v-model="dialog"
        max-width="400"
        persistent
    >
        <v-card
            prepend-icon="mdi-map-marker"
            :text="text"
            :title="$t('actionNotAllowedLabel')"
        >
            <template #actions>
                <v-spacer></v-spacer>
                <v-btn @click="goBack">
                    {{ $t("goBackLabel") }}
                </v-btn>
            </template>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';


export default defineComponent({
    name: "PersistentStopDialog",
    props: {
        text: {
            type: String,
            required: true
        }
    },
    setup() {
        const dialog = ref(true);
        const router = useRouter();

        const goBack = () => {
            router.back();
        };

        return {
            dialog, goBack
        };
}})

</script>
