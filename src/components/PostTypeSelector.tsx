import { motion } from "framer-motion";
import { FileText, Image, Video, Newspaper } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PostType } from "@/pages/Index";

interface PostTypeSelectorProps {
  value: PostType;
  onChange: (value: PostType) => void;
}

const PostTypeSelector = ({ value, onChange }: PostTypeSelectorProps) => {
  const postTypes = [
    { value: "text", label: "Text", icon: FileText },
    { value: "article", label: "Article", icon: Newspaper },
    { value: "article-image", label: "Article + Image", icon: Newspaper },
    { value: "image", label: "Image", icon: Image },
    { value: "video", label: "Video", icon: Video },
  ];

  const currentType = postTypes.find((type) => type.value === value);
  const Icon = currentType?.icon || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <Label className="text-sm font-semibold text-foreground">Post Type</Label>
      <Select value={value} onValueChange={(val) => onChange(val as PostType)}>
        <SelectTrigger className="h-12 bg-card border-border hover:border-primary transition-colors">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {postTypes.map((type) => {
            const TypeIcon = type.icon;
            return (
              <SelectItem
                key={type.value}
                value={type.value}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-primary" />
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default PostTypeSelector;
