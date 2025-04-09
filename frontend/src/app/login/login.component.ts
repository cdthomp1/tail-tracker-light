import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  isRegister = false;

  constructor(private api: ApiService, private router: Router) { }

  submit() {
    if (this.isRegister) {
      this.api.register(this.username, this.password).subscribe(() => {
        this.login();
      });
    } else {
      this.login();
    }
  }

  login() {
    this.api.login(this.username, this.password).subscribe(
      () => this.router.navigate(['/dashboard'], { queryParams: { username: this.username } }),
      err => alert(err.error.error)
    );
  }
}
