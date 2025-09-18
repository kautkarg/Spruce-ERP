/**
 * @file This component implements a fully featured data table for displaying contacts (leads).
 * It includes functionality for sorting, filtering, pagination, bulk selection,
 * and bulk actions (changing stage, deleting).
 */

"use client";

import * as React from "react";
import { useActionState, useState, useTransition } from "react";
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { KANBAN_STAGES, Lead, KanbanStage } from "@/lib/types";
import { StageBadge } from "../leads/stage-badge";
import { StageChangeDialog } from "./stage-change-dialog";
import { useToast } from "@/hooks/use-toast";
import { bulkDeleteLeadsAction, bulkUpdateLeadsAction, BulkUpdateState } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Loader2, Trash, Calendar as CalendarIcon, User } from "lucide-react";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { users } from "@/lib/users-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AssignCounselorDialog } from "./assign-counselor-dialog";

// Helper to get placeholder image.
const getImage = (id: string) =>
  PlaceHolderImages.find((img) => img.id === id)?.imageUrl || "";

/**
 * Defines the columns for the contacts data table.
 * @param {object} props - The component props.
 * @param {(lead: Lead) => void} props.onViewProfile - Callback to handle viewing a lead's profile.
 * @param {(lead: Lead) => void} props.onDelete - Callback to trigger the deletion of a single lead.
 * @returns {ColumnDef<Lead>[]} An array of column definitions for the TanStack Table.
 */
export const columns = (
  onViewProfile: (lead: Lead) => void,
  onDelete: (lead: Lead) => void
): ColumnDef<Lead>[] => [
  // Checkbox column for row selection.
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // Name and Phone column.
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lead = row.original;
      return (
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={getImage(lead.avatarUrl)} alt={lead.name} />
            <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>

          </Avatar>
          <div className="grid gap-1">
            <button onClick={() => onViewProfile(lead)} className="font-medium text-left hover:underline">
                {lead.name}
            </button>
            <div className="text-sm text-muted-foreground">{lead.phoneNumbers?.[0]?.number || "No phone"}</div>
          </div>
        </div>
      );
    },
  },
  // Lead ID column.
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
  },
  // Stage column.
  {
    accessorKey: "stage",
     header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stage
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="pl-4"><StageBadge stage={row.getValue("stage")} /></div>;
    },
  },
  // Assigned Counselor column.
  {
    accessorKey: "assignedUserId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Counselor
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const userId = row.getValue("assignedUserId") as string;
        const user = users.find(u => u.id === userId);
        return <div>{user?.name || "Unassigned"}</div>
    }
  },
  // Source column.
  {
    accessorKey: "source",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Source
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="">{row.getValue("source")}</div>,
  },
  // Entry Date column.
   {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Entry Date
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const [formattedDate, setFormattedDate] = React.useState('');
        React.useEffect(() => {
          const entryDate = new Date(row.original.createdAt);
          setFormattedDate(format(entryDate, "MMM dd, yyyy"));
        }, [row.original.createdAt]);
        return <div>{formattedDate}</div>
    },
    // Custom sorting function for dates.
    sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.createdAt);
        const dateB = new Date(rowB.original.createdAt);
        return dateA.getTime() - dateB.getTime();
    }
  },
  // Actions column (e.g., Edit, Delete).
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const lead = row.original;

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
            <DropdownMenuItem onClick={() => onViewProfile(lead)}>
                View & Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(lead.id)}
            >
              Copy Lead ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(lead)}>
              Delete lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

/**
 * A toolbar that appears when one or more rows are selected in the table.
 * It provides bulk actions like "Change Stage" and "Delete".
 */
function BulkActionsToolbar({ selectedLeads, onClearSelection }: { selectedLeads: Lead[], onClearSelection: () => void }) {
    const { toast } = useToast();
    const [isStageDialogOpen, setStageDialogOpen] = useState(false);
    const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isPending, startTransition] = useTransition();

    // Hooks to handle server action states for bulk updates and deletes.
    const [updateState, updateAction] = useActionState(bulkUpdateLeadsAction, { message: undefined, error: undefined });
    const [deleteState, deleteAction] = useActionState(bulkDeleteLeadsAction, { message: undefined, error: undefined });
    
    // Shows toast notifications based on server action results.
    React.useEffect(() => {
        const state = updateState.message ? updateState : deleteState;
        if(state.message) {
            toast({ title: "Success", description: state.message });
            onClearSelection();
            setStageDialogOpen(false);
            setAssignDialogOpen(false);
            setDeleteDialogOpen(false);
        } else if (state.error) {
            toast({ variant: "destructive", title: "Error", description: state.error });
        }
    }, [updateState, deleteState, toast, onClearSelection]);

    // Resets delete confirmation text when the dialog is closed.
    React.useEffect(() => {
        if (!isDeleteDialogOpen) {
            setDeleteConfirmation("");
        }
    }, [isDeleteDialogOpen]);

    const handleStageChange = (stage: KanbanStage) => {
        const formData = new FormData();
        selectedLeads.forEach(lead => formData.append('leadIds', lead.id));
        formData.append('stage', stage);
        startTransition(() => updateAction(formData));
    }

    const handleAssignCounselor = (counselorId: string) => {
        const formData = new FormData();
        selectedLeads.forEach(lead => formData.append('leadIds', lead.id));
        formData.append('assignedUserId', counselorId);
        startTransition(() => updateAction(formData));
    };
    
    const handleDelete = () => {
        const formData = new FormData();
        selectedLeads.forEach(lead => formData.append('leadIds', lead.id));
        startTransition(() => deleteAction(formData));
    }

    return (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background p-2 rounded-lg border shadow-lg z-10">
        <p className="text-sm font-medium">{selectedLeads.length} selected</p>
        <StageChangeDialog 
            open={isStageDialogOpen}
            onOpenChange={setStageDialogOpen}
            onStageSelect={handleStageChange}
            isPending={isPending}
        >
            <Button variant="outline" size="sm">Change Stage</Button>
        </StageChangeDialog>
         <AssignCounselorDialog
            open={isAssignDialogOpen}
            onOpenChange={setAssignDialogOpen}
            onAssign={handleAssignCounselor}
            isPending={isPending}
        >
            <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2"/>
                Assign
            </Button>
        </AssignCounselorDialog>
        <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash className="w-4 h-4 mr-2" />
            Delete
        </Button>
        {/* Confirmation dialog for bulk delete */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete {selectedLeads.length} lead(s).
                        To confirm, please type <strong>DELETE</strong> in the box below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-2">
                    <Label htmlFor="delete-confirm" className="sr-only">Confirm Deletion</Label>
                    <Input
                        id="delete-confirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        autoComplete="off"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDelete} 
                        disabled={isPending || deleteConfirmation !== "DELETE"}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Permanently
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    );
}

interface ContactsTableProps {
    data: Lead[];
    onViewProfile: (lead: Lead) => void;
}

/**
 * The main component that brings together the table, filtering, pagination, and bulk actions.
 */
export function ContactsTable({ data, onViewProfile }: ContactsTableProps) {
  const isMobile = useIsMobile();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [date, setDate] = React.useState<Date>();

  const [leadToDelete, setLeadToDelete] = React.useState<Lead | null>(null);
  const [isDeleteSingleDialogOpen, setDeleteSingleDialogOpen] = React.useState(false);
  const [deleteSingleConfirmation, setDeleteSingleConfirmation] = React.useState("");

  const [isPending, startTransition] = useTransition();
  const [deleteState, deleteAction] = useActionState(bulkDeleteLeadsAction, { message: undefined, error: undefined });
  const { toast } = useToast();

  const handleDeleteRequest = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteSingleDialogOpen(true);
  };
  
  React.useEffect(() => {
    if (deleteState.message) {
      toast({ title: "Success", description: deleteState.message });
      setDeleteSingleDialogOpen(false);
      setLeadToDelete(null);
    } else if (deleteState.error) {
      toast({ variant: "destructive", title: "Error", description: deleteState.error });
    }
  }, [deleteState, toast]);

  React.useEffect(() => {
    if (!isDeleteSingleDialogOpen) {
      setDeleteSingleConfirmation("");
    }
  }, [isDeleteSingleDialogOpen]);

  const handleDeleteSingle = () => {
    if (!leadToDelete) return;
    const formData = new FormData();
    formData.append('leadIds', leadToDelete.id);
    startTransition(() => deleteAction(formData));
  };


  const tableColumns = React.useMemo(() => columns(onViewProfile, handleDeleteRequest), [onViewProfile]);

  // Filters the data based on the selected date.
  const filteredData = React.useMemo(() => {
    if (!date) return data;
    return data.filter(lead => 
      lead.activities.some(activity => 
        isSameDay(new Date(activity.timestamp), date)
      )
    );
  }, [data, date]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    table.getColumn('source')?.toggleVisibility(!isMobile);
    table.getColumn('createdAt')?.toggleVisibility(!isMobile);
    table.getColumn('assignedUserId')?.toggleVisibility(!isMobile);
    table.getColumn('id')?.toggleVisibility(!isMobile);
  }, [isMobile, table]);
  
  const selectedLeads = table.getFilteredSelectedRowModel().rows.map(row => row.original);

  return (
    <div className="w-full relative">
       {/* Show the bulk actions toolbar only when rows are selected. */}
       {selectedLeads.length > 0 && (
            <BulkActionsToolbar selectedLeads={selectedLeads} onClearSelection={() => table.resetRowSelection()} />
        )}
      <div className="flex flex-wrap items-center py-4 px-4 gap-4">
        {/* Name filter */}
        <Input
          placeholder="Filter contacts..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {/* Date filter */}
        <Popover>
            <PopoverTrigger asChild>
            <Button
                variant={"outline"}
                className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Filter by activity date...</span>}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
        {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Clear</Button>}

        <div className="ml-auto flex items-center gap-2">
            {/* Column visibility dropdown */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                    return (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                        }
                    >
                        {column.id === 'assignedUserId' ? 'Counselor' : column.id === 'createdAt' ? 'Entry Date' : column.id}
                    </DropdownMenuCheckboxItem>
                    );
                })}
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <div className="">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination controls */}
      <div className="flex items-center justify-end space-x-2 py-4 px-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                table.setPageSize(Number(value));
                }}
            >
                <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
       {/* Confirmation dialog for single lead delete */}
        <AlertDialog open={isDeleteSingleDialogOpen} onOpenChange={setDeleteSingleDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the lead for <strong>{leadToDelete?.name}</strong>.
                        To confirm, please type <strong>DELETE</strong> in the box below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-2">
                    <Label htmlFor="delete-single-confirm" className="sr-only">Confirm Deletion</Label>
                    <Input
                        id="delete-single-confirm"
                        value={deleteSingleConfirmation}
                        onChange={(e) => setDeleteSingleConfirmation(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        autoComplete="off"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDeleteSingle} 
                        disabled={isPending || deleteSingleConfirmation !== "DELETE"}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Permanently
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

    