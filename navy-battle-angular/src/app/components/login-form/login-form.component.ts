import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rememberMe: new FormControl(false)
    });
  }

  sendForm() {
    console.log("Form Status:", this.form.status);
    console.log("Form Value:", this.form.value);

    if (this.form.valid) {
      console.log('Login Successful:', this.form.value);
      // Aquí puedes llamar a un servicio de autenticación
    } else {
      console.log('Invalid Form');
    }
  }
}
