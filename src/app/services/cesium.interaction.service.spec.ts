import { TestBed } from '@angular/core/testing';
import { CesiumInteractionService } from './cesium.interaction.service';
import { MatDialog } from '@angular/material/dialog';
import { Viewer } from 'cesium';
import { ImageService } from './image/image.service';

describe('CesiumInteractionService', () => {
  let service: CesiumInteractionService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let imageServiceSpy: jasmine.SpyObj<ImageService>;
  let viewer: Viewer;

  beforeEach(() => {
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const imageServiceSpyObj = jasmine.createSpyObj('ImageService', [
      'getImageUrl',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CesiumInteractionService,
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: ImageService, useValue: imageServiceSpyObj },
      ],
    });
    service = TestBed.inject(CesiumInteractionService);
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    imageServiceSpy = TestBed.inject(
      ImageService
    ) as jasmine.SpyObj<ImageService>;

    // Setup a dummy Cesium Viewer
    viewer = new Viewer(document.createElement('div'));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should setup click handler', () => {
    service.setupClickHandler(viewer);
    expect(service['handler']).toBeDefined();
  });

  it('should show image on showImage call', async () => {
    const braArkivId = '613a1528297e0ffcf6d9fa60';
    const expectedUrl = `http://10.254.12.157/braarkivfsapi/files/geomelding_demo/${braArkivId}`;

    imageServiceSpy.getImageUrl.and.returnValue(
      await Promise.resolve(expectedUrl)
    );

    await service.showImage(braArkivId);
    expect(imageServiceSpy.getImageUrl).toHaveBeenCalledWith(braArkivId);
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should dispose of the handler', () => {
    service.setupClickHandler(viewer);
    expect(service['handler']).toBeDefined();

    service.dispose();
    expect(service['handler'].isDestroyed()).toBeTrue();
  });
});
