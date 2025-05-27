<template>
    <v-row>
        <v-col cols="6">
            <v-skeleton-loader type="button" color="secondary" />
  
            <template v-for="(item, index) in leftSkeletons" :key="'left-' + index">
                <v-skeleton-loader
                    :type="item.type"
                    color="secondary"
                    :width="item.width"
                />
            </template>
        </v-col>
  
        <v-col cols="6">
            <template v-for="(item, index) in rightSkeletons" :key="'right-' + index">
                <v-skeleton-loader
                    :type="item.type"
                    color="secondary"
                    :width="item.width"
                />
            </template>
        </v-col>
    </v-row>
</template>
  
<script lang="ts">
import { defineComponent, ref } from 'vue';
  
export default defineComponent({
    name: "BasicInfoLoader",
    setup() {
        const getRandomSkeletons = (): Array<{ type: string; width?: string }> => {
            const skeletonTypes = ["list-item-two-line", "list-item", "sentences", "paragraph", "chip"];
            const skeletons: Array<{ type: string; width?: string }> = [];
            const count = Math.floor(Math.random() * 3) + 4; // 4 to 6 items
        
            for (let i = 0; i < count; i++) {
                const type =
                    i % 2 === 1 ?
                        skeletonTypes[Math.floor(Math.random() * skeletonTypes.length)] : "subtitle";
                const width = `${Math.floor(Math.random() * 30) + 70}%`; // 60% to 100%
                skeletons.push({ type, width });
            }
        
            return skeletons;
        };  

        const leftSkeletons = ref(getRandomSkeletons());
        const rightSkeletons = ref(getRandomSkeletons());
    
        return {
            leftSkeletons,
            rightSkeletons,
        };
    },
});
</script>
  