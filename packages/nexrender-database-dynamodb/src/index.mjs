import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    DeleteCommand,
    ScanCommand,
    BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);

const TableName = process.env.DYNAMODB_TABLE_NAME || "nexrender-jobs";

/* public api */
const insert = async (entry) => {
    try {
        const now = new Date().toISOString();
        entry.updatedAt = now;
        entry.createdAt = now;

        const command = new PutCommand({
            TableName,
            Item: entry,
        });
        await dynamoDB.send(command);
        return true;
    } catch (error) {
        console.error("Error inserting entry:", error);
        throw new Error("Insert operation failed");
    }
};

const fetch = async (uid) => {
    try {
        if (uid) {
            const command = new GetCommand({
                TableName,
                Key: { uid },
            });
            const result = await dynamoDB.send(command);
            return result.Item || null;
        }
        const command = new ScanCommand({
            TableName,
        });
        const result = await dynamoDB.send(command);
        return result.Items || [];
    } catch (error) {
        console.error("Error fetching entry:", error);
        throw new Error("Fetch operation failed");
    }
};

const update = async (uid, object) => {
    try {
        const now = new Date().toISOString();
        let entry = await fetch(uid);
        if (!entry) throw new Error("Entry not found");

        entry = { ...entry, ...object, updatedAt: now };

        const command = new PutCommand({
            TableName,
            Item: entry,
        });

        await dynamoDB.send(command);
        return entry;
    } catch (error) {
        console.error(
            `Error updating item (uid: ${uid}) in DynamoDB: ${error.message}`
        );
        throw new Error("Update operation failed");
    }
};

const remove = async (uid) => {
    try {
        const command = new DeleteCommand({
            TableName,
            Key: { uid },
        });
        await dynamoDB.send(command);
        return true;
    } catch (error) {
        console.error(
            `Error deleting item (uid: ${uid}) from DynamoDB: ${error.message}`
        );
        throw new Error("Delete operation failed");
    }
};

const cleanup = async () => {
    try {
        const entities = await fetch();
        if (!entities.length) return true;

        const deleteRequests = entities.map((entity) => ({
            DeleteRequest: {
                Key: { uid: entity.uid },
            },
        }));

        const command = new BatchWriteCommand({
            RequestItems: {
                [TableName]: deleteRequests,
            },
        });

        await dynamoDB.send(command);
        return true;
    } catch (error) {
        console.error(`Error deleting items from DynamoDB: ${error.message}`);
        throw new Error("Cleanup operation failed");
    }
};

module.exports = {
    insert,
    fetch,
    update,
    remove,
    cleanup,
};
