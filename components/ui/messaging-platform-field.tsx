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
                <p>Each messaging platform can have only one active persona but any <br></br> given persona can be enabled for multiple platforms simultaneously. <br></br> Further, all personas will remain accessible through the web interface.</p>
            </TooltipContent>
        </Tooltip>
    </div>
  );
}; 