import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import type { FunctionCall } from "@/lib/types";
import { Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BACKEND_BASE_URL } from "@/lib/config";

export function FunctionsTable() {
  const [functionCalls, setFunctionCalls] = useState<FunctionCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BACKEND_BASE_URL}/function`, {
          withCredentials: true,
        });
        setFunctionCalls(response.data.functionCalls);
      } catch {
        toast.error("Failed to fetch function calls");
      } finally {
        setIsLoading(false);
      }
    }

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
          <TableHead>Function Name</TableHead>
          <TableHead>Logs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {functionCalls.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3}>
              <p className="text-center text-muted-foreground py-3">
                You have not executed any function calls
              </p>
            </TableCell>
          </TableRow>
        ) : (
          functionCalls.map((f) => (
            <TableRow key={f.id}>
              <TableCell>{new Date(f.createdAt).toLocaleString()}</TableCell>
              <TableCell>{f.name}</TableCell>
              {/* <TableCell>{f.logs}</TableCell> */}
              <TableCell>
                <div className="flex items-center">
                  <div className="bg-muted rounded p-2 max-h-10 overflow-auto font-mono text-sm whitespace-pre-wrap border w-full">
                    {f.logs}
                  </div>
                  {/* <div className="text-sm whitespace-pre-wrap max-w-xs truncate bg-muted p-1 rounded">
                  {f.logs?.split("\n").slice(0, 2).join("\n")}
                  {f.logs?.split("\n").length > 2 ? "..." : ""}
                </div> */}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="text-xs" variant={"link"} size={"sm"}>
                        View Full Log
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="min-w-[800px] max-w-[800px] max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="text-lg">
                          Logs: {f.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="bg-muted rounded p-4 overflow-auto font-mono text-sm whitespace-pre-wrap border max-h-[65vh]">
                        {f.logs || "No logs available."}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
