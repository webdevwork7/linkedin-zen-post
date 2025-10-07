import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Key, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ApiKeySetupProps {
  onOpenSettings: () => void;
}

const ApiKeySetup = ({ onOpenSettings }: ApiKeySetupProps) => {
  const [hasKeys, setHasKeys] = useState(false);

  useEffect(() => {
    const checkKeys = () => {
      const openrouter = localStorage.getItem("openrouter_api_key");
      const pexels = localStorage.getItem("pexels_api_key");
      const webhook = localStorage.getItem("n8n_webhook_url");
      setHasKeys(!!(openrouter && pexels && webhook));
    };

    checkKeys();
    // Check periodically
    const interval = setInterval(checkKeys, 1000);
    return () => clearInterval(interval);
  }, []);

  if (hasKeys) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Alert className="bg-success/10 border-success/20">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">All Set!</AlertTitle>
          <AlertDescription className="text-success/80">
            Your API keys and webhook are configured.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Alert variant="destructive" className="bg-primary/10 border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Setup Required</AlertTitle>
        <AlertDescription className="text-primary/80 space-y-2">
          <p>Configure your API keys to enable all features.</p>
          <Button
            onClick={onOpenSettings}
            variant="outline"
            size="sm"
            className="mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Key className="w-4 h-4 mr-2" />
            Open Settings
          </Button>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default ApiKeySetup;
