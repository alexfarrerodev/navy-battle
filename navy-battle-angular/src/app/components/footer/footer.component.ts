import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styles: ``
})
export class FooterComponent {

  // Attributes
  isLoggedIn: boolean = false;
  username: string | null = null;

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

}
