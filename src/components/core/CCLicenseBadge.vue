<template>
    <v-tooltip class="license-tooltip" location="top" width="500px">
        <template #activator="{ props }">
            <v-img
                v-bind="props"
                :src="src"
                :alt="`CC License - ${license}`"
                width="90"
                height="40"
                class="ml-2 cc-badge"
            />
        </template>
        <div>
            <strong>{{ $t(`licenses.${license}.title`) }}</strong><br>
            <p>{{ $t(`licenses.${license}.description`) }}</p>
        </div>
    </v-tooltip>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import by_nc_nd from '@/assets/creativeCommonsLicenses/by_nc_nd.svg';
import by_nc_sa from '@/assets/creativeCommonsLicenses/by_nc_sa.svg';
import by_nc from '@/assets/creativeCommonsLicenses/by_nc.svg';
import by_nd from '@/assets/creativeCommonsLicenses/by_nd.svg';
import by_sa from '@/assets/creativeCommonsLicenses/by_sa.svg';
import by from '@/assets/creativeCommonsLicenses/by.svg';
import cc0 from '@/assets/creativeCommonsLicenses/cc0.svg';


export default defineComponent({
    name: "CCLicenseBadge",
    props: {
        license: {
            type: String,
            required: true,
        }
    },
    setup(props) {
        const licenseMap: Record<string, string> = {
            'by_nc_nd': by_nc_nd,
            'by_nc_sa': by_nc_sa,
            'by_nc': by_nc,
            'by_nd': by_nd,
            'by_sa': by_sa,
            'by': by,
            'cc0': cc0
        };

        const src = computed(() => licenseMap[props.license.toLowerCase()]);
        return {
            src
        };
    }
});
</script>
  
<style>

    .license-tooltip {
        max-width: 250px;
        white-space: normal;
    }

    .cc-badge img {
        object-fit: cover !important;
    }

</style>
  