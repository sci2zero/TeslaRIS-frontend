import { onMounted, onUnmounted } from 'vue';

export function useInterval(callback: () => void, interval: number): void {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    onMounted(() => {
            callback(); // call it immediately
            intervalId = setInterval(callback, interval);
    });

    onUnmounted(() => {
        if (intervalId !== undefined) {
            clearInterval(intervalId);
        }
    });
}
