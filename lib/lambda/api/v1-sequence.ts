import { getNowDate, getRandomKey, makeBlueFlakeID } from "../../common/generate-id"
import { getItem, registItem, updateItem } from "../../dynamodb/db";

export const handler = async () => {
    const tableName = process.env.SEQUENCE_TABLE_NAME!
    const nowDate =  getNowDate();
    // timestamp + randomkey(ex.0001)をパーティションキーとしている
    const randomKey = getRandomKey()
    const timeStampAndRandomKey = nowDate.getTime().toString() + randomKey.toString().padStart(4, "0")
    const item = await getItem(tableName, timeStampAndRandomKey)
    if (item?.Item?.sequenceNumber?.N === undefined) {
        // アイテム新規登録
        registItem(tableName, timeStampAndRandomKey, 1)
        return makeBlueFlakeID(nowDate, randomKey, 1)
    } else {
        // シーケンス番号カウントアップ
        const sequenceNumber = parseInt(item?.Item?.sequenceNumber?.N);
        if (sequenceNumber < 4096) {
            updateItem(tableName, timeStampAndRandomKey, sequenceNumber , sequenceNumber + 1)
            return makeBlueFlakeID(nowDate, randomKey, sequenceNumber + 1)
        } else {
            throw new Error("server busy")
        }
    }
}