const withTimeout = (promise, timeoutMs, errorMsg) => {
    let timeoutHandle;

    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(errorMsg));
        }, timeoutMs);
    });

    return Promise.race([
        promise,
        timeoutPromise,
    ]).finally(() => {
        clearTimeout(timeoutHandle);
    });
};

module.exports = {
    withTimeout,
};
