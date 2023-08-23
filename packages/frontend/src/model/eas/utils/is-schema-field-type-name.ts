import {
  SCHEMA_FIELD_TYPE_NAMES,
  SchemaFieldTypeName,
} from '../types/schema-field-type.type';

export function isSchemaFieldTypeName(
  name: string
): name is SchemaFieldTypeName {
  return SCHEMA_FIELD_TYPE_NAMES.includes(name as SchemaFieldTypeName);
}
