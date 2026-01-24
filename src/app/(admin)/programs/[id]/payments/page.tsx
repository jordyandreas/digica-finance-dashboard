"use client";

import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { usePayments, usePaymentsSummary } from "./_hooks/use-payments";
import { useAddPayment } from "./_hooks/use-add-payment";
import { useParticipants } from "../participants/_hooks/use-participants";
import { PaymentsTable } from "./_table";

export default function PaymentsPage() {
  const { id } = useParams<{ id?: string }>();
  const programId = Array.isArray(id) ? id[0] : id ?? "";
  const { data: payments } = usePayments(programId);
  const { data: summary } = usePaymentsSummary(programId);
  const { data: participants } = useParticipants(programId);

  const { handleAddClick, handleEdit, handleDelete } =
    useAddPayment({ programId });

  const totalAmount = summary?.total || 0;
  const participantNamesById = Object.fromEntries(
    (participants ?? []).map((participant) => [
      participant.id,
      participant.name || "Unnamed participant",
    ]),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track all incoming payments</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4" />
          Add Payment
        </Button>
      </div>

      {/* {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Loading payments...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fetching payments from Supabase.
            </p>
          </CardContent>
        </Card>
      )} */}

      {/* {combinedError && !isLoading && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Error loading payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {combinedError instanceof Error
                ? combinedError.message
                : "Unknown error"}
            </p>
            <p className="mt-2 text-xs">
              Please ensure your Supabase payments table exists and has the
              correct schema.
            </p>
          </CardContent>
        </Card>
      )} */}

      {/* {!combinedError && !isLoading && ( */}
        <>
          <Card>
            <CardHeader>
              <CardTitle>Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-sm text-muted-foreground">
                {summary?.count || 0} payment
                {summary?.count !== 1 ? "s" : ""} recorded
              </p>
            </CardContent>
          </Card>

          <Card>
              <PaymentsTable
                data={payments || []}
                participantNamesById={participantNamesById}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
          </Card>
        </>
      {/* )} */}

    </div>
  );
}