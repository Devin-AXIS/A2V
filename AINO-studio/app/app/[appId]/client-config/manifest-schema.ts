export const manifestSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    schemaVersion: { type: "string" },
    app: {
      type: "object",
      properties: {
        appKey: { type: "string" },
        locale: { type: "string" },
        theme: { type: "string" },
        bottomNav: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { type: "string" },
              label: { type: "string" },
              page: { type: "string" },
              route: { type: "string" },
              iconName: { type: "string" }
            },
            required: ["key", "label"]
          }
        }
      },
      required: ["appKey", "locale", "theme", "bottomNav"]
    },
    pages: { type: "object" },
    dataSources: { type: "object" },
    actions: { type: "object" }
  },
  required: ["schemaVersion", "app"],
} as const


