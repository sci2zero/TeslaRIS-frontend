<template>
    <div
        v-if="!cancellationComplete"
        class="d-flex flex-row justify-center">
        <h1> {{ $t("cancelAttendanceMessage") }}</h1>
    </div>
    <div
        v-if="!cancellationComplete"
        class="d-flex flex-row justify-center mt-5">
        <v-btn
            density="comfortable" class="bottom-spacer"
            color="primary"
            @click="cancelAttendance">
            {{ $t("cancelAttendanceLabel") }}
        </v-btn>
    </div>
    <div v-else class="d-flex flex-row justify-centers mt-5">
        <h1> {{ $t("cancellationCompleteMessage") }}</h1>
    </div>
</template>

<script lang="ts">
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';


export default defineComponent({
    name: "CancelAttendanceView",
    setup() {
        const currentRoute = useRoute();
        const cancellationComplete = ref(false);

        const cancelAttendance = () => {
            RegistryBookService.cancelAttendance(
                currentRoute.params.attendanceIdentifier as string
            ).then(() => {
                cancellationComplete.value = true;
            });
        };
    
        return {
            cancelAttendance,
            cancellationComplete
        };
    }
});
</script>
