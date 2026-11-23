"use client";

import React, { useState } from "react";
import { Workspace } from "@/hooks/use-workspaces";
import {
  WorkspaceFormModal,
  type WorkspaceFormValues,
} from "./workspace-form-modal";

interface EditWorkspaceModalProps {
  workspace: Workspace | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    title: string,
    description: string,
    icon: string,
  ) => Promise<void>;
  isUpdating: boolean;
}

export function EditWorkspaceModal({
  workspace,
  onClose,
  onSubmit,
  isUpdating,
}: EditWorkspaceModalProps) {
  if (!workspace) return null;

  // Keyed on the notebook id so the form seeds itself on mount instead of
  // syncing props into state from an effect.
  return (
    <EditWorkspaceForm
      key={workspace.id}
      workspace={workspace}
      onClose={onClose}
      onSubmit={onSubmit}
      isUpdating={isUpdating}
    />
  );
}

function EditWorkspaceForm({
  workspace,
  onClose,
  onSubmit,
  isUpdating,
}: Omit<EditWorkspaceModalProps, "workspace"> & { workspace: Workspace }) {
  const [values, setValues] = useState<WorkspaceFormValues>({
    title: workspace.title,
    description: workspace.description || "",
    icon: workspace.icon || "📚",
  });

  return (
    <WorkspaceFormModal
      heading="Edit notebook"
      blurb="Rename it, swap the icon, or update what it's for."
      submitLabel="Save changes"
      isSubmitting={isUpdating}
      values={values}
      onChange={setValues}
      onClose={onClose}
      onSubmit={() =>
        onSubmit(
          workspace.id,
          values.title.trim(),
          values.description.trim(),
          values.icon,
        )
      }
      titlePlaceholder="Notebook title"
    />
  );
}
