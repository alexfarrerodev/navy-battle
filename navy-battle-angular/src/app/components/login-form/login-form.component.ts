import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-login-form',
  imports: [CommonModule,ReactiveFormsModule,FormGroup],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  title = 'form'
  form = 'FormGroup';
}
