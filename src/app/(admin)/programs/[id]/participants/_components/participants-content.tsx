"use client";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import { type Participant } from "@/services/participants.service";
import { Plus } from "lucide-react";
import { useAddParticipant } from "../_hooks/use-add-participant";
import { ParticipantsTable } from "../_table";

interface ParticipantsContentProps {
  participants: Participant[];
  programId: string;
}

export function ParticipantsContent({
  participants,
  programId,
}: ParticipantsContentProps) {
  const { handleAddClick, handleEdit, handleDelete, deleteConfirmation } =
    useAddParticipant({ programId });

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
            <p className="text-muted-foreground">
              Total {participants?.length || 0} Participants
            </p>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4" />
            Add Participants
          </Button>
        </div>

        <Card>
            <ParticipantsTable
              data={participants || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
        </Card>
      </div>

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setOpen}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        onConfirm={deleteConfirmation.onConfirm}
        isLoading={deleteConfirmation.isDeleting}
      />
    </>
  );
}
