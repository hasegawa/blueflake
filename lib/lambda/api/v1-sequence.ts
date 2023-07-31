import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb"


const dynamoDbClient = new DynamoDBClient({})

const timestampItems = async (tableName:string) => {
    const command = new ScanCommand({
        TableName: tableName,
    })
    return (await dynamoDbClient.send(command)).Items
}

export const handler = async () => {
    const tableName = process.env.SEQUENCE_TABLE_NAME!
    return await timestampItems(tableName)
}