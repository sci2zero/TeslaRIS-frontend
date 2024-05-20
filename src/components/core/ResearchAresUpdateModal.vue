<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" style="margin-bottom: 20px;"
                        :disabled="readOnly" size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("updateKeywordsLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <treeselect v-model="selectedResearchAreas" :multiple="true" :options="researchAreasSelectable" />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" @click="submitSelection">
                        {{ $t("updateLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { defineComponent } from "vue";
import type { MultilingualContent } from "@/models/Common";
import type { PropType } from "vue";
import type { ResearchArea } from "@/models/OrganisationUnitModel";
import Treeselect from 'vue3-treeselect';
import 'vue3-treeselect/dist/vue3-treeselect.css';
import ResearchAreaService from "@/services/ResearchAreaService";
import { returnCurrentLocaleContent } from "@/i18n/TranslationUtil";


export default defineComponent({
    name: "ResearchAreaUpdateModal",
    components: { Treeselect },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        researchAreasHierarchy: {
            type: Object as PropType<ResearchArea[] | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const selectedResearchAreas = ref(null);
        const researchAreasSelectable = ref<any>([]);

        onMounted(() => {
            ResearchAreaService.readAllResearchAreas().then((response) => {
                response.data.forEach((researchAreaResponse) => {
                    researchAreasSelectable.value.push(reorganiseParent(researchAreaResponse));
                });
                console.log(researchAreasSelectable.value)
            });
        });

        const reorganiseParent = (data: any) => {
            if (!data) {
                return [];
            }

            const nodeMap: { [key: string]: any } = {};
            const root: any[] = [];

            let current = data;
            while (current['superResearchArea']) {
                current["children"] = [];

                if(current.name[0].content) {
                    nodeMap[current.name[0].content] = current;
                }
                current = current['superResearchArea'];
            }
            current["children"] = [];
            current["label"] = returnCurrentLocaleContent(current.name);
            nodeMap[current.name[0].content] = current;
            root.push(current);

            for (const [, value] of Object.entries(nodeMap)) {
                if (!value.children) {
                    value.children = [];
                }

                if (value['superResearchArea']) {
                    const parent = nodeMap[value['superResearchArea'].name[0].content];
                    parent.children.push(value);
                }
            }
            return root;
        };

        const emitToParent = (keywords: MultilingualContent[]) => {
            emit("update", keywords)
            dialog.value = false;
        }

        const submitSelection = () => {
            console.log(selectedResearchAreas.value);
        };

        return {dialog, researchAreasSelectable,
            selectedResearchAreas, emitToParent,
            submitSelection};
    }
});
</script>

<style scoped>
.edit-pen-container .edit-pen {
    top: 0px;
    right: 0px;
    position: absolute;
    z-index: 10;
    opacity: 0;
}

.edit-pen-container:hover .edit-pen {
    opacity: 0.3;
}

.edit-pen-container .edit-pen:hover {
    opacity: 1;
}

.vue3-treeselect__menu-container {
width : 500px !important;
}
</style>
