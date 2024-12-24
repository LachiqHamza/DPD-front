import { Component } from "@angular/core";
import { AuthService } from "../services/auth.service"; // Ajustez le chemin si nécessaire
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  email: string = "";
  password: string = "";
  errorMessage: string = "";

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (this.email && this.password) {
      const loginRequest = {
        email: this.email,
        password: this.password,
      };

      this.authService.login(loginRequest).subscribe(
        (response) => {
          console.log("Login successful", response);
          alert("Hello, Your token is " + response.jwt);
          // Stocker le token JWT dans localStorage
          localStorage.setItem("jwt", response.jwt);
          localStorage.setItem("userID", response.id);
          this.router.navigate(["/dashboard"]); // Rediriger vers la page d'accueil après connexion
        },
        (error) => {
          console.error("Login failed", error);
          this.errorMessage = "Invalid email or password";
        }
      );
    } else {
      this.errorMessage = "Please enter both email and password";
    }
  }
}
