"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// এই প্রোভাইডারটি পুরো অ্যাপকে ডার্ক/লাইট মোড সম্পর্কে জানাবে
export function ThemeProvider({ children, ...props }: any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}