import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  ngOnInit() {
    
    const menuToggle = document.getElementById('menu-toggle');
    const navbarMenu = document.getElementById('navbar-menu');

    if (menuToggle && navbarMenu) {
      menuToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('hidden');
      });
    }

    
    const dropdownToggle = document.getElementById('dropdownNavbarLink');
    const dropdownMenu = document.getElementById('dropdownNavbar');

    if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
      });
    }
  }

}
