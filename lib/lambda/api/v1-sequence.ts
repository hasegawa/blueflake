import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb"
import { getNowDate, getRandomKey, makeBlueFlakeID } from "../../common/generate-id"


const dynamoDbClient = new DynamoDBClient({})

async function getItem(tableName:string, timeStampAndRandomKey:string) {
    const command = new GetItemCommand({
        TableName: tableName,
        Key: {
            timeStampAndRandomKey:  {S: timeStampAndRandomKey}
        }
    })
    return await dynamoDbClient.send(command)
}

async function registItem(tableName:string, timeStampAndRandomKey:string, sequenceNumber:number) {
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

export const handler = async () => {
    const tableName = process.env.SEQUENCE_TABLE_NAME!
    const nowDate =  getNowDate();
    // timestamp + randomkey(ex.0001)をパーティションキーとしている
    const randomKey = getRandomKey()
    const timeStampAndRandomKey = nowDate.getTime().toString() + randomKey.toString().padStart(4, "0")
    const item = await getItem(tableName, timeStampAndRandomKey)
    const sequenceNumber = item?.Item?.sequenceNumber;
    if (sequenceNumber === undefined) {
        // 新規登録
        registItem(tableName, timeStampAndRandomKey, 1)
        return makeBlueFlakeID(nowDate, randomKey, 1)
    }

    return 0
}