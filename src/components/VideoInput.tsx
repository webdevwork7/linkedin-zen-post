import { motion } from "framer-motion";
import { Link, Video } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VideoInputProps {
  value: string;
  onChange: (value: string) => void;
}

const VideoInput = ({ value, onChange }: VideoInputProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-2"
    >
      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Video className="w-4 h-4" />
        Video URL (Optional)
      </Label>
      <div className="relative">
        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="pl-10 bg-card border-border focus:border-primary"
        />
      </div>
      {value && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          Video link will be included in your LinkedIn post
        </motion.p>
      )}
    </motion.div>
  );
};

export default VideoInput;
