<template>
    <div class="not-implemented">
        <h1>{{ $t("notImplementedYetLabel") }}</h1>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";


export default defineComponent({
    name: "RepositoryTrendsTab",
    props: {
        profileName: {
            type: String,
            default: undefined
        },
        assessmentDate: {
            type: String,
            default: undefined
        }
    }
});
</script>

<style scoped>
.not-implemented {
    padding: 40px 0;
    text-align: center;
}
</style>
