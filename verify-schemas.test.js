const fs = require("fs");
const { expect } = require("chai");
const JsonSchema = require("@hyperjump/json-schema");
const { Core } = require("@hyperjump/json-schema-core");
const dialectSchema = require("./jsonSchema/dialect/latest/schema.json");
const vocabularySchema = require("./jsonSchema/vocab/latest/schema.json");


JsonSchema.setMetaOutputFormat(JsonSchema.BASIC);

JsonSchema.add(dialectSchema);
JsonSchema.add(vocabularySchema);

const schemas = (path) => {
  if (fs.existsSync(`${path}/latest`)) {
    const json = fs.readFileSync(`${path}/latest/schema.json`, "utf-8");
    const schema = JSON.parse(json);
    JsonSchema.add(schema);
    return [schema.$id];
  } else {
    return fs.readdirSync(path, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "jsonSchema")
      .reduce((acc, entry) => acc.concat(schemas(`${path}/${entry.name}`)), []);
  }
};

describe("Core Verida Schemas", () => {
  schemas(__dirname).forEach((schemaId) => {
    it(`Validating schema: ${schemaId}`, async () => {
      const schema = await JsonSchema.get(schemaId);
      try {
        const validate = await JsonSchema.validate(schema);
      } catch (error) {
        if (error instanceof JsonSchema.InvalidSchemaError) {
          expect.fail(JSON.stringify(error.output, null, "  "));
        } else {
          throw error;
        }
      }
    });
  });
});
