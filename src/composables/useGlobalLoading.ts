import { ref } from 'vue'


const globalLoading = ref(false);
const globalLoadingMessage = ref("");

export function useGlobalLoading() {
  function showLoader(message: string | null = null) {
    globalLoadingMessage.value = message ? message : "";
    globalLoading.value = true;
  }

  function hideLoader() {
    globalLoading.value = false;
  }

  return {
    globalLoading,
    globalLoadingMessage,
    showLoader, hideLoader
  };
}
