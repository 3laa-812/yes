"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface Log {
  id: string;
  action: string;
  details: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
    role: string;
  };
}

interface ActivityLogTableProps {
  logs: Log[];
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{log.user.name || "N/A"}</span>
                  <span className="text-xs text-muted-foreground">
                    {log.user.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    [{log.user.role}]
                  </span>
                </div>
              </TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell
                className="max-w-[300px] truncate"
                title={log.details || ""}
              >
                {log.details || "-"}
              </TableCell>
              <TableCell>
                {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
              </TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-4 text-muted-foreground"
              >
                No activity logs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
