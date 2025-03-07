import { createServerSupabaseClient } from '@/utils/supabase/server-component';
import { handleSupabaseError } from '@/utils/supabase-error-handler';
import { Database } from '@/types/supabase';

type SupabaseClient = ReturnType<typeof createServerSupabaseClient>;
type TableName = keyof Database['public']['Tables'];

export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    type: string;
    message: string;
  }[];
  defaultValue?: any;
  order: number;
}

export interface FormDefinition {
  form_name: string;
  name: string;
  description?: string;
  fields: FormField[];
  layout?: {
    type: 'grid' | 'stack';
    columns?: number;
  };
}

interface ColumnDefinition {
  name: string;
  type: string;
  is_nullable: boolean;
  max_length?: number;
}

const SYSTEM_TABLES = ['table_definitions', 'form_definitions'] as const;

async function checkTableExists(supabase: SupabaseClient, tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName as TableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking table existence:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking table existence:', error);
    return false;
  }
}

async function checkTableDefinition(supabase: SupabaseClient, tableName: string): Promise<boolean> {
  try {
    console.log('Checking table definition for:', tableName);
    
    if (SYSTEM_TABLES.includes(tableName as typeof SYSTEM_TABLES[number])) {
      console.log('Skipping table definition check for system table:', tableName);
      return true;
    }
    
    const { data: tableDefinition, error } = await supabase
      .from('table_definitions')
      .select('*')
      .eq('table_name', tableName)
      .single();

    if (error) {
      console.error('Error checking table definition:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    if (!tableDefinition) {
      console.log('No table definition found, attempting to generate one...');
      const { data: newDefinition, error: generateError } = await supabase
        .from('table_definitions')
        .insert({
          table_name: tableName,
          name: formatTableName(tableName),
          description: `Table for ${formatTableName(tableName)}`,
          columns: []
        })
        .select()
        .single();

      if (generateError) {
        console.error('Error generating table definition:', generateError);
        return false;
      }

      const { data: columns, error: columnsError } = await supabase
        .from(tableName as TableName)
        .select('*')
        .limit(1);

      if (columnsError) {
        console.error('Error fetching columns:', columnsError);
        return false;
      }

      const columnDefinitions = generateColumnDefinitions(columns[0]);

      const { error: updateError } = await supabase
        .from('table_definitions')
        .update({ columns: columnDefinitions })
        .eq('table_name', tableName);

      if (updateError) {
        console.error('Error updating table definition with columns:', updateError);
        return false;
      }

      console.log('Generated table definition with columns:', columnDefinitions);
      return true;
    }

    return validateTableDefinition(tableDefinition);
  } catch (error) {
    console.error('Error checking table definition:', error);
    return false;
  }
}

function validateTableDefinition(definition: any): boolean {
  if (typeof definition !== 'object' || definition === null) {
    console.error('Invalid table definition - not an object:', definition);
    return false;
  }

  if (!definition.columns) {
    console.error('Invalid table definition - missing columns property:', definition);
    return false;
  }

  if (!Array.isArray(definition.columns)) {
    console.error('Invalid table definition - columns is not an array:', definition.columns);
    return false;
  }

  if (definition.columns.length === 0) {
    console.error('Invalid table definition - empty columns array');
    return false;
  }

  console.log('Valid table definition found with columns:', definition.columns);
  return true;
}

function generateColumnDefinitions(sampleRow: any): ColumnDefinition[] {
  return Object.entries(sampleRow).map(([key, value]) => ({
    name: key,
    type: typeof value === 'number' ? 'number' : 'text',
    is_nullable: true
  }));
}

function formatTableName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

async function checkFormDefinitionsTable(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('form_definitions')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking form_definitions table:', error);
      return false;
    }

    console.log('form_definitions table is accessible');
    return true;
  } catch (error) {
    console.error('Error checking form_definitions table:', error);
    return false;
  }
}

export async function generateAndSaveFormDefinition(formName: string): Promise<boolean> {
  console.log('Starting form definition generation for:', formName);
  const supabase = createServerSupabaseClient();

  try {
    const formDefinitionsAccessible = await checkFormDefinitionsTable(supabase);
    if (!formDefinitionsAccessible) {
      throw new Error('form_definitions table is not accessible');
    }

    const tableExists = await checkTableExists(supabase, formName as string);
    if (!tableExists) {
      throw new Error(`Table ${formName} does not exist in the database`);
    }

    if (!SYSTEM_TABLES.includes(formName as typeof SYSTEM_TABLES[number])) {
      const hasValidDefinition = await checkTableDefinition(supabase, formName as string);
      if (!hasValidDefinition) {
        throw new Error(`Table ${formName} has no valid definition in table_definitions`);
      }
    }

    const { data: existingDefinition, error: checkError } = await supabase
      .from('form_definitions')
      .select('*')
      .eq('form_name', formName)
      .single();

    if (checkError && Object.keys(checkError).length === 0) {
      console.log('No existing form definition found, proceeding with generation');
    } else if (checkError && checkError.code !== 'PGRST116') {
      handleSupabaseError(checkError, {
        context: "checking form definition",
        fallbackMessage: "Failed to check form definition."
      });
      return false;
    }

    if (existingDefinition) {
      console.log('Form definition already exists:', existingDefinition);
      return true;
    }

    const { data: tableDefinition, error: tableError } = await supabase
      .from('table_definitions')
      .select('columns')
      .eq('table_name', formName)
      .single();

    if (tableError) {
      handleSupabaseError(tableError, {
        context: "fetching table definition",
        fallbackMessage: "Failed to fetch table definition."
      });
      return false;
    }

    if (!tableDefinition?.columns) {
      throw new Error('No columns found in table definition');
    }

    const fields = generateFormFields(tableDefinition.columns);
    const formDefinition = createFormDefinition(formName, fields);

    const { error: insertError } = await supabase
      .from('form_definitions')
      .insert(formDefinition);

    if (insertError) {
      handleSupabaseError(insertError, {
        context: "inserting form definition",
        fallbackMessage: "Failed to insert form definition."
      });
      return false;
    }

    console.log('Form definition created successfully');
    return true;
  } catch (error: any) {
    console.error('Error generating form definition:', error);
    return false;
  }
}

function generateFormFields(columns: ColumnDefinition[]): FormField[] {
  return columns.map((column, index) => ({
    id: column.name,
    name: column.name,
    type: mapColumnTypeToFormType(column.type),
    label: formatTableName(column.name),
    required: !column.is_nullable,
    order: index,
    validation: generateValidationRules(column)
  }));
}

function createFormDefinition(formName: string, fields: FormField[]): FormDefinition {
  return {
    form_name: formName,
    name: formatTableName(formName),
    description: `Form for ${formatTableName(formName)}`,
    fields,
    layout: {
      type: 'stack',
      columns: 1
    }
  };
}

const COLUMN_TYPE_MAP: Record<string, string> = {
  'text': 'text',
  'varchar': 'text',
  'char': 'text',
  'integer': 'number',
  'bigint': 'number',
  'smallint': 'number',
  'decimal': 'number',
  'numeric': 'number',
  'real': 'number',
  'double precision': 'number',
  'boolean': 'checkbox',
  'date': 'date',
  'timestamp': 'datetime',
  'time': 'time',
  'json': 'textarea',
  'jsonb': 'textarea',
  'enum': 'select',
  'uuid': 'text'
};

function mapColumnTypeToFormType(columnType: string): string {
  return COLUMN_TYPE_MAP[columnType.toLowerCase()] || 'text';
}

function generateValidationRules(column: ColumnDefinition): { type: string; message: string }[] {
  const rules: { type: string; message: string }[] = [];

  if (!column.is_nullable) {
    rules.push({
      type: 'required',
      message: `${column.name} is required`
    });
  }

  switch (column.type.toLowerCase()) {
    case 'varchar':
    case 'char':
      if (column.max_length) {
        rules.push({
          type: 'maxLength',
          message: `${column.name} must be at most ${column.max_length} characters`
        });
      }
      break;
    case 'integer':
    case 'bigint':
    case 'smallint':
      rules.push({
        type: 'number',
        message: `${column.name} must be a number`
      });
      break;
    case 'date':
      rules.push({
        type: 'date',
        message: `${column.name} must be a valid date`
      });
      break;
    case 'timestamp':
      rules.push({
        type: 'datetime',
        message: `${column.name} must be a valid date and time`
      });
      break;
  }

  return rules;
} 