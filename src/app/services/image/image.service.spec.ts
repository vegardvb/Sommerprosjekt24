import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DetectionImage } from '../../../models/detection_models';

describe('ImageService', () => {
  let service: ImageService;
  let httpMock: HttpTestingController;

  const mockImages: DetectionImage[] = [
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
    TestBed.configureTestingModule({
      providers: [
        ImageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ImageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch images by inquiry ID', () => {
    service.getImagesByInquiry(5007581).subscribe(images => {
      expect(images).toEqual(mockImages);
    });

    const req = httpMock.expectOne(
      'http://localhost:8000/images/inquiry/5007581'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockImages);
  });

  it('should generate image URL based on braArkivId', () => {
    const braArkivId = '613a1528297e0ffcf6d9fa60';
    const expectedUrl =
      'http://10.254.12.157/braarkivfsapi/files/geomelding_demo/613a1528297e0ffcf6d9fa60';
    const url = service.getImageUrl(braArkivId);
    expect(url).toBe(expectedUrl);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
