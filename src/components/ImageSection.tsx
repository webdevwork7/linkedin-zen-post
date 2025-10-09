import { useState } from "react";
import { motion } from "framer-motion";
import {
  Link,
  Search,
  Loader2,
  X,
  UploadCloud,
  Wand2,
  Sparkles,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CharacterLengthSelector from "./CharacterLengthSelector";

interface ImageSectionProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  caption: string;
  onCaptionChange: (caption: string) => void;
}

const ImageSection = ({
  imageUrl,
  onImageUrlChange,
  caption,
  onCaptionChange,
}: ImageSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [directUrl, setDirectUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pexelsResults, setPexelsResults] = useState<
    { preview: string; full: string }[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterLength, setCharacterLength] = useState(100);
  const { toast } = useToast();

  const searchPexels = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Missing Query",
        description: "Please enter a search term.",
        variant: "destructive",
      });
      return;
    }

    const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;

    if (!apiKey) {
      toast({
        title: "Missing API Key",
        description: "Pexels API key missing in environment.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          searchQuery
        )}&per_page=4`,
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search images");
      }

      const data = await response.json();

      if (data.photos && data.photos.length > 0) {
        const results = (
          data.photos as Array<{ src: Record<string, string> }>
        ).map((p) => ({
          preview: p.src.medium || p.src.small || p.src.large,
          full: p.src.large || p.src.original || p.src.medium,
        }));
        setPexelsResults(results);
        toast({
          title: "✨ Images Found!",
          description: "Select one of the results below.",
        });
      } else {
        toast({
          title: "No Results",
          description: "No images found for your search. Try a different term.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search images. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);
    } else {
      setLocalPreview("");
    }
  };

  const uploadToCloudinary = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please choose an image to upload.",
        variant: "destructive",
      });
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
      | string
      | undefined;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
      | string
      | undefined;

    if (!cloudName || !uploadPreset) {
      toast({
        title: "Missing Cloudinary config",
        description:
          "Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      const secureUrl = data.secure_url as string | undefined;
      if (!secureUrl) throw new Error("No secure_url returned");

      onImageUrlChange(secureUrl);
      toast({
        title: "✅ Uploaded",
        description: "Image uploaded to Cloudinary.",
      });
    } catch (err) {
      toast({
        title: "Upload error",
        description: "Could not upload to Cloudinary.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <Label className="text-sm font-semibold text-foreground">
        Image (Public URL Only)
      </Label>

      {/* Direct URL Input */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Enter Image URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="pl-10 bg-card border-border focus:border-primary"
              onKeyPress={(e) => {
                if (e.key === "Enter" && directUrl.trim()) {
                  onImageUrlChange(directUrl);
                  toast({
                    title: "✅ Image URL Added",
                    description: "Image URL has been set.",
                  });
                }
              }}
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              if (directUrl.trim()) {
                onImageUrlChange(directUrl);
                toast({
                  title: "✅ Image URL Added",
                  description: "Image URL has been set.",
                });
              }
            }}
            disabled={!directUrl.trim()}
            className="bg-primary hover:bg-primary-hover"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Pexels Results Grid */}
      {pexelsResults.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Select one of the generated images
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pexelsResults.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onImageUrlChange(img.full);
                  toast({
                    title: "✅ Selected",
                    description: "Image chosen from Pexels.",
                  });
                }}
                className={`relative rounded-lg overflow-hidden border ${
                  imageUrl === img.full
                    ? "border-primary ring-2 ring-primary"
                    : "border-border"
                } focus:outline-none`}
              >
                <img
                  src={img.preview}
                  alt={`Result ${idx + 1}`}
                  className="w-full h-32 object-cover"
                />
                <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-background/80 border">
                  {imageUrl === img.full ? "Selected" : "Select"}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => setPexelsResults([])}
              className="text-xs"
            >
              Clear results
            </Button>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or Search Pexels
          </span>
        </div>
      </div>

      {/* Pexels Search */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">
          Get Image by Prompt
        </Label>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., business meeting, teamwork, success"
            className="flex-1 bg-card border-border focus:border-primary"
            onKeyPress={(e) => e.key === "Enter" && searchPexels()}
          />
          <Button
            type="button"
            onClick={searchPexels}
            disabled={isSearching}
            className="bg-primary hover:bg-primary-hover"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or Upload Local Image
          </span>
        </div>
      </div>

      {/* Local Upload */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">
          Choose image to upload
        </Label>
        <div className="flex gap-2 items-center">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={uploadToCloudinary}
            disabled={!selectedFile || isUploading}
            className="bg-primary hover:bg-primary-hover"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-2" /> Upload
              </>
            )}
          </Button>
        </div>
        {localPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-lg overflow-hidden border border-border"
          >
            <img
              src={localPreview}
              alt="Local Preview"
              className="w-full h-48 object-cover"
            />
          </motion.div>
        )}
      </div>

      {/* Image Preview */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-lg overflow-hidden border border-border"
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-64 object-cover"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => onImageUrlChange("")}
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImageSection;
