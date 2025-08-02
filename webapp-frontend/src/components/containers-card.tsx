import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContainersTable } from "@/components/containers-table";

export function ContainersCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Containers</CardTitle>
        <CardDescription>
          All the containers which you have created using{" "}
          <span className="bg-muted px-1 border font-medium rounded-sm">
            Pod
          </span>{" "}
          are listed below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContainersTable />
      </CardContent>
    </Card>
  );
}
