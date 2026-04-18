"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyableIdProps {
  id: string;
  className?: string;
}

export function CopyableId({ id, className = "" }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    void navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={handleCopy}
        className={`inline-flex items-center justify-center rounded p-0.5 opacity-30 hover:opacity-80 cursor-pointer transition-opacity ${className}`}
      >
        {copied ? (
          <Check className="size-3 text-emerald-400" />
        ) : (
          <Copy className="size-3" />
        )}
      </TooltipTrigger>
      <TooltipContent side="top" className="mono text-xs">
        {copied ? "Copied!" : "Copy ID"}
      </TooltipContent>
    </Tooltip>
  );
}
