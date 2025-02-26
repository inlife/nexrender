import { vi, describe, test, expect, beforeEach } from "vitest";
import { insert, fetch, update, remove, cleanup } from "./index.mjs";

// Set the mock DynamoDB endpoint
process.env.AWS_ENDPOINT_URL = process.env.MOCK_DYNAMODB_ENDPOINT;

// Fake data for testing
const mockData = {
    uid: "123",
    name: "Test",
    createdAt: "2024-02-26",
    updatedAt: "2024-02-26",
};

// Clear mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});

describe("E2E DynamoDB Tests", () => {
    test("should insert an item and fetch it", async () => {
        // Insert the item
        const insertResult = await insert(mockData);
        expect(insertResult).toBe(true);

        // Fetch the item
        const result = await fetch("123");
        expect(result).toEqual(expect.objectContaining(mockData)); // Check if the data matches
    });

    test("should update an item", async () => {
        // Insert initial data
        await insert(mockData);

        const updatedData = { name: "Updated Test" };

        // Update the item
        const result = await update("123", updatedData);

        // Ensure the item was updated
        expect(result.name).toBe("Updated Test");
        expect(result.updatedAt).not.toBe(mockData.updatedAt); // Ensure updatedAt has changed

        // Ensure the item was updated in the database
        const fetchedData = await fetch("123");
        expect(fetchedData.name).toBe("Updated Test");
    });

    test("should delete an item", async () => {
        // Insert the item
        await insert(mockData);

        // Delete the item
        const deleteResult = await remove("123");
        expect(deleteResult).toBe(true);

        // Verify the item was deleted
        const result = await fetch("123");
        expect(result).toBeNull();
    });

    test("should clean up all items", async () => {
        // Insert multiple items
        await insert({ uid: "001", name: "Item 1" });
        await insert({ uid: "002", name: "Item 2" });

        // Ensure the items were inserted
        const items = await fetch();
        expect(items.length).toBe(2);

        // Clean up all items
        const cleanupResult = await cleanup();
        expect(cleanupResult).toBe(true);

        // Ensure the table is empty
        const result = await fetch();
        expect(result).toEqual([]);
    });
});
