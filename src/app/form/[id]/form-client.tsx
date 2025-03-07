"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { createClient } from "@/utils/supabase/client";
import { handleSupabaseError } from "@/utils/supabase-error-handler";
import { generateAndSaveFormDefinition } from "@/utils/form/form-definition-utils";
import { generateFormConfigFromDefinition } from "@/utils/form/form-config-utils";
import { Form } from "@/components/form/form";
import { FormConfig } from "@/utils/form/form-config-utils";
import { FormDefinition } from "@/utils/form/form-definition-utils";

interface FormClientProps {
  formName: string;
  formDescription: string;
}

export default function FormClient({ formName, formDescription }: FormClientProps) {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(formName);
  const [displayDescription, setDisplayDescription] = useState(formDescription);
  const supabase = createClient();

  // Initialize form definition and configuration
  useEffect(() => {
    const initializeForm = async () => {
      try {
        // First, ensure we have a form definition
        console.log('Initializing form for:', formName);
        const definitionSuccess = await generateAndSaveFormDefinition(formName);
        if (!definitionSuccess) {
          const errorMessage = `Failed to generate form definition for ${formName}. Please check if the table exists and has the correct structure.`;
          console.error(errorMessage);
          setError(errorMessage);
          return;
        }

        // Get the form definition to get the display name and description
        console.log('Fetching form definition...');
        const { data: definition, error: definitionError } = await supabase
          .from('form_definitions')
          .select('form_name, name, description, fields, layout')
          .eq('form_name', formName)
          .single();

        if (definitionError) {
          console.error('Error fetching form definition:', definitionError);
          handleSupabaseError(definitionError, {
            context: "fetching form definition",
            fallbackMessage: "Failed to fetch form definition."
          });
          setError('Failed to fetch form definition');
          return;
        }

        if (definition) {
          setDisplayName(definition.name || formName);
          setDisplayDescription(definition.description || formDescription);

          // Generate form configuration from the definition
          console.log('Generating form configuration...');
          const config = generateFormConfigFromDefinition(definition as FormDefinition);
          if (!config) {
            const errorMessage = 'Failed to generate form configuration';
            console.error(errorMessage);
            setError(errorMessage);
            return;
          }

          setFormConfig(config);
        } else {
          const errorMessage = 'No form definition found';
          console.error(errorMessage);
          setError(errorMessage);
        }
      } catch (error: any) {
        console.error('Error initializing form:', error);
        setError(error.message || 'Failed to initialize form');
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [formName, formDescription]);

  const handleSubmit = async (data: any) => {
    try {
      const { error: insertError } = await supabase
        .from(formName)
        .insert(data);

      if (insertError) {
        handleSupabaseError(insertError, {
          context: "submitting form data",
          fallbackMessage: "Failed to submit form data."
        });
        throw insertError;
      }

      // Handle successful submission (e.g., show success message, redirect)
      console.log('Form submitted successfully');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <PageLayout title={displayName} description={displayDescription}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading {displayName}...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title={displayName} description={displayDescription}>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading form</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!formConfig) {
    return (
      <PageLayout title={displayName} description={displayDescription}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No configuration available for {displayName}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={displayName} description={displayDescription}>
      <div className="max-w-2xl mx-auto">
        <Form config={formConfig} onSubmit={handleSubmit} />
      </div>
    </PageLayout>
  );
} 