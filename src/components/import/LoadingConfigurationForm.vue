<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row class="d-flex flex-row justify-center ml-15">
            <v-col cols="12" sm="4" md="2">
                <v-checkbox v-model="smartLoadingByDefault" :label="$t('smartLoadingByDefaultLabel')" />
            </v-col>
            <v-col cols="12" sm="4" md="2">
                <v-checkbox v-model="loadedEntitiesAreUnamanged" :label="$t('loadedEntitiesAreUnamangedLabel')" />
            </v-col>
            <v-col cols="12" sm="4" md="2">
                <v-checkbox v-model="priorityLoading" :label="$t('priorityLoadingLabel')" />
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import LoadingConfigurationService from '@/services/importer/LoadingConfigurationService';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "LoadingConfigurationForm",
    props: {
        topLevelInstitutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const smartLoadingByDefault = ref(false);
        const loadedEntitiesAreUnamanged = ref(false);
        const priorityLoading = ref(false);

        const canSave = ref(false);

        const { isAdmin } = useUserRole();

        onMounted(() => {
            loadFormData();
        });

        const loadFormData = () => {
            LoadingConfigurationService.fetchLoadingConfiguration(
                isAdmin.value ? props.topLevelInstitutionId : null
            ).then(response => {
                smartLoadingByDefault.value = response.data.smartLoadingByDefault;
                loadedEntitiesAreUnamanged.value = response.data.loadedEntitiesAreUnmanaged;
                priorityLoading.value = response.data.priorityLoading;
                canSave.value = true;
            });
        };

        watch(() => props.topLevelInstitutionId, () => {
            if (props.topLevelInstitutionId > 0) {
                loadFormData();
            }
        });

        watch([
            smartLoadingByDefault,
            loadedEntitiesAreUnamanged,
            priorityLoading
        ], () => {
            if (!canSave.value) {
                return;
            }

            LoadingConfigurationService.saveLoadingConfiguration(
                {
                    loadedEntitiesAreUnmanaged: loadedEntitiesAreUnamanged.value,
                    smartLoadingByDefault: smartLoadingByDefault.value,
                    priorityLoading: priorityLoading.value
                },
                isAdmin.value ? props.topLevelInstitutionId : null
            ).then(() => {
                emit("update");
            });
        });

        return {
            isFormValid, priorityLoading,
            smartLoadingByDefault,
            loadedEntitiesAreUnamanged
        };
    }
});
</script>
