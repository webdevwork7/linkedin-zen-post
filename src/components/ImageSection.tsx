import { useState } from "react";
import { motion } from "framer-motion";
import { Link, Search, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageSectionProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
}

const ImageSection = ({ imageUrl, onImageUrlChange }: ImageSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [directUrl, setDirectUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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

    const apiKey = localStorage.getItem("pexels_api_key") || "88Qykg1vwK4s2Q73EgXOvKaSxAH5VUHKMVGC2NBt1TXD2sJp0hnnsKia";
    
    if (!apiKey) {
      toast({
        title: "Missing API Key",
        description: "Please configure your Pexels API key in settings.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1`,
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
        onImageUrlChange(data.photos[0].src.large);
        toast({
          title: "✨ Image Found!",
          description: "Image loaded from Pexels.",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <Label className="text-sm font-semibold text-foreground">Image (Public URL Only)</Label>
      
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

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or Search Pexels</span>
        </div>
      </div>

      {/* Pexels Search */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Get Image by Prompt</Label>
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
