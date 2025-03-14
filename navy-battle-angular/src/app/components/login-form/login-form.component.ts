import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavalApiService } from '../../services/naval-api.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {

  // Attributes
  form: FormGroup;
  isLoggedIn: boolean = false;
  username: string | null = null;
  
  // Constructor
  constructor(private navalApiService: NavalApiService, private router: Router) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rememberMe: new FormControl(false)
    });
  }

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
   * Performs the login of the user. (or tries it)
   */
  sendForm() {

    // console.log("Form Status:", this.form.status);
    // console.log("Form Value:", this.form.value);

    if (this.form.valid) {
      this.navalApiService.login(this.form.value.email, this.form.value.password).subscribe(
        (response: any) => {
          console.log('User logged in successfully:', response);
          sessionStorage.setItem("userId", response.user.user_id);
          sessionStorage.setItem('username', response.user.username);
          sessionStorage.setItem('access_token', response.access_token);
          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });
        },
        (error: any) => {
          console.error('Error logging user:', error);
        }
      );
    } else {
      console.log('Invalid Form!');
      this.form.markAllAsTouched();
    }
  }

}
