import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Sparkles, Loader2, Link } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CharacterLengthSelector from "./CharacterLengthSelector";

interface ArticleEditorProps {
  articleUrl: string;
  onArticleUrlChange: (url: string) => void;
  caption: string;
  onCaptionChange: (caption: string) => void;
}

const ArticleEditor = ({
  articleUrl,
  onArticleUrlChange,
  caption,
  onCaptionChange,
}: ArticleEditorProps) => {
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
    if (!caption.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some text to rewrite.",
        variant: "destructive",
      });
      return;
    }

    setIsRewriting(true);
    const result = await callOpenRouter(
      caption,
      `You are a strict, professional LinkedIn creator. Rewrite the user's text as a compelling article promotion post in a crisp, value-driven LinkedIn tone: speak clearly, avoid hype, avoid emojis, avoid hashtags unless essential (max 2), no salesy language. Prefer active voice and short sentences. CRITICAL: The output must be EXACTLY ${characterLength} characters or fewer. Count every character including spaces and punctuation. If the text exceeds ${characterLength} characters, cut it short and end with proper punctuation. Preserve the original intent within this strict character limit. Output exactly one final paragraph of plain text — no headings, no lists, no options, no preamble, no quotes, no markdown, no notes. Respond ONLY with the rewritten text that is ${characterLength} characters or fewer.`
    );

    if (result) {
      onCaptionChange(result);
      toast({
        title: "✨ Rewritten!",
        description: "Your article caption has been improved.",
      });
    }
    setIsRewriting(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const prompt = articleUrl.trim()
      ? `Generate a professional LinkedIn post to promote this article: ${articleUrl}`
      : "Generate a professional LinkedIn post to promote an article";

    const result = await callOpenRouter(
      prompt,
      `You are a strict, professional LinkedIn creator. Write one concise, value-led LinkedIn post to promote an article. Use a clear hook, one or two short sentences about the article's value, and a simple call-to-action to read more. Avoid emojis and salesy language; hashtags only if essential (max 2). CRITICAL: The output must be EXACTLY ${characterLength} characters or fewer. Count every character including spaces and punctuation. If the text exceeds ${characterLength} characters, cut it short and end with proper punctuation. Output exactly one plain-text paragraph — no headings, no bullets, no options, no preamble, no quotes, no markdown. Respond ONLY with the post text that is ${characterLength} characters or fewer.`
    );

    if (result) {
      onCaptionChange(result);
      toast({
        title: "✨ Generated!",
        description: "Article promotion caption created successfully.",
      });
    }
    setIsGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Article URL Input */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Article URL
        </Label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={articleUrl}
            onChange={(e) => onArticleUrlChange(e.target.value)}
            placeholder="https://blog.example.com/post"
            className="pl-10 bg-card border-border focus:border-primary"
          />
        </div>
      </div>

      {/* Caption Editor */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Article Promotion Caption
        </Label>
        <Textarea
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Write a compelling caption to promote your article..."
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
            disabled={isRewriting || !caption.trim()}
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
                Generate Article Caption
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleEditor;
