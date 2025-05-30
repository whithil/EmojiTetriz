
"use client";

import { useLocalization } from "@/contexts/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocalization();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("en-US")} disabled={locale === "en-US"}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("pt-BR")} disabled={locale === "pt-BR"}>
          Português (BR)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("es-ES")} disabled={locale === "es-ES"}>
          Español
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("fr-FR")} disabled={locale === "fr-FR"}>
          Français
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("de-DE")} disabled={locale === "de-DE"}>
          Deutsch
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
