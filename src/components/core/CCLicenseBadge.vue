<template>
    <v-tooltip location="top" width="500px">
        <template #activator="{ props }">
            <v-img
                v-bind="props"
                :src="`/src/assets/creativeCommonsLicenses/${license.toLowerCase()}.svg`"
                :alt="`CC License - ${license}`"
                width="90"
                height="90"
                class="ml-2"
            />
        </template>
        <div>
            <strong>{{ $t(`licenses.${license}.title`) }}</strong><br>
            <p>{{ $t(`licenses.${license}.description`) }}</p>
        </div>
    </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({
    name: "CCLicenseBadge",
    props: {
        license: {
            type: String,
            required: true,
       }
    },
    setup() {
        return {
            //
        };
    }
});
</script>
  
<style scoped>

    .v-tooltip {
        max-width: 250px;
        white-space: normal;
    }

</style>
  