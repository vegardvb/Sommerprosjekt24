import { Routes } from '@angular/router';
import { FirstComponent } from './first/first.component';
import { CesiumWindowComponent } from './cesium-window/cesium-window.component';

export const routes: Routes = [
    {path: 'fungerer', component: FirstComponent},
    {path: 'cesium', component: CesiumWindowComponent},
];
