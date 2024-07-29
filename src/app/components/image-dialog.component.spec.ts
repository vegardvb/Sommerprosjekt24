import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageDialogComponent } from './image-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ImageDialogComponent', () => {
  let component: ImageDialogComponent;
  let fixture: ComponentFixture<ImageDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ImageDialogComponent>>;

  beforeEach(async () => {
    const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [MatDialogModule, BrowserAnimationsModule],
      declarations: [ImageDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { imageUrl: 'test-image.jpg' } },
        { provide: MatDialogRef, useValue: dialogRefSpyObj },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageDialogComponent);
    component = fixture.componentInstance;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<ImageDialogComponent>
    >;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct image', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.src).toContain('test-image.jpg');
  });

  it('should close the dialog when close method is called', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should have correct button text', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.textContent).toBe('Close');
  });

  it('should apply correct styles to the button', () => {
    const button: HTMLElement =
      fixture.nativeElement.querySelector('.custom-button');
    const styles = window.getComputedStyle(button);
    expect(styles.backgroundColor).toBe('rgb(255, 85, 85)'); // Hex #ff5555 in RGB
    expect(styles.color).toBe('rgb(255, 255, 255)'); // White color
  });
});
