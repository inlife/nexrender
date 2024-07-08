let object = null;

global.fetch = async (url, options) => {
    object = { url, options };
    return {
        ok: true,
        status: 200,
        json: async () => ({"status": "ok"}),
        text: async () => JSON.stringify({"status": "ok"}),
    };
};


const action = require("./index.js");
const assert = require("assert");

describe("action/webhook", () => {
    const settings = {
        logger: { log: () => {} },
    }

    const job = {
        uid: "123",
        state: "queued",
        custom: {
            super: "value",
        }
    }

    it("should send a request to a webhook", async () => {
        await action(job, settings, {
            url: "http://example.com",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            json: {
                somevalue: 123,
            },
        });

        assert.equal(object.url, "http://example.com");
        assert.equal(object.options.method, "POST");
        assert.equal(object.options.headers["Content-Type"], "application/json");
        assert.equal(object.options.body, JSON.stringify({somevalue: 123}));
    })

    it("should replace job data in the webhook url", async () => {
        await action(job, settings, {
            url: "http://example.com/{job.uid}",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            json: {
                somevalue: 123,
            },
        });

        assert.equal(object.url, "http://example.com/123");
    })

    it("should replace job data in the webhook headers", async () => {
        await action(job, settings, {
            url: "http://example.com",
            method: "POST",
            headers: {
                "Content-Type": "{job.custom.super}",
            },
            json: {
                somevalue: 123,
            },
        });

        assert.equal(object.options.headers["Content-Type"], "value");
    })

    it("should replace job data in the webhook json", async () => {
        await action(job, settings, {
            url: "http://example.com",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            json: {
                somevalue: "value here {job.custom.super}:{job.uid}",
                state: "{job.state}",
            },
        });

        assert.equal(object.options.body, JSON.stringify({somevalue: "value here value:123", state: "queued"}));
    })

    it("should replace job data in the webhook body", async () => {
        await action(job, settings, {
            url: "http://example.com",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: "somevalue: value here {job.custom.super}:{job.uid}, state: {job.state}"
        });

        assert.equal(object.options.body, "somevalue: value here value:123, state: queued");
    })
})
