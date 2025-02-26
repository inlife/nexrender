export default {
    tables: [
        {
            TableName: "nexrender-jobs",
            KeySchema: [{ AttributeName: "uid", KeyType: "HASH" }],
            AttributeDefinitions: [
                { AttributeName: "uid", AttributeType: "S" },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            },
        },
    ],
    basePort: 8000,
};
