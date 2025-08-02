import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FunctionsTable } from "@/components/functions-table";

export function FunctionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Function Calls</CardTitle>
        <CardDescription>
          All the function calls which you have called using{" "}
          <span className="bg-muted px-1 border font-medium rounded-sm">
            @function
          </span>{" "}
          are listed below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FunctionsTable />
      </CardContent>
    </Card>
  );
}
