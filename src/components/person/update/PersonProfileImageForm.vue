<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-file-input
                v-model="file"
                :label="$t('fileLabel') + '*'"
                accept="image/*"
                @change="handleFileChange"
            ></v-file-input>
        </v-row>
        <v-row>
            <VuePictureCropper
                :box-style="{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f8f8f8',
                    margin: 'auto',
                }"
                :img="imageSrc ? imageSrc : ''"
                :options="{
                    viewMode: 1,
                    dragMode: 'crop',
                    aspectRatio: 4 / 5,
                }"
            />
        </v-row>
        <v-row v-if="originalFileName" class="mt-10">
            <v-btn density="compact" class="bottom-spacer" @click="removeProfileImage">
                {{ $t("removeProfileImageLabel") }}
            </v-btn>
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
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import BaseService from '@/services/BaseService';


export default defineComponent({
    name: "PersonProfileImageForm",
    components: { VuePictureCropper },
    props: {
        originalFileName: {
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

        onMounted(async () => {
            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
            
            if(props.originalFileName) {
                file.value.push(new File([], props.originalFileName));
            }

            if (props.personId) {
                imageSrc.value = (await BaseService.fetchImageForDisplay(props.personId, true))[0] as string;
            }
        });

        const file = ref<File[]>([]);
        const imageSrc = ref<string | undefined>(undefined);

        const submit = async () => {
            if (!cropper || !file.value) return

            const newProfileImage: PersonProfileImageRequest = {
                file: file.value[0],
                top: Math.floor(cropper.getCropBoxData().top),
                left: Math.floor(cropper.getCropBoxData().left),
                height: Math.floor(cropper.getCropBoxData().height),
                width: Math.floor(cropper.getCropBoxData().width)
            };

            PersonService.updatePersonProfileImage(newProfileImage, props.personId).then(() => {
                emit("update");
            });
        };

        const removeProfileImage = () => {
            PersonService.removePersonProfileImage(props.personId).then(() => {
                emit("update");
            });
        };

        const handleFileChange = () => {
            if (!cropper || !file.value) return
            cropper.clear();
            if (file.value[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imageSrc.value = e.target?.result as string;
                };
                reader.readAsDataURL(file.value[0]);
            }
        };

        return {
            isFormValid, file, submit,
            removeProfileImage, imageSrc,
            handleFileChange
        };
    }
});
</script>
