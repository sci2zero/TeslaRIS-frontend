import { onBeforeUnmount, ref, watch, type Ref } from "vue";

function serialize(root: HTMLElement | null): string {
    if (!root) {
        return "";
    }

    const parts: string[] = [];
    root.querySelectorAll("input, textarea, select, [contenteditable='true']").forEach((node) => {
        if (node instanceof HTMLInputElement) {
            if (node.type === "checkbox" || node.type === "radio") {
                parts.push(`${node.name}|${node.value}|${node.checked}`);
                return;
            }
            if (node.type === "file") {
                const names = Array.from(node.files ?? []).map((file) => `${file.name}:${file.size}`).join(",");
                parts.push(`file|${names}`);
                return;
            }
            parts.push(node.value);
            return;
        }
        if (node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement) {
            parts.push(node.value);
            return;
        }
        parts.push((node.textContent ?? "").trim());
    });
    return parts.join("\u0001");
}

export function usePersistentWhenEdited(
    dialog: Ref<boolean>,
    getRoot: () => HTMLElement | null,
    enabled: Ref<boolean> | boolean = true
) {
    const edited = ref(false);
    const confirmClose = ref(false);
    let baseline = "";
    let armed = false;
    let listening = false;

    const isEnabled = () => (typeof enabled === "boolean" ? enabled : enabled.value);

    function reset() {
        edited.value = false;
        confirmClose.value = false;
        armed = false;
        baseline = "";
    }

    function onClickOutside() {
        if (!isEnabled() || !edited.value) {
            return;
        }
        confirmClose.value = true;
    }

    function discardChanges() {
        confirmClose.value = false;
        dialog.value = false;
    }

    function refresh() {
        if (!armed || !isEnabled()) {
            return;
        }
        edited.value = serialize(getRoot()) !== baseline;
    }

    function onPointerDown() {
        if (!isEnabled() || armed) {
            return;
        }
        baseline = serialize(getRoot());
        armed = true;
    }

    function onKeyDown() {
        onPointerDown();
    }

    function onFieldEvent() {
        if (!isEnabled()) {
            return;
        }
        if (!armed) {
            edited.value = true;
            armed = true;
            baseline = "";
            return;
        }
        refresh();
    }

    function onDocumentPointerUp() {
        setTimeout(refresh, 0);
    }

    function startListening() {
        if (listening) {
            return;
        }
        document.addEventListener("pointerup", onDocumentPointerUp, true);
        listening = true;
    }

    function stopListening() {
        if (!listening) {
            return;
        }
        document.removeEventListener("pointerup", onDocumentPointerUp, true);
        listening = false;
    }

    watch(dialog, (open) => {
        if (open && isEnabled()) {
            reset();
            startListening();
            return;
        }
        stopListening();
        reset();
    });

    onBeforeUnmount(stopListening);

    return { edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges };
}
