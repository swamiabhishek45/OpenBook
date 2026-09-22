import type { MouseEvent } from "react";

/** Close when the user clicks the overlay, not the modal panel. */
export function dismissOnBackdropClick(
  event: MouseEvent<HTMLElement>,
  onDismiss: () => void
) {
  if (event.target === event.currentTarget) {
    onDismiss();
  }
}
