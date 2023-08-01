export const handler = async () => {
    return {
        statusCode:404,
        body: {
            status: 404,
            errorMessage: "not found"
        }
    }
}
