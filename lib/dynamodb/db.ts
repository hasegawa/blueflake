import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb"

const dynamoDbClient = new DynamoDBClient({})

export async function getItem(tableName:string, timeStampAndRandomKey:string) {
    const command = new GetItemCommand({
        TableName: tableName,
        Key: {
            timeStampAndRandomKey:  {S: timeStampAndRandomKey}
        }
    })
    return await dynamoDbClient.send(command)
}

export async function registItem(tableName:string, timeStampAndRandomKey:string, sequenceNumber:number) {
    const command = new PutItemCommand({
        TableName: tableName,
        Item: {
            timeStampAndRandomKey:  {
                S: timeStampAndRandomKey
            },
            sequenceNumber: {
                N: sequenceNumber.toString()
            }
        }
    })
    return await dynamoDbClient.send(command)
}

export async function updateItem(tableName:string, timeStampAndRandomKey:string, oldSequenceNumber:number, nextSequenceNumber:number) {
    const command = new UpdateItemCommand({
        TableName: tableName,
        Key: {
            timeStampAndRandomKey:  {
                S: timeStampAndRandomKey
            },
        },
        UpdateExpression: "set sequenceNumber = :nextNumber",
        ConditionExpression: "sequenceNumber = :oldNumber",
        ExpressionAttributeValues: {
            ":nextNumber": {
                N: nextSequenceNumber.toString()
            },
            ":oldNumber": {
                N: oldSequenceNumber.toString()
            }
        },
    })
    return await dynamoDbClient.send(command)
}