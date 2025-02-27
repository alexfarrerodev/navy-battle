import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { RouterLink } from '@angular/router';
import { NavalApiService } from '../../services/naval-api.service';
@Component({
  selector: 'app-register-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-form.component.html',
  styles: ``
})
export class RegisterFormComponent {

  form: FormGroup;
  passwordConfirmed : boolean = false;
  StrongPasswordRegx: RegExp = /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;
  age!: number;
  aceptTerms : boolean = false;
  
  constructor(private navalApiService: NavalApiService) {
    this.form = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password1: new FormControl('', [Validators.required, Validators.pattern(this.StrongPasswordRegx)]),
      password2: new FormControl('', [Validators.required]),
      acceptTerms: new FormControl(false, Validators.requiredTrue)
    }, { validators: this.passwordsMatchValidator }); 
  }
  

  // METHODS
  sendForm() {

    console.log("Form Status:", this.form.status);
    console.log("Form Value:", this.form.value);
    console.log("Form Valid?", this.form.valid);
    
    if (this.form.valid) {
      this.navalApiService.register(this.form.value.username, this.form.value.email, this.form.value.password1).subscribe(
        (response: any) => {
          console.log('User registered successfully:', response);
        },
        (error: any) => {
          console.error('Error registering user:', error);
        }
      );
    } else {
      console.log('Invalid Form');
    }

  }

  passwordsMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
    const password1 = form.get('password1')?.value;
    const password2 = form.get('password2')?.value;
    return password1 === password2 ? null : { passwordsMismatch: true };
  };
  
}