import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Ion } from 'cesium';

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

// Set the Environmental Variable for Cesiums static file required
// For the initialization of Cesium on the window object
window.CESIUM_BASE_URL = '/assets/cesium/';

Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNTVhYWQxYS0zOWUzLTQ4MGItOGRlZS1kMzliOTNmZDU4MTEiLCJpZCI6MjIxMjM0LCJpYXQiOjE3MjExMzE0MDR9.mFishTdqoqIFrYoQIjrVYOwF8psVeWugD3Q-0lgBz3o';
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTM0OTJkNy0zYmQyLTRkN2EtOWQwNC00ZWM2M2VjOGIzMTgiLCJpZCI6MjIxMjM0LCJpYXQiOjE3MTg2OTQ3MDh9.4RibJA8enEzdwRYgQyuuk1lWuhYSAXjCeyze_PEpXz0';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));

// Ion.defaultAccessToken =
//   '  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1OTRiN2RiMi0zNGI5LTRlNWUtOWJhNS0wMWIxOTg4ZDQxOGMiLCJpZCI6MjIyODY2LCJpYXQiOjE3MTk4MTgxNDd9.MU1ofirg2vr2u_jANKV4JtzAy7Ahb7oukX2rb3VJWj0';
// bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
