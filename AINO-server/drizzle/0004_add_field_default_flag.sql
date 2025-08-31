-- Add is_default column to field_defs table
ALTER TABLE "field_defs" ADD COLUMN "is_default" boolean DEFAULT false;

-- Add comment to explain the purpose
COMMENT ON COLUMN "field_defs"."is_default" IS 'Whether this field is a default field. Default fields cannot have their key or type modified.';
