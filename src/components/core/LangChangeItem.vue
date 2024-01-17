<template>
    <div class="text-center">
        <v-menu
            v-model="menu"
            :close-on-content-click="true"
            location="end"
        >
            <template #activator="{ props }">
                <v-btn
                    color="indigo"
                    v-bind="props"
                >
                    {{ selectedLocale.short }}
                </v-btn>
            </template>

            <v-card min-width="150">
                <v-list>
                    <!-- <v-list-subheader>Recent</v-list-subheader> -->

                    <v-list-item
                        v-for="(item, i) in langItems"
                        :key="i"
                        :value="item"
                        :color="item.value === selectedLocale.value ? '' : 'primary' "
                        :class="{ 'selected': item.value === selectedLocale.value }"
                        @click="switchLang(item)"
                    >
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>

                    <!-- <v-divider></v-divider>
                    <v-list-subheader>All languages</v-list-subheader>


                    <v-list-item
                        v-for="(item, i) in langItems"
                        :key="i"
                        :value="item"
                        color="primary"
                    >
                        <v-list-item-title v-text="item.title"></v-list-item-title>
                    </v-list-item> -->
                </v-list>
            </v-card>
        </v-menu>
    </div>
</template>
  
<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { supportedLocales, defaultLocale } from '../../i18n'

  export default defineComponent({
    name: "LangChangeItem",
    setup() {
      const currentRoute = useRoute();
      const router = useRouter();

      const selectedLocale: any = ref({});
      const langItems = [
        {
          title: 'Serbian',
          short: "SR",
          value: 'sr',
        },
        {
          title: 'English',
          short: "EN",
          value: 'en',
        },
      ];
  
      const switchLang = (lang: any) => {
        selectedLocale.value = lang; 
        const currentPath = currentRoute.path.replace(/^\/[a-z]+/, `/${lang.value}`);
        router.push(currentPath);
      };

      onMounted(async () => {
        await router.isReady()
        const currentLocale = currentRoute.params.locale as string;
        
        if (supportedLocales.includes(currentLocale)) {
          selectedLocale.value = langItems.find(x=>x.value == currentLocale);
        } else {
          selectedLocale.value = langItems.find(x=>x.value == defaultLocale)
        }
      });
  
      return {
        switchLang,
        selectedLocale,
        langItems
      };
    },

    data: () => ({
      fav: true,
      menu: false,
      message: false,
      hints: true,
    }),


  });
</script>
  
  <style scoped>
  label {
    cursor: pointer;
    padding: 0.5em;
    margin: 0.2em;
    border: 1px solid #ccc;
    border-radius: 4px;
    display: inline-block;
  }
  
  .sr {
    padding-right: 0.125em;
  }
  
  .en {
    padding-left: 0.125em;
  }

  .selected {
    background: #515fb3;
    color: white;
  }
  </style>
  