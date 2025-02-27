import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  username: string | null = null;

  ngOnInit() {
    // Comprobar si el usuario está loggeado verificando el token en sessionStorage
    this.checkLoginStatus();
    
    // Escuchar cambios en el sessionStorage para actualizar el estado de login
    window.addEventListener('storage', () => {
      this.checkLoginStatus();
    });
  }

  private checkLoginStatus() {
    const token = sessionStorage.getItem('access_token');
    this.isLoggedIn = !!token;
    
    if (this.isLoggedIn) {
      this.username = sessionStorage.getItem('username');
    } else {
      this.username = null;
    }
  }

  logout() {
    // Eliminar datos de sesión
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('token_type');
    
    // Actualizar estado
    this.isLoggedIn = false;
    this.username = null;
    
    // Disparar evento de storage para que otros componentes se actualicen
    window.dispatchEvent(new Event('storage'));
  }
}