import { TestBed } from '@angular/core/testing';
import { CesiumImageService } from './cesium-image.service';
import { ImageService } from './image.service';
import { Viewer } from 'cesium';
import { of } from 'rxjs';

describe('CesiumImageService', () => {
  let service: CesiumImageService;
  let imageServiceSpy: jasmine.SpyObj<ImageService>;
  let viewer: Viewer;

  const mockImages = [
    {
      id: 157,
      geom: '{"type":"Point","coordinates":[10.671561622,63.281957838]}',
      tidspunkt: '2021-09-09 14:08:42.203',
      bra_arkiv_id: '613a1528297e0ffcf6d9fa60',
      beskrivelse: null,
      bearing: 189.67124732623392,
      filnavn: '2021-09-09_160841_DTjNbwZ.jpg',
    },
    {
      id: 158,
      geom: '{"type":"Point","coordinates":[10.671558645,63.28195712]}',
      tidspunkt: '2021-09-09 14:08:49.235',
      bra_arkiv_id: '613a152f297e0ffcf6d9fa67',
      beskrivelse: null,
      bearing: 103.63389206837252,
      filnavn: '2021-09-09_160848_DTjNbwZ.jpg',
    },
  ];

  beforeEach(() => {
    const imageServiceSpyObj = jasmine.createSpyObj('ImageService', [
      'getImagesByInquiry',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CesiumImageService,
        { provide: ImageService, useValue: imageServiceSpyObj },
      ],
    });
    service = TestBed.inject(CesiumImageService);
    imageServiceSpy = TestBed.inject(
      ImageService
    ) as jasmine.SpyObj<ImageService>;

    viewer = new Viewer(document.createElement('div'));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load images into the Cesium viewer', async () => {
    imageServiceSpy.getImagesByInquiry.and.returnValue(of(mockImages));

    await service.loadImages(viewer, 5007581);

    expect(imageServiceSpy.getImagesByInquiry).toHaveBeenCalledWith(5007581);
    expect(viewer.entities.values.length).toBe(mockImages.length);
  });

  it('should set billboards visibility', () => {
    // Assuming the billboards are added to viewer.entities somewhere in the code
    const entity1 = viewer.entities.add({ show: true });
    const entity2 = viewer.entities.add({ show: true });

    service['billboards'] = [entity1, entity2];

    service.setBillboardsVisibility(viewer, false);
    service['billboards'].forEach(billboard => {
      expect(billboard.show).toBeFalse();
    });

    service.setBillboardsVisibility(viewer, true);
    service['billboards'].forEach(billboard => {
      expect(billboard.show).toBeTrue();
    });
  });
});
