import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Set the Environmental Variable for Cesiums static file required 
// For the initialization of Cesium on the window object
(window as any).CESIUM_BASE_URL = '/assets/cesium/';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));



