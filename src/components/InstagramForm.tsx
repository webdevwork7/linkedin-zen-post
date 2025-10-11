import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ImageSection from "@/components/ImageSection";
import TextEditor from "@/components/TextEditor";

type IGPostType = "image" | "story_image" | "story_video" | "reel" | "carousel";

interface InstagramPayload {
  node_type: "instagram";
  node: string;
  post_type: IGPostType;
  text?: string;
  image_url?: string;
  video_url?: string;
  cover_image_url?: string;
  image_urls?: string[];
}

const InstagramForm = () => {
  const [postType, setPostType] = useState<IGPostType>("image");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [carouselUrls, setCarouselUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
  const instagramBusinessId = import.meta.env.VITE_INSTAGRAM_BUSINESS_ID as
    | string
    | undefined;

  const canSubmit = useMemo(() => {
    switch (postType) {
      case "image":
        return !!imageUrl && !!caption.trim();
      case "story_image":
        return !!imageUrl; // caption optional
      case "story_video":
        return !!videoUrl; // caption optional
      case "reel":
        return !!videoUrl && !!caption.trim();
      case "carousel":
        return carouselUrls.length >= 2 && !!caption.trim();
      default:
        return false;
    }
  }, [postType, imageUrl, videoUrl, caption, carouselUrls]);

  const uploadToCloudinary = async (file: File, type: "image" | "video") => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
      | string
      | undefined;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
      | string
      | undefined;
    if (!cloudName || !uploadPreset) {
      toast({
        title: "Missing Cloudinary config",
        description: "Check env vars.",
        variant: "destructive",
      });
      return null;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      const endpoint =
        type === "image"
          ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
          : `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
      const res = await fetch(endpoint, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return (data.secure_url as string) || null;
    } catch {
      toast({
        title: "Upload error",
        description: "Cloudinary upload failed.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (postType === "story_video" && file.type !== "video/mp4") {
      toast({
        title: "Invalid format",
        description: "Story video must be .mp4",
        variant: "destructive",
      });
      return;
    }
    const url = await uploadToCloudinary(file, "video");
    if (url) {
      setVideoUrl(url);
      toast({ title: "✅ Video uploaded", description: "Cloudinary URL set." });
    }
  };

  const handleCarouselFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadToCloudinary(file, "image");
      if (url) urls.push(url);
    }
    setCarouselUrls((prev) => [...prev, ...urls]);
    toast({
      title: "✅ Images uploaded",
      description: `${urls.length} added to carousel.`,
    });
  };

  const removeCarouselImage = (idx: number) => {
    setCarouselUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!webhookUrl) {
      toast({
        title: "Missing webhook",
        description: "Set VITE_N8N_WEBHOOK_URL",
        variant: "destructive",
      });
      return;
    }
    if (!instagramBusinessId) {
      toast({
        title: "Missing Instagram Business ID",
        description: "Set VITE_INSTAGRAM_BUSINESS_ID",
        variant: "destructive",
      });
      return;
    }

    if (!canSubmit) {
      toast({
        title: "Incomplete",
        description: "Fill required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: InstagramPayload = {
        node_type: "instagram",
        node: instagramBusinessId!,
        post_type: postType,
      };

      if (
        ["image", "reel", "carousel"].includes(postType) ||
        ["story_image", "story_video"].includes(postType)
      ) {
        payload.text = caption || "";
      }

      if (postType === "image" || postType === "story_image") {
        payload.image_url = imageUrl;
      }
      if (postType === "story_video" || postType === "reel") {
        payload.video_url = videoUrl;
      }
      if (postType === "reel") {
        payload.cover_image_url = coverImageUrl || undefined;
      }
      if (postType === "carousel") {
        payload.image_urls = carouselUrls;
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to send post");
      toast({
        title: "✅ Success!",
        description: "Instagram post sent to automation!",
        className: "bg-success text-success-foreground",
      });
      // Reset minimal fields
      setCaption("");
      setImageUrl("");
      setVideoUrl("");
      setCoverImageUrl("");
      setCarouselUrls([]);
      setPostType("image");
    } catch {
      toast({
        title: "Error",
        description: "Failed to send post.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 shadow-lg border border-pink-500/30">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Instagram Post
                </h2>
                <p className="text-xs text-muted-foreground">
                  Use AI caption and image tools like LinkedIn.
                </p>
              </div>
            </div>

            {/* Post Type Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Post Type
              </Label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as IGPostType)}
                className="h-10 w-full rounded-md border bg-card border-border px-3 text-sm"
              >
                <option value="image">Image Post</option>
                <option value="story_image">Story Image</option>
                <option value="story_video">Story Video (.mp4)</option>
                <option value="reel">Reel</option>
                <option value="carousel">Carousel</option>
              </select>
            </div>

            {/* Caption (for types that need it) */}
            {(
              [
                "image",
                "reel",
                "carousel",
                "story_image",
                "story_video",
              ] as IGPostType[]
            ).includes(postType) && (
              <TextEditor
                value={caption}
                onChange={setCaption}
                platform="instagram"
              />
            )}

            {/* Image fields */}
            {(postType === "image" || postType === "story_image") && (
              <ImageSection
                imageUrl={imageUrl}
                onImageUrlChange={setImageUrl}
                caption={caption}
                onCaptionChange={setCaption}
              />
            )}

            {/* Video field */}
            {(postType === "story_video" || postType === "reel") && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Video (Public URL or Upload)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="flex-1 bg-card border-border focus:border-primary"
                  />
                  <Input
                    type="file"
                    accept={
                      postType === "story_video" ? "video/mp4" : "video/*"
                    }
                    onChange={handleVideoFile}
                  />
                </div>
              </div>
            )}

            {/* Reel cover image */}
            {postType === "reel" && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Cover Image (optional)
                </Label>
                <ImageSection
                  imageUrl={coverImageUrl}
                  onImageUrlChange={setCoverImageUrl}
                  caption={caption}
                  onCaptionChange={setCaption}
                />
              </div>
            )}

            {/* Carousel images */}
            {postType === "carousel" && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Carousel Images
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCarouselFiles}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCarouselUrls([])}
                  >
                    Clear All
                  </Button>
                </div>
                {carouselUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {carouselUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-lg overflow-hidden border border-border"
                      >
                        <img
                          src={url}
                          alt={`carousel ${idx + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => removeCarouselImage(idx)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
                className="bg-primary hover:bg-primary-hover"
              >
                {isSubmitting ? "Submitting..." : "Send to Instagram"}
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Info cards */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="p-4 text-center">
            <p className="text-sm font-medium text-foreground">AI Caption</p>
            <p className="text-xs text-muted-foreground mt-1">
              Rewrite & generate
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm font-medium text-foreground">Image Tools</p>
            <p className="text-xs text-muted-foreground mt-1">
              Search & upload
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm font-medium text-foreground">Video Upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              MP4 stories & reels
            </p>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InstagramForm;
