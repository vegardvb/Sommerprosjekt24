import { bootstrapApplication } from '@angular/platform-browser';
<<<<<<< HEAD
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Set the Environmental Variable for Cesiums static file required 
// For the initialization of Cesium on the window object
(window as any).CESIUM_BASE_URL = '/assets/cesium/';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));



=======
import { Ion } from 'cesium';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

(window as Record<string, any>)['CESIUM_BASE_URL'] = '/assets/cesium/';

Ion.defaultAccessToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTM0OTJkNy0zYmQyLTRkN2EtOWQwNC00ZWM2M2VjOGIzMTgiLCJpZCI6MjIxMjM0LCJpYXQiOjE3MTg2OTQ3MDh9.4RibJA8enEzdwRYgQyuuk1lWuhYSAXjCeyze_PEpXz0';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
>>>>>>> 1522c904441b8f486fcfa9cedced5fe4012567b0
