import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Sparkles, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CharacterLengthSelector from "./CharacterLengthSelector";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TextEditor = ({ value, onChange }: TextEditorProps) => {
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterLength, setCharacterLength] = useState(100);
  const { toast } = useToast();

  // Normalize model output to a single, clean paragraph (no options or preamble)
  const normalizeResponse = (raw: string) => {
    let text = raw || "";
    // Remove common option labels and markdown bolding
    text = text
      .replace(/\*\*?Option\s*\d+\s*:\*\*?/gi, "")
      .replace(/Option\s*\d+\s*:/gi, "");
    // Remove leading preambles like "Here it is", "Choose", "Response:"
    text = text.replace(
      /^(?:here\s+(?:it|is)|choose.*|selected.*|response:?|output:?|final:?|options?:)\s*/i,
      ""
    );
    // Take the first non-empty paragraph if multiple paragraphs are present
    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paragraphs.length > 0) {
      text = paragraphs[0];
    }
    // If bullets or numbered lists are present, take the first clean line
    const lines = text
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const firstLine =
      lines.find(
        (l) => !/^(\*|-|\d+\.)\s/.test(l) && !/^\s*Option\s*\d+/i.test(l)
      ) ||
      lines[0] ||
      "";
    text = firstLine;
    // Strip surrounding quotes/markdown and return
    return text
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/^\*\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .trim();
  };

  const callOpenRouter = async (prompt: string, systemPrompt: string) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as
      | string
      | undefined;

    if (!apiKey) {
      toast({
        title: "Missing API Key",
        description: "OpenRouter API key missing in environment.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "LinkedIn Post Automator",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
            temperature: 0.2,
            stop: ["Option", "Choose", "Here it is", "Options"],
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to call OpenRouter API");
      }

      const data = await response.json();
      let text = data.choices[0]?.message?.content || "";
      // Normalize to a single direct response with no options or preambles
      text = normalizeResponse(text);
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
      `You are a strict, professional LinkedIn creator. Rewrite the user's text in a crisp, value-driven LinkedIn tone: speak clearly, avoid hype, avoid emojis, avoid hashtags unless essential (max 2), no salesy language. Prefer active voice and short sentences. CRITICAL: The output must be EXACTLY ${characterLength} characters or fewer. Count every character including spaces and punctuation. If the text exceeds ${characterLength} characters, cut it short and end with proper punctuation. Preserve the original intent within this strict character limit. Output exactly one final paragraph of plain text — no headings, no lists, no options, no preamble, no quotes, no markdown, no notes. Respond ONLY with the rewritten text that is ${characterLength} characters or fewer.`
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
      `You are a strict, professional LinkedIn creator. Write one concise, value-led LinkedIn post suitable for a company page. Use a clear hook, one or two short sentences of insight, and a simple call-to-action. Avoid emojis and salesy language; hashtags only if essential (max 2). CRITICAL: The output must be EXACTLY ${characterLength} characters or fewer. Count every character including spaces and punctuation. If the text exceeds ${characterLength} characters, cut it short and end with proper punctuation. Output exactly one plain-text paragraph — no headings, no bullets, no options, no preamble, no quotes, no markdown. Respond ONLY with the post text that is ${characterLength} characters or fewer.`
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
      <Label className="text-sm font-semibold text-foreground">
        Post Content
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What do you want to share with your network?"
        className="min-h-[150px] resize-none bg-card border-border focus:border-primary transition-colors text-base"
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Length:</Label>
          <CharacterLengthSelector
            value={characterLength}
            onChange={setCharacterLength}
            className="text-sm"
          />
        </div>

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
