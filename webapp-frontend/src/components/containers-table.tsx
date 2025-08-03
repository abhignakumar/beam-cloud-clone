import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import type { Container } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader, OctagonX } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BACKEND_BASE_URL } from "@/lib/config";

export function ContainersTable() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stopContainerLoading, setStopContainerLoading] = useState(false);

  async function fetchData() {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/pod`, {
        withCredentials: true,
      });
      setContainers(response.data.pods);
    } catch {
      toast.error("Failed to fetch containers");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStopContainer(podName: string) {
    setStopContainerLoading(true);
    try {
      await axios.delete(`${BACKEND_BASE_URL}/pod/${podName}`, {
        withCredentials: true,
      });
      fetchData();
      toast.success("Container Stopped");
    } catch (error) {
      let msg: string | null = null;
      if (isAxiosError(error)) msg = error.response?.data.message;
      toast.error("Failed to stop the container", {
        description: msg ? msg : undefined,
      });
    } finally {
      setStopContainerLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Container ID</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {containers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5}>
              <p className="text-center text-muted-foreground py-3">
                You have not created any containers
              </p>
            </TableCell>
          </TableRow>
        ) : (
          containers.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.image}</TableCell>
              <TableCell>{c.url}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "rounded-xl px-2 py-1 text-xs font-medium",
                    c.status === "RUNNING"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {c.status}
                </span>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"destructive"}
                      size={"icon"}
                      onClick={() => handleStopContainer(c.name)}
                      disabled={c.status === "STOPPED" || stopContainerLoading}
                    >
                      <OctagonX />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop Container</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
