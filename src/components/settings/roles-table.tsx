/**
 * @file This component defines the data table for displaying user roles and their permissions.
 * It uses the TanStack Table library to provide sorting functionality.
 */
"use client";

import * as React from "react";
import {
  CaretSortIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Role } from "@/lib/roles-data";

/**
 * Defines the columns for the roles table.
 * Each object in the array corresponds to a column in the table.
 */
export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Role <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium text-primary">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "coreResponsibilities",
    header: "Core Responsibilities",
    cell: ({ row }) => <div className="w-96 text-sm">{row.getValue("coreResponsibilities")}</div>,
  },
  {
    accessorKey: "accessScope",
    header: "Access Scope",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("accessScope")}</Badge>,
  },
  {
    accessorKey: "keyPrivileges",
    header: "Key Privileges",
    cell: ({ row }) => <div className="w-96 text-sm">{row.getValue("keyPrivileges")}</div>,
  },
  {
    accessorKey: "limitations",
    header: "Limitations",
    cell: ({ row }) => <div className="w-96 text-sm">{row.getValue("limitations")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const role = row.original;
      // Super admin role cannot be edited or deleted.
      if (role.id === "super-admin") return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit role</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete role</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

/**
 * The RolesTable component.
 * @param {object} props - The component props.
 * @param {Role[]} props.data - The array of role data to display.
 * @returns A JSX element rendering the roles table.
 */
export function RolesTable({ data }: { data: Role[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <div className="w-full">
      <div className="">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
