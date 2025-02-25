import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
@Component({
  selector: 'app-register-form',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './register-form.component.html',
  styles: ``
})
export class RegisterFormComponent {
  form: FormGroup;
  password1: string ="";
  password2: string ="";
  passwordConfirmed = false;
  StrongPasswordRegx: RegExp = /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;

  constructor(){
    this.form = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.minLength(3)]),
      email: new FormControl('',[Validators.required,Validators.email]),
      password1: new FormControl('',[Validators.required,Validators.pattern(this.StrongPasswordRegx)]),
      password2: new FormControl('',[Validators.required])
    })
  }


  sendform(){
    if (this.form.valid) {
      console.log('Submitted Form :', this.form.value);
    } else {
      console.log('Invalid Form');
    }

  }

  confirmPassword(){
    if(this.password1 === this.password2){
      this.passwordConfirmed = true
      return this.passwordConfirmed
    }else{
      return "❌Incorrectly Password❌"
    }
  }
}
