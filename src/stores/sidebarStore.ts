import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

/** Must stay in sync with `@media (max-width: 1023px)` layout rules. */
export const SIDEBAR_MOBILE_MAX_WIDTH = 1023;

const getIsMobileViewport = () =>
  typeof window !== 'undefined' &&
  window.matchMedia(`(max-width: ${SIDEBAR_MOBILE_MAX_WIDTH}px)`).matches;

export const useSidebarStore = defineStore('sidebar', () => {
  const isOpen = ref(true);
  const route = useRoute();
  const isMobile = ref(getIsMobileViewport());

  // Load sidebar state from localStorage on initialization
  const savedState = localStorage.getItem('sidebar-open');
  if (savedState !== null) {
    isOpen.value = JSON.parse(savedState);
  }

  if (isMobile.value) {
    isOpen.value = false;
  }

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const close = () => {
    isOpen.value = false;
  };

  const open = () => {
    isOpen.value = true;
  };

  const setMobile = (mobile: boolean) => {
    if (isMobile.value === mobile) {
      return;
    }

    isMobile.value = mobile;
    if (mobile && isOpen.value) {
      isOpen.value = false;
    }
  };

  // Watch for changes and persist to localStorage
  watch(isOpen, (newValue) => {
    localStorage.setItem('sidebar-open', JSON.stringify(newValue));
  });

  // Computed property to determine if sidebar should be visible
  const isVisible = computed(() => {
    return isOpen.value || (!isHome.value && !isMobile.value);
  });

  const isHome = computed(() => {
    return route.name === "home";
  });

  const reservesSpace = computed(() => isVisible.value && !isMobile.value);

  const sidebarWidth = computed(() => {
    return reservesSpace.value ? 'w-64' : 'w-0';
  });

  const mainMargin = computed(() => {
    return reservesSpace.value ? 'sidebar-offset' : 'ml-0';
  });

  return {
    isOpen,
    isMobile,
    isVisible,
    sidebarWidth,
    mainMargin,
    toggle,
    close,
    open,
    setMobile
  };
});
