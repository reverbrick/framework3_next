import { createServerSupabaseClient } from "@/utils/supabase/server-component";
import { notFound } from "next/navigation";
import FormClient from "@/app/form/[id]/form-client";
import { generateAndSaveFormDefinition } from "@/utils/form/form-definition-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Dynamic Form',
  description: 'A dynamic form generated from database definition',
};

export default async function FormPage({
  params,
}: {
  params: { id: string }
} & {
  params: Promise<{ id: string }>;
}) {
  const supabase = createServerSupabaseClient();

  // Check if the form exists in the database
  const { data: formDefinition, error: formError } = await supabase
    .from('form_definitions')
    .select('form_name, fields, name, description')
    .eq('form_name', params.id)
    .single();

  if (formError && formError.code !== 'PGRST116') { // PGRST116 is "not found"
    notFound();
  }

  // If form doesn't exist, try to generate it
  if (!formDefinition) {
    try {
      await generateAndSaveFormDefinition(params.id);
      return <FormClient formName={params.id} formDescription={`Form for ${params.id.replace(/_/g, ' ')}`} />;
    } catch (error: any) {
      notFound();
    }
  }

  // If form exists but has null fields or empty fields array, return 404
  if (!formDefinition.fields || !Array.isArray(formDefinition.fields) || formDefinition.fields.length === 0) {
    notFound();
  }

  // If we get here, the form exists and has valid fields
  return <FormClient 
    formName={params.id}
    formDescription={formDefinition.description || `Form for ${params.id.replace(/_/g, ' ')}`}
  />;
} 