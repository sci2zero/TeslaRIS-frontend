<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <div class="edit-pen">
                        <v-btn icon variant="outlined" size="small"> 
                            <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                        </v-btn>
                    </div>

                    <div><b>{{ $t("keywordsLabel") }}</b></div>
                    <strong v-if="!keywords || keywords.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    <v-chip v-for="(keyword, index) in keywords" :key="index" outlined @click="searchKeyword(keyword)">
                        {{ keyword }}
                    </v-chip>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';


export default defineComponent({
    name: "KeywordList",
    props: {
        keywords: {
            type: Object as PropType<string[] | undefined>,
            required: true
        }
    },
    emits: ["searchKeyword"],
    setup(_, { emit }) {
        
        const searchKeyword = (keyword: string) => {
            emit("searchKeyword", keyword)
        };

        return { searchKeyword };
    },
});
</script>

<style scoped>
    .edit-pen-container {
        position:relative;
    }

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

</style>
