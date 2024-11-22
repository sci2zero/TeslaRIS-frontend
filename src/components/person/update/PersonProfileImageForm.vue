<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-file-input
                v-model="file"
                :label="$t('fileLabel') + '*'"
                accept="image/*"
            ></v-file-input>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { LanguageTagResponse } from '@/models/Common';
import PersonService from '@/services/PersonService';
import type { PersonProfileImageRequest } from '@/models/PersonModel';

export default defineComponent({
    name: "PersonProfileImageForm",
    props: {
        fileName: {
            type: String,
            default: undefined
        },
        personId: {
            type: Number,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
            
            if(props.fileName) {
                file.value.push(new File([], props.fileName));
            } 
        });

        const file = ref<File[]>([]);

        const submit = () => {
            const newProfileImage: PersonProfileImageRequest = {
                imageFile: file.value![0],
            };

            PersonService.updatePersonProfileImage(newProfileImage, props.personId).then((response) => {
                emit("update", response.data);
            });
        };

        return {
            isFormValid, file, submit
        };
    }
});
</script>
