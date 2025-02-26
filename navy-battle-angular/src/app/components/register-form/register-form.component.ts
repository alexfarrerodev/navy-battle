import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from '@angular/forms'
@Component({
  selector: 'app-register-form',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './register-form.component.html',
  styles: ``
})
export class RegisterFormComponent {
  form: FormGroup;
  passwordConfirmed : boolean = false;
  StrongPasswordRegx: RegExp = /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;
  age!: number;
  aceptTerms : boolean = false;
  
  constructor(){
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password1: new FormControl('', [Validators.required, Validators.pattern(this.StrongPasswordRegx)]),
      password2: new FormControl('', [Validators.required]),
      age: new FormControl(null, [Validators.required, Validators.min(18)]),
      aceptTerms: new FormControl(false, Validators.requiredTrue),
      gender: new FormControl('', Validators.required)
    }, { validators: this.passwordsMatchValidator }); // 👈 Aplicamos la validación de contraseñas
  }
  

  sendform() {
    console.log("Form Status:", this.form.status);
    console.log("Form Value:", this.form.value);
    console.log("Form Valid?", this.form.valid);
    
    if (this.form.valid) {
      console.log('Submitted Form:', this.form.value);
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