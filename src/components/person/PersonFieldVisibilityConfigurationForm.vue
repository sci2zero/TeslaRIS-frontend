<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="phoneNumberVisible"
                    :label="$t('phoneNumberVisibleLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="contactEmailVisible"
                    :label="$t('contactEmailVisibleLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="dateOfBirthVisible"
                    :label="$t('dateOfBirthVisibleLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="birthplaceVisible"
                    :label="$t('birthplaceVisibleLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="sexVisible"
                    :label="$t('sexVisibleLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="biographyVisible"
                    :label="$t('biographyVisibleLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import PersonFieldVisibilityService from '@/services/configuration/PersonFieldVisibilityService';
import { type PersonFieldVisibility } from '@/models/PersonModel';


export default defineComponent({
    name: "PersonFieldVisibilityConfigurationForm",
    props: {
        personId: {
            type: Number,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        onMounted(() => {
            fetchDetails();
        });

        watch(() => props.personId, () => {
            fetchDetails();
        });

        const fetchDetails = () => {
            if (props.personId) {
                PersonFieldVisibilityService.readPublicFieldVisibilityConfiguration(props.personId)
                .then(response => {
                    phoneNumberVisible.value = response.data.phoneNumberVisible;
                    contactEmailVisible.value = response.data.contactEmailVisible;
                    dateOfBirthVisible.value = response.data.dateOfBirthVisible;
                    sexVisible.value = response.data.sexVisible;
                    birthplaceVisible.value = response.data.birthplaceVisible;
                    biographyVisible.value = response.data.biographyVisible;
                });
            }
        };

        const phoneNumberVisible = ref(false);
        const contactEmailVisible = ref(false);
        const dateOfBirthVisible = ref(false);
        const sexVisible = ref(false);
        const birthplaceVisible = ref(false);
        const biographyVisible = ref(false);

        const submit = () => {
            const configuration: PersonFieldVisibility = {
                phoneNumberVisible: phoneNumberVisible.value,
                contactEmailVisible: contactEmailVisible.value,
                dateOfBirthVisible: dateOfBirthVisible.value,
                sexVisible: sexVisible.value,
                birthplaceVisible: birthplaceVisible.value,
                biographyVisible: biographyVisible.value
            };

            PersonFieldVisibilityService.savePublicFieldVisibilityConfiguration(
                props.personId, configuration
            ).then(() => {
                emit("update");
            });
        };

        return {
            isFormValid, submit,
            phoneNumberVisible,
            contactEmailVisible,
            dateOfBirthVisible,
            sexVisible, birthplaceVisible,
            biographyVisible
        };
    }
});
</script>
