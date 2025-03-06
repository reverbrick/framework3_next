"use client";

import * as React from "react";
import { useActionState } from "react";
import { processForm } from "@/app/forms/dynamic/actions/form";
import type {
  FieldConfig,
  UISchema,
  FormState,
  UISchemaGroupItem,
  UISchemaNamedGroupItem,
  UISchemaItem,
} from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useMemo, useCallback } from "react";

interface DynamicFormProps {
  fields: FieldConfig[];
  uiSchema: UISchema;
  submitLabel?: string;
  successRedirect?: string;
}

type ActionState = {
  errors: { [x: string]: string[] | undefined };
  message: string;
  success: boolean;
  data?: undefined;
} | {
  message: string;
  success: boolean;
  data: { [x: string]: any };
  errors?: undefined;
} | {
  message: string;
  success: boolean;
  errors?: undefined;
  data?: undefined;
};

const initialState: ActionState = {
  message: "",
  errors: {},
  success: false,
};

export function DynamicForm({
  fields,
  uiSchema,
  submitLabel = "Submit",
  successRedirect,
}: DynamicFormProps) {
  const boundAction = async (
    state: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    const result = await processForm(fields, state as FormState, formData);
    return result as ActionState;
  };
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [showSuccess, setShowSuccess] = useState(false);

  if (state?.success && !showSuccess) {
    setShowSuccess(true);
    if (successRedirect) {
      window.location.href = successRedirect;
    }
  }

  const renderField = useCallback(
    (field: FieldConfig) => {
      const uiConfig = uiSchema[field.name];
      if (
        !uiConfig ||
        uiConfig.uiType === "spacer" ||
        uiConfig.uiType === "group" ||
        uiConfig.uiType === "namedGroup"
      )
        return null;

      const commonProps = {
        id: field.name,
        name: field.name,
        placeholder: uiConfig.placeholder || field.placeholder,
        required: field.required,
        className: uiConfig.className,
      };

      switch (uiConfig.uiType) {
        case "textarea":
          return <Textarea {...commonProps} rows={uiConfig.rows || 3} />;
        case "select":
          return (
            <Select {...commonProps}>
              <SelectTrigger>
                <SelectValue placeholder={uiConfig.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {uiConfig.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case "radio":
          return (
            <RadioGroup {...commonProps} className={uiConfig.layout === "horizontal" ? "flex flex-row space-x-4" : "space-y-2"}>
              {uiConfig.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${field.name}-${option.value}`}
                  />
                  <Label htmlFor={`${field.name}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );
        case "checkbox":
          return (
            <div className={uiConfig.layout === "horizontal" ? "flex flex-row space-x-4" : "space-y-2"}>
              {uiConfig.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option.value}`}
                    value={option.value}
                  />
                  <Label htmlFor={`${field.name}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          );
        default:
          return (
            <Input {...commonProps} type={uiConfig.uiType || field.type} />
          );
      }
    },
    [uiSchema],
  );

  const renderFieldWrapper = useCallback(
    (fieldName: string) => {
      const field = fields.find((f) => f.name === fieldName);
      const item = uiSchema[fieldName];
      if (!field || !item) return null;

      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>{item.label || field.label}</Label>
          {renderField(field)}
          {item.helperText && (
            <p className="text-sm text-muted-foreground">{item.helperText}</p>
          )}
          {state?.errors?.[fieldName] && (
            <div className="text-sm text-red-500">
              {state.errors[fieldName].map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </div>
      );
    },
    [fields, uiSchema, state, renderField],
  );

  type RenderUISchemaItemFn = (
    item: UISchemaItem,
    key: string,
    renderedFields: Set<string>
  ) => React.ReactElement | null;

  const renderUISchemaItem: RenderUISchemaItemFn = useCallback((item, key, renderedFields) => {
    switch (item.uiType) {
      case "namedGroup":
        return renderNamedGroup(item, renderedFields);
      case "group":
        return renderGroup(item, key, renderedFields);
      case "spacer":
        return (
          <div
            key={key}
            style={{ height: item.height }}
            className={item.className}
          />
        );
      default:
        return renderFieldWrapper(key);
    }
  }, [renderFieldWrapper]);

  const renderGroup = useCallback(
    (group: UISchemaGroupItem, groupName: string, renderedFields: Set<string>) => {
      const layoutClass =
        group.layout === "horizontal" ? "flex flex-row space-x-4" : "space-y-4";
      return (
        <div
          key={groupName}
          className={`${layoutClass} ${group.className || ""}`}
        >
          {group.fields.map((fieldName) => {
            const item = uiSchema[fieldName];
            if (!item || renderedFields.has(fieldName)) return null;
            renderedFields.add(fieldName);
            return renderUISchemaItem(item, fieldName, renderedFields);
          })}
        </div>
      );
    },
    [uiSchema, renderUISchemaItem],
  );

  const renderNamedGroup = useCallback(
    (group: UISchemaNamedGroupItem, renderedFields: Set<string>) => {
      const layoutClass =
        group.layout === "horizontal" ? "flex flex-row space-x-4" : "space-y-4";
      return (
        <Card key={group.name} className={group.className}>
          <CardHeader>
            <CardTitle>{group.label}</CardTitle>
          </CardHeader>
          <CardContent className={layoutClass}>
            {group.fields.map((fieldName) => {
              const item = uiSchema[fieldName];
              if (!item || renderedFields.has(fieldName)) return null;
              renderedFields.add(fieldName);
              return renderUISchemaItem(item, fieldName, renderedFields);
            })}
          </CardContent>
        </Card>
      );
    },
    [uiSchema, renderUISchemaItem],
  );

  const formElements = useMemo(() => {
    const renderedFields = new Set<string>();

    return Object.entries(uiSchema)
      .map(([key, item]) => {
        if (item.uiType === "group" || item.uiType === "namedGroup") {
          return renderUISchemaItem(item, key, renderedFields);
        }
        if (!renderedFields.has(key)) {
          renderedFields.add(key);
          return renderUISchemaItem(item, key, renderedFields);
        }
        return null;
      })
      .filter(Boolean);
  }, [uiSchema, renderUISchemaItem]);

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && (
        <div
          className={`rounded-md p-3 text-sm ${state.success ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
        >
          {state.message}
        </div>
      )}

      {formElements}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Processing..." : submitLabel}
      </Button>
    </form>
  );
}
