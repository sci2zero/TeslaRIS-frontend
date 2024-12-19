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
                    aspectRatio: 1 / 1,
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
                file.value = (new File([], props.originalFileName));
            }

            if (props.personId) {
                imageSrc.value = (await BaseService.fetchImageForDisplay(props.personId, true))[0] as string;
            }
        });

        const file = ref<File>();
        const imageSrc = ref<string | undefined>(undefined);

        const submit = async () => {
            if (!cropper || !file.value) return

            const newProfileImage: PersonProfileImageRequest = {
                file: await urlToFile(imageSrc.value as string, file.value.name),
                top: Math.round(cropper.getCropBoxData().top),
                left: Math.round(cropper.getCropBoxData().left) - 60,
                height: Math.round(cropper.getCropBoxData().height),
                width: Math.round(cropper.getCropBoxData().width)
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
            if (!cropper || !file.value) return;

            cropper.clear();

            if (file.value) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        canvas.width = 450;
                        canvas.height = 600;

                        ctx?.drawImage(img, 0, 0, 450, 600);

                        imageSrc.value = canvas.toDataURL('image/jpeg');
                    };

                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file.value);
            }
        };

        const urlToFile = async (url: string, fileName: string): Promise<File> => {
            if (url.startsWith('data:')) {
                const [metadata, base64] = url.split(',');
                const mime = metadata.match(/:(.*?);/)?.[1] || 'image/jpeg';
                const binary = atob(base64);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    array[i] = binary.charCodeAt(i);
                }
                return new File([array], fileName, { type: mime });
            } else if (url.startsWith('blob:')) {
                const response = await fetch(url);
                const blob = await response.blob();
                const mime = blob.type || 'image/jpeg';
                return new File([blob], fileName, { type: mime });
            } else {
                throw new Error('Unsupported URL format');
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
