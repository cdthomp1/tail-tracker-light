import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loggedInUser: string | null = null;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentUrl = this.router.url;
        if (currentUrl.includes('/dashboard')) {
          const queryParams = new URLSearchParams(currentUrl.split('?')[1] || '');
          this.loggedInUser = queryParams.get('username');
        } else {
          this.loggedInUser = null;
        }
      });
  }

  isLoggedIn(): boolean {
    return !!this.loggedInUser;
  }

  logout() {
    this.loggedInUser = null;
    this.router.navigate(['/']);
  }
}
