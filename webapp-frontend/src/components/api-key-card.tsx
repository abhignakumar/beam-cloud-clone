import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiKeyDisplay } from "@/components/api-key-display";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { BACKEND_BASE_URL } from "@/lib/config";

export function ApiKeyCard() {
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BACKEND_BASE_URL}/apikey`, {
          withCredentials: true,
        });
        console.log(response.data);

        setApiKeys(response.data.apikeys);
      } catch {
        toast.error("Failed to fetch API Keys");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          API keys grant access to actions in your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader className="animate-spin" />
          </div>
        ) : (
          apiKeys.map((apikey) => (
            <ApiKeyDisplay key={apikey} apiKey={apikey} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
