export const sequenceSchema = {
    type: "object",
    required: ["headers", "requestContext"],
    properties: {
      headers: {
          type: "object",
          required: ["x-from-cloudfront"],
          properties: {
              "x-from-cloudfront": {
                  type: "string",
                  const: "cloudfront-ok", // CloudFront経由のみ許可
              }
          }
      },
      requestContext: {
          type: "object",
          required: ["http"],
          properties: {
              http: {
                  type: "object",
                  required: ["path", "method"],
                  properties: {
                      path: {
                          type: "string",
                          pattern: "/v1/sequence*"
                      },
                      method: {
                          type: "string",
                          const: "GET", // GETのみ許可
                      }
                  }
              }
          }
      }
    }
}