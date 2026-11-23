"use client";

import React, { useState } from "react";
import {
  WorkspaceFormModal,
  type WorkspaceFormValues,
} from "./workspace-form-modal";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, icon: string) => Promise<void>;
  isCreating: boolean;
}

const EMPTY: WorkspaceFormValues = { title: "", description: "", icon: "📚" };

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}: CreateWorkspaceModalProps) {
  const [values, setValues] = useState<WorkspaceFormValues>(EMPTY);

  if (!isOpen) return null;

  return (
    <WorkspaceFormModal
      heading="New notebook"
      blurb="Give it a name now. You can add sources once it's open."
      submitLabel="Create notebook"
      isSubmitting={isCreating}
      values={values}
      onChange={setValues}
      onClose={() => {
        setValues(EMPTY);
        onClose();
      }}
      onSubmit={() =>
        onSubmit(values.title.trim(), values.description.trim(), values.icon)
      }
    />
  );
}
