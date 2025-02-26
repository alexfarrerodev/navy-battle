import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { Nf404Component } from './components/nf404/nf404.component';
import { AboutComponent } from './components/about/about.component';
import { GamesComponent } from './components/games/games.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { GameBoardComponent } from './components/game-board/game-board.component';

export const routes: Routes = [
    {path: "", redirectTo: "home", pathMatch: "full"},
    {path: "home", component: HomeComponent},
    {path: "about", component: AboutComponent},
    {path: "games", component: GamesComponent},
    {path: "register", component: RegisterFormComponent},
    {path: "login", component: LoginFormComponent},
    {path: "game-board", component: GameBoardComponent},
    {path: "**", component: Nf404Component}
];
