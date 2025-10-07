import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Sparkles, Image as ImageIcon, Video, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PostTypeSelector from "@/components/PostTypeSelector";
import TextEditor from "@/components/TextEditor";
import ImageSection from "@/components/ImageSection";
import VideoInput from "@/components/VideoInput";
import SettingsDialog from "@/components/SettingsDialog";

export type PostType = "text" | "article" | "article-image" | "image" | "video";

const Index = () => {
  const [postType, setPostType] = useState<PostType>("text");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Get webhook URL from localStorage
    const webhookUrl = localStorage.getItem("n8n_webhook_url");
    
    if (!webhookUrl) {
      toast({
        title: "Missing Configuration",
        description: "Please configure your n8n webhook URL in settings.",
        variant: "destructive",
      });
      return;
    }

    if (!caption.trim()) {
      toast({
        title: "Missing Content",
        description: "Please add some text to your post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        post_type: postType,
        text: caption,
        image_url: imageUrl || undefined,
        video_url: videoUrl || undefined,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send post");
      }

      toast({
        title: "✅ Success!",
        description: "Post sent to LinkedIn automation!",
        className: "bg-success text-success-foreground",
      });

      // Reset form
      setCaption("");
      setImageUrl("");
      setVideoUrl("");
      setPostType("text");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send post. Please check your webhook URL.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">LinkedIn Post Automator</h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="hover:bg-accent"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 shadow-lg">
            <div className="space-y-6">
              {/* Post Type */}
              <PostTypeSelector value={postType} onChange={setPostType} />

              {/* Text Editor */}
              <TextEditor value={caption} onChange={setCaption} />

              {/* Image Section */}
              {(postType === "image" || postType === "article-image") && (
                <ImageSection imageUrl={imageUrl} onImageUrlChange={setImageUrl} />
              )}

              {/* Video Input */}
              {postType === "video" && (
                <VideoInput value={videoUrl} onChange={setVideoUrl} />
              )}

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary-hover transition-colors"
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Sending to LinkedIn...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Post to LinkedIn
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">AI-Powered</p>
            <p className="text-xs text-muted-foreground mt-1">Smart content generation</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <ImageIcon className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Image Search</p>
            <p className="text-xs text-muted-foreground mt-1">Pexels integration</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-shadow">
            <Video className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Multi-Format</p>
            <p className="text-xs text-muted-foreground mt-1">Text, images & videos</p>
          </Card>
        </motion.div>
      </main>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Index;
