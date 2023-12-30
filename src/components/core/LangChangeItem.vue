<template>
    <div>
        <input
            id="sr" type="radio" name="lang" :checked="selectedLocale==='sr'"
            @change="switchLang('sr')" />
        <label for="sr" class="sr">SR</label>

        <input
            id="en" type="radio" name="lang" :checked="selectedLocale==='en'"
            @change="switchLang('en')" />
        <label for="en" class="en">EN</label>
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

      const selectedLocale = ref("");
  
      const switchLang = (lang: string) => {
        const currentPath = currentRoute.path.replace(/^\/[a-z]+/, `/${lang}`);
        router.push(currentPath);
      };

      onMounted(async () => {
        await router.isReady()
        const currentLocale = currentRoute.params.locale as string;
        
        if (supportedLocales.includes(currentLocale)) {
          selectedLocale.value = currentLocale;
        } else {
          selectedLocale.value = defaultLocale;
        }
      });
  
      return {
        switchLang,
        selectedLocale
      };
    },
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
  </style>
  