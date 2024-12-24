import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Chemin vers votre AuthService
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  signRequest = {
    firstname: '',
    lastname: '',
    email: '',
    password: ''
  };
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
  }
  onRegister(): void {
    this.authService.register(this.signRequest).subscribe(
      (response) => {
        console.log('Inscription réussie:', response);
        this.router.navigate(['/login']); // Redirection après succès
      },
      (error) => {
        console.error('Erreur lors de l’inscription:', error);
      }
    );
  }

}
