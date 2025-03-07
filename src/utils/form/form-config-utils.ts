import { FormDefinition, FormField } from './form-definition-utils';

export interface FormConfig {
  name: string;
  description?: string;
  fields: FormField[];
  layout: {
    type: 'grid' | 'stack';
    columns?: number;
  };
}

export function generateFormConfigFromDefinition(definition: FormDefinition): FormConfig {
  return {
    name: definition.name,
    description: definition.description,
    fields: definition.fields.sort((a, b) => a.order - b.order),
    layout: definition.layout || {
      type: 'stack',
      columns: 1
    }
  };
}

export function generateFormFieldsFromConfig(config: FormConfig): FormField[] {
  return config.fields.map(field => ({
    ...field,
    validation: field.validation || []
  }));
}

export function validateFormData(data: any, config: FormConfig): { isValid: boolean; errors: { [key: string]: string } } {
  const errors: { [key: string]: string } = {};

  config.fields.forEach(field => {
    const value = data[field.id];

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.id] = `${field.label} is required`;
      return;
    }

    // Skip validation for optional empty fields
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Apply validation rules
    field.validation?.forEach(rule => {
      switch (rule.type) {
        case 'required':
          if (!value) {
            errors[field.id] = rule.message;
          }
          break;
        case 'maxLength':
          if (value.length > parseInt(rule.message.match(/\d+/)?.[0] || '0')) {
            errors[field.id] = rule.message;
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            errors[field.id] = rule.message;
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors[field.id] = rule.message;
          }
          break;
        case 'datetime':
          if (isNaN(Date.parse(value))) {
            errors[field.id] = rule.message;
          }
          break;
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 