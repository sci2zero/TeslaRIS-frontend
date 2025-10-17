import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useSidebarStore = defineStore('sidebar', () => {
  const isOpen = ref(true);
  const isMobile = ref(false);

  // Load sidebar state from localStorage on initialization
  const savedState = localStorage.getItem('sidebar-open');
  if (savedState !== null) {
    isOpen.value = JSON.parse(savedState);
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
    return isOpen.value;
  });

  // Computed property for sidebar width
  const sidebarWidth = computed(() => {
    return isOpen.value ? 'w-24' : 'w-0';
  });

  // Computed property for main content margin
  const mainMargin = computed(() => {
    if (!isOpen.value) return 'ml-0';
    return 'ml-24';
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
