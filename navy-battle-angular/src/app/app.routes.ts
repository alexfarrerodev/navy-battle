import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { Nf404Component } from './components/nf404/nf404.component';
import { AboutComponent } from './components/about/about.component';
import { GamesComponent } from './components/games/games.component';

export const routes: Routes = [
    {path: "", redirectTo: "home", pathMatch: "full"},
    {path: "home", component: HomeComponent},
    {path: "about", component: AboutComponent},
    {path: "games", component: GamesComponent},
    {path: "**", component: Nf404Component}
];
