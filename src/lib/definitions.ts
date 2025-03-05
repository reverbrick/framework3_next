import { z } from "zod";

// Define the possible field types
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "date";

// New UI-specific types
export type UIFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "spacer"
  | "group"
  | "namedGroup";

export interface UISchemaItemBase {
  uiType: UIFieldType;
  className?: string;
}

export interface UISchemaFieldItem extends UISchemaItemBase {
  uiType: Exclude<UIFieldType, "spacer" | "group" | "namedGroup">;
  label?: string;
  placeholder?: string;
  helperText?: string;
  options?: { label: string; value: string }[]; // For select, radio, checkbox
  rows?: number; // For textarea
}

export interface UISchemaSpacerItem extends UISchemaItemBase {
  uiType: "spacer";
  label?: string; //dg: no sense, but throws error
  helperText?: string; //dg: no sense, but throws error
  height?: number | string;
}

export interface UISchemaGroupItem extends UISchemaItemBase {
  uiType: "group";
  label?: string; //dg: no sense, but throws error
  helperText?: string; //dg: no sense, but throws error
  fields: string[];
  layout?: "horizontal" | "vertical";
}

export interface UISchemaNamedGroupItem extends UISchemaItemBase {
  uiType: "namedGroup";
  name: string;
  label: string;
  helperText?: string; //dg: no sense, but throws error
  fields: string[];
  layout?: "horizontal" | "vertical";
}

export type UISchemaItem =
  | UISchemaFieldItem
  | UISchemaSpacerItem
  | UISchemaGroupItem
  | UISchemaNamedGroupItem;

export type UISchema = Record<string, UISchemaItem>;

// Define the field configuration interface
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  validations?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  }[];
}

// Function to create a dynamic Zod schema based on field configurations
export function createDynamicSchema(fields: FieldConfig[]) {
  const schemaObj: Record<string, z.ZodType<any>> = {};

  fields.forEach((field) => {
    // Start with a base schema based on field type
    let fieldSchema: z.ZodType<any>;

    switch (field.type) {
      case "email":
        fieldSchema = z
          .string()
          .email({ message: `Please enter a valid email address` });
        break;
      case "number":
        fieldSchema = z.coerce.number();
        break;
      case "date":
        fieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: `Please enter a valid date`,
        });
        break;
      default:
        fieldSchema = z.string();
    }

    // Apply required validation
    /*
    if (field.required) {
      fieldSchema = fieldSchema.min(1, {
        message: `${field.label} is required`,
      });
    } else {
      fieldSchema = fieldSchema.optional();
      }*/

    // Apply additional validations
    if (field.validations) {
      field.validations.forEach((validation) => {
        if (
          field.type === "text" ||
          field.type === "email" ||
          field.type === "password" ||
          field.type === "tel"
        ) {
          if (validation.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodString).min(validation.min, {
              message:
                validation.message ||
                `${field.label} must be at least ${validation.min} characters`,
            });
          }
          if (validation.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodString).max(validation.max, {
              message:
                validation.message ||
                `${field.label} must be at most ${validation.max} characters`,
            });
          }
          if (validation.pattern) {
            fieldSchema = (fieldSchema as z.ZodString).regex(
              validation.pattern,
              {
                message:
                  validation.message || `${field.label} format is invalid`,
              },
            );
          }
        } else if (field.type === "number") {
          if (validation.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(validation.min, {
              message:
                validation.message ||
                `${field.label} must be at least ${validation.min}`,
            });
          }
          if (validation.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(validation.max, {
              message:
                validation.message ||
                `${field.label} must be at most ${validation.max}`,
            });
          }
        }
      });
    }

    schemaObj[field.name] = fieldSchema;
  });

  return z.object(schemaObj);
}

// Type for form state with dynamic error handling
export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
      data?: Record<string, any>;
    }
  | undefined;

export const UserFormSchema = createDynamicSchema([
  {
    name: "name",
    label: "Full Name",
    type: "text",
    required: true,
    validations: [
      { min: 2, message: "Name must be at least 2 characters long" },
    ],
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    validations: [
      { min: 8, message: "Password must be at least 8 characters long" },
      {
        pattern:
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        message:
          "Password must contain at least one letter, one number, and one special character",
      },
    ],
  },
]);
