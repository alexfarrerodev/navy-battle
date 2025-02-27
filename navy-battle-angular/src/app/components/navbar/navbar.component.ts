import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavalApiService } from '../../services/naval-api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {

  // Attributes
  isLoggedIn: boolean = false;
  username: string | null = null;

  // Constructor
  constructor(private navalApiService: NavalApiService) { }

  // METHODS

  ngOnInit() {
  
    this.checkLoginStatus();
    
    window.addEventListener('storage', () => {
      this.checkLoginStatus();
    });

  }

  /**
   * Checks if the user is logged in or not.
   */
  private checkLoginStatus() {
    const token = sessionStorage.getItem('access_token');
    this.isLoggedIn = !!token;
    if (this.isLoggedIn) {
      this.username = sessionStorage.getItem('username');
    } else {
      this.username = null;
    }
  }

  /**
   * Performs the logout action in client and in server.
   */
  logout() {

    sessionStorage.removeItem('username');
    sessionStorage.removeItem('access_token');
    
    this.isLoggedIn = false;
    this.username = null;
    
    window.dispatchEvent(new Event('storage'));

    this.navalApiService.logout().subscribe((response: any) => {
        console.log('User logged out successfully:', response);
    });

  }
}