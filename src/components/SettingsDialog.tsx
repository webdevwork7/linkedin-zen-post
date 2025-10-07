import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Webhook, Image, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [pexelsKey, setPexelsKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load values: keys and webhook from environment
    setOpenrouterKey(import.meta.env.VITE_OPENROUTER_API_KEY || "");
    setPexelsKey(import.meta.env.VITE_PEXELS_API_KEY || "");
    setWebhookUrl(import.meta.env.VITE_N8N_WEBHOOK_URL || "");
  }, [open]);

  const handleSave = () => {
    // Env-based configuration; nothing to save.
    toast({
      title: "✅ Settings Loaded",
      description: "API keys and webhook are loaded from environment variables.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
          <DialogDescription>
            All configuration (API keys and webhook) is loaded from environment variables.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
        >
          {/* OpenRouter API Key */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Key className="w-4 h-4 text-primary" />
              OpenRouter API Key
            </Label>
            <Input
              type="password"
              value={openrouterKey}
              placeholder="sk-or-..."
              className="bg-background border-border"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Used for AI text generation and rewriting.{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get your key here
              </a>
            </p>
          </div>

          {/* Pexels API Key */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Image className="w-4 h-4 text-primary" />
              Pexels API Key
            </Label>
            <Input
              type="password"
              value={pexelsKey}
              placeholder="Your Pexels API key"
              className="bg-background border-border"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Used for searching and fetching images by prompt.{" "}
              <a
                href="https://www.pexels.com/api/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get your key here
              </a>
            </p>
          </div>

          {/* n8n Webhook URL */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Webhook className="w-4 h-4 text-primary" />
              n8n Webhook URL
            </Label>
            <Input
              type="url"
              value={webhookUrl}
              placeholder="https://your-n8n-instance.com/webhook/..."
              className="bg-background border-border"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              The webhook URL that receives your LinkedIn post data.
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary-hover"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
