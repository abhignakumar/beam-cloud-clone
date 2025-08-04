import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { BACKEND_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function SDKCard() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownloadSDK() {
    setIsLoading(true);
    try {
      window.location.href = `${BACKEND_BASE_URL}/sdk/python`;
      toast.success("Download started");
    } catch {
      toast.error("Failed to download the SDK");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Download Python SDK</CardTitle>
        <CardDescription>
          You can download or copy and paste the 3 files in sdk folder, which is
          present in the GitHub repo of this project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-x-4 items-center">
          <Button onClick={handleDownloadSDK} disabled={isLoading}>
            <Download />
            Python SDK
          </Button>
          <div className="text-sm bg-muted rounded-md p-2 border text-muted-foreground hover:text-foreground transition-colors">
            After extracting the zip file, place the sdk folder in the same
            folder where your python files are present.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
