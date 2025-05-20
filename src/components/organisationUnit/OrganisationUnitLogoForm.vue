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
                    backgroundColor: backgroundColor,
                    margin: 'auto',
                }"
                :img="imageSrc || ''"
                :autoCrop="true"
                :autoCropWidth="150"
                :autoCropHeight="150"
                :options="{
                    viewMode: 1,
                    dragMode: 'crop',
                    aspectRatio: 1 / 1,
                }"
            />
        </v-row>
        <v-row class="mt-10">
            <color-picker
                v-model="backgroundColor"
                :label="$t('selectBackgroundColorLabel')"
            />
        </v-row>
        <v-row v-if="originalFileName" class="mt-5">
            <v-btn density="compact" class="bottom-spacer" @click="removeProfileImage">
                {{ $t("removeProfileImageLabel") }}
            </v-btn>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { LanguageTagResponse } from '@/models/Common';
import type { InstitutionLogoRequest } from '@/models/OrganisationUnitModel';
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import BaseService from '@/services/BaseService';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import ColorPicker from '../core/ColorPicker.vue';


export default defineComponent({
    name: "OrganisationUnitLogoForm",
    components: { VuePictureCropper, ColorPicker },
    props: {
        originalFileName: {
            type: String,
            default: undefined
        },
        orgUnitId: {
            type: Number,
            required: true
        },
        backgroundColorHex: {
            type: String,
            default: ""
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const languageTags = ref<LanguageTagResponse[]>([]);
        const backgroundColor = ref(props.backgroundColorHex ? props.backgroundColorHex : "#a8b2bd");

        onMounted(async () => {
            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
            
            if(props.originalFileName) {
                file.value = (new File([], props.originalFileName));
            }

            if (props.orgUnitId) {
                imageSrc.value = (await BaseService.fetchLogoForDisplay(props.orgUnitId, true))[0] as string;
            }
        });

        watch(() => props.backgroundColorHex, () => {
            backgroundColor.value = props.backgroundColorHex;
        });

        const file = ref<File>();
        const imageSrc = ref<string | undefined>(undefined);

        const submit = async () => {
            if (!cropper || !file.value) return;

            const canvasData = cropper.getCanvasData();
            const imageData = cropper.getImageData();
            const cropBoxData = cropper.getCropBoxData();

            const scaleX = imageData.naturalWidth / imageData.width;
            const scaleY = imageData.naturalHeight / imageData.height;

            const newlogo: InstitutionLogoRequest = {
                file: await urlToFile(imageSrc.value as string, file.value.name),
                top: Math.round((cropBoxData.top - canvasData.top) * scaleY),
                left: Math.round((cropBoxData.left - canvasData.left) * scaleX),
                height: Math.round(cropBoxData.height * scaleY),
                width: Math.round(cropBoxData.width * scaleX),
                backgroundHex: backgroundColor.value
            };

            OrganisationUnitService.updateOrganisationUnitLogo(newlogo, props.orgUnitId).then(() => {
                emit("update");
            });
        };


        const removeProfileImage = () => {
            OrganisationUnitService.removeOrganisationUnitLogo(props.orgUnitId).then(() => {
                emit("update");
            });
        };

        const handleFileChange = () => {
            if (!cropper || !file.value) return;

            cropper.clear();

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx?.drawImage(img, 0, 0, img.width, img.height);

                    const base64 = canvas.toDataURL('image/png');
                    imageSrc.value = base64;

                    cropper?.setCropBoxData({
                        width: img.width / 2,
                        height: img.height / 2,
                        top: img.height / 4,
                        left: img.width / 4
                    });
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file.value);
        };

        const urlToFile = async (url: string, fileName: string): Promise<File> => {
            if (url.startsWith('data:')) {
                const [metadata, base64] = url.split(',');
                const mime = metadata.match(/:(.*?);/)?.[1] || 'image/png';
                const binary = atob(base64);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    array[i] = binary.charCodeAt(i);
                }
                return new File([array], fileName, { type: mime });
            } else if (url.startsWith('blob:')) {
                const response = await fetch(url);
                const blob = await response.blob();
                const mime = blob.type || 'image/png';
                return new File([blob], fileName, { type: mime });
            } else {
                throw new Error('Unsupported URL format');
            }
        };

        return {
            isFormValid, file, submit,
            removeProfileImage, imageSrc,
            handleFileChange, backgroundColor
        };
    }
});
</script>
