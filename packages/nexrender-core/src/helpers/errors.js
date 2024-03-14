class RenderProcessError extends Error {
    constructor(code, signal, message) {
        super();
        this.code = code;
        this.signal = signal;
        this.message = message;
    }
}
