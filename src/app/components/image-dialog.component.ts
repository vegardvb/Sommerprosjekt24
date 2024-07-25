//image-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * Represents a dialog component for displaying an image.
 */
@Component({
  selector: 'app-image-dialog',
  template: `
    <div mat-dialog-content>
      <img [src]="data.imageUrl" alt="Image" style="width: 100%;" />
    </div>
    <div mat-dialog-actions>
      <button mat-button class="custom-button" (click)="close()">Close</button>
    </div>
  `,
  styles: [
    `
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
      }
      .custom-button {
        background-color: #ff5555;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin: 10px;
      }
      .custom-button:hover {
        background-color: #45a049;
      }
    `,
  ],
})
export class ImageDialogComponent {
  /**
   * Creates an instance of ImageDialogComponent.
   * @param dialogRef - The reference to the dialog.
   * @param data - The data object containing the image URL.
   */
  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }
  ) {}

  /**
   * Closes the dialog.
   */
  close(): void {
    this.dialogRef.close();
  }
}
