'use client';

import { InfoIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MessagingPlatformFieldProps {
  value: {
    is_imessage_persona: boolean;
    is_telegram_persona: boolean;
  };
  onChange: (val: { is_imessage_persona: boolean; is_telegram_persona: boolean }) => void;
}

export const MessagingPlatformField: React.FC<MessagingPlatformFieldProps> = ({ value = { is_imessage_persona: false, is_telegram_persona: false }, onChange }) => {
  return (
    <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Switch
                checked={value?.is_imessage_persona ?? false}
                onCheckedChange={(checked) => onChange({ ...value, is_imessage_persona: checked })}
                />
                <span className="text-sm">Apple Messages</span>
            </div>
            <div className="flex items-center gap-2">
                <Switch
                checked={value?.is_telegram_persona ?? false}
                onCheckedChange={(checked) => onChange({ ...value, is_telegram_persona: checked })}
                />
                <span className="text-sm">Telegram</span>
            </div>
        </div>
        <Tooltip>
            <TooltipTrigger asChild>
            <InfoIcon className="size-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
            <p>Each messaging platform can have only one active persona. A persona can be enabled for both platforms simultaneously. All personas remain accessible through the web interface regardless of platform settings.</p>
            </TooltipContent>
        </Tooltip>
    </div>
  );
}; 