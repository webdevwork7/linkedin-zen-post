import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CharacterLengthSelectorProps {
  value: number;
  onChange: (length: number) => void;
  className?: string;
}

const CharacterLengthSelector = ({
  value,
  onChange,
  className,
}: CharacterLengthSelectorProps) => {
  const lengthOptions = [50, 100, 150, 200, 300, 500];

  return (
    <Select
      value={value.toString()}
      onValueChange={(val) => onChange(parseInt(val))}
    >
      <SelectTrigger className={`w-24 ${className}`}>
        <SelectValue placeholder="100" />
      </SelectTrigger>
      <SelectContent>
        {lengthOptions.map((length) => (
          <SelectItem key={length} value={length.toString()}>
            {length}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CharacterLengthSelector;
