import { useEffect } from "react";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · UNCFLIX` : "UNCFLIX";
    return () => {
      document.title = "UNCFLIX";
    };
  }, [title]);
}
