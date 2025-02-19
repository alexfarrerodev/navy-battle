import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { Nf404Component } from './components/nf404/nf404.component';

export const routes: Routes = [
    {path: "", redirectTo: "home", pathMatch: "full"},
    {path: "home", component: HomeComponent},
    {path: "**", component: Nf404Component}
];
