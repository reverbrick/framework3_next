"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { DynamicForm } from "../../components/dynamic-form";
import type { FieldConfig, UISchema } from "@/lib/definitions";

const fields: FieldConfig[] = [
  {
    name: "numer_karty",
    label: "Numer karty",
    type: "text", // Matches FieldType
    required: true,
  },
  {
    name: "imie_nazwisko",
    label: "Imię i nazwisko",
    type: "text", // Matches FieldType
    required: true,
  },
  {
    name: "wiek",
    label: "Wiek",
    type: "number", // Matches FieldType
  },
  {
    name: "wypadanie_nasilenie",
    label: "Nasilenie",
    type: "text", // Matches FieldType
  },
];

const userFormUISchema: UISchema = {
  numer_karty: {
    uiType: "text",
    placeholder: "Numer karty",
    helperText: "Numer karty - opis.",
  },
  g_dane_klienta: {
    uiType: "namedGroup",
    name: "g_dane_klienta",
    label: "Dane Klienta",
    fields: ["g_imie_wiek"],
    layout: "vertical",
  },
  g_imie_wiek: {
    uiType: "group",
    layout: "horizontal",
    fields: ["imie_nazwisko", "wiek"],
    className: "items-start",
  },
  imie_nazwisko: {
    uiType: "text",
    placeholder: "Imię i nazwisko",
  },
  wiek: {
    uiType: "number",
    label: "Wiek",
    placeholder: "Wiek",
  },
  g_wypadanie: {
    uiType: "namedGroup",
    name: "g_wypadanie",
    label: "Wypadanie włosów",
    fields: ["wypadanie_nasilenie"],
    layout: "vertical",
  },
  wypadanie_nasilenie: {
    uiType: "radio",
    options: [
      {
        label: "w normie",
        value: "w normie",
      },
      {
        label: "nasilone",
        value: "nasilone",
      },
      {
        label: "nadmierne",
        value: "nadmierne",
      },
      {
        label: "okresowe",
        value: "okresowe",
      },
      {
        label: "brak",
        value: "brak",
      },
    ],
  },
};

export default function Page() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Karta klienta trychologicznego
            </h2>
            <p className="text-muted-foreground">
              Karta klienta trychologicznego - opis
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <DynamicForm
            fields={fields}
            uiSchema={userFormUISchema}
            submitLabel="Create Account"
            successRedirect="/dashboard"
          />
        </div>
      </Main>
    </>
  );
}
