'use client';

import { useState } from 'react';
import { FormConfig } from '@/utils/form/form-config-utils';
import { FormField } from './form-field';
import { Button } from '@/components/ui/button';
import { validateFormData } from '@/utils/form/form-config-utils';
import { cn } from '@/lib/utils';

interface FormProps {
  config: FormConfig;
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
  className?: string;
}

export function Form({ config, onSubmit, submitLabel = 'Submit', className }: FormProps) {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // Clear error when field is modified
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { isValid, errors: validationErrors } = validateFormData(formData, config);
      
      if (!isValid) {
        setErrors(validationErrors);
        return;
      }

      await onSubmit(formData);
    } catch (error: any) {
      console.error('Form submission error:', error);
      // Handle submission error (you might want to show a toast or error message)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className={cn(
        'grid gap-6',
        config.layout.type === 'grid' ? `grid-cols-${config.layout.columns || 1}` : 'grid-cols-1'
      )}>
        {config.fields.map(field => (
          <FormField
            key={field.id}
            field={field}
            value={formData[field.id]}
            onChange={(value) => handleFieldChange(field.id, value)}
            error={errors[field.id]}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form>
  );
} 