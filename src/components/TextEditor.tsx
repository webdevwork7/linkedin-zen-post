import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Sparkles, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TextEditor = ({ value, onChange }: TextEditorProps) => {
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const callOpenRouter = async (prompt: string, systemPrompt: string) => {
    const apiKey = localStorage.getItem("openrouter_api_key") || "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";
    
    if (!apiKey) {
      toast({
        title: "Missing API Key",
        description: "Please configure your OpenRouter API key in settings.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "LinkedIn Post Automator",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to call OpenRouter API");
      }

      const data = await response.json();
      let text = data.choices[0]?.message?.content || "";
      // Clean up response text
      text = text
        .replace(/^['"`]+|['"`]+$/g, "")
        .trim();
      return text;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content. Please check your API key.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleRewrite = async () => {
    if (!value.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some text to rewrite.",
        variant: "destructive",
      });
      return;
    }

    setIsRewriting(true);
    const result = await callOpenRouter(
      value,
      "You are a professional LinkedIn content writer. Rewrite the following text to make it more engaging, professional, and suitable for LinkedIn. Keep the same general message but enhance the writing quality. CRITICAL: Return ONLY the single rewritten text itself with absolutely no options, no numbered lists, no explanations, no preambles like 'here are options' or 'option 1/2/3', and no additional commentary whatsoever. Just output the improved text directly as if you are posting it."
    );
    
    if (result) {
      onChange(result);
      toast({
        title: "✨ Rewritten!",
        description: "Your text has been improved.",
      });
    }
    setIsRewriting(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await callOpenRouter(
      "Generate a professional LinkedIn post",
      "You are a professional LinkedIn content creator. Generate an engaging, professional LinkedIn post about a relevant business or industry topic. Make it authentic, valuable, and engaging. Use proper formatting with line breaks. Return only the post content without any explanations."
    );
    
    if (result) {
      onChange(result);
      toast({
        title: "✨ Generated!",
        description: "AI caption created successfully.",
      });
    }
    setIsGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-2"
    >
      <Label className="text-sm font-semibold text-foreground">Post Content</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What do you want to share with your network?"
        className="min-h-[150px] resize-none bg-card border-border focus:border-primary transition-colors text-base"
      />
      
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRewrite}
          disabled={isRewriting || !value.trim()}
          className="hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {isRewriting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Rewriting...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Rewrite / Autocomplete
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Caption
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default TextEditor;
