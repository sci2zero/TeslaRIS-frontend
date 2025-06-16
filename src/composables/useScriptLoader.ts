export function useScriptLoader(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            return resolve()
        }

        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = src
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script ${src}`))
        document.head.appendChild(script)
    });
}
