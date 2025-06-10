import { onUnmounted } from 'vue';

export function useInterval(callback: () => void, interval: number) {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startInterval = () => {
        if (intervalId === null) {
            callback();
            intervalId = setInterval(callback, interval);
        }
    };

    onUnmounted(() => {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    });

    return { startInterval };
}
