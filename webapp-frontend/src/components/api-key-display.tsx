import { useState } from "react";
import { Eye, EyeOff, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ApiKeyDisplayProps = {
  apiKey: string;
};

export function ApiKeyDisplay({ apiKey }: ApiKeyDisplayProps) {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible((prev) => !prev);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success("Copied to Clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex items-center gap-2 border px-5 py-1 rounded-md bg-muted">
      <input
        type={visible ? "text" : "password"}
        readOnly
        value={apiKey}
        className="bg-transparent text-sm w-full border-none outline-none text-muted-foreground"
      />
      <Button variant="outline" size="icon" onClick={toggleVisibility}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </Button>
      <Button variant="outline" size="icon" onClick={handleCopy}>
        <Copy size={18} />
      </Button>
    </div>
  );
}
