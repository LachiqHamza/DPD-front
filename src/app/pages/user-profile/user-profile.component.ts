import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  userForm: FormGroup;
  userIn: any;
  passwordForm!: FormGroup;

  constructor(private fb: FormBuilder, private AuthService: AuthService) {
    this.userForm = this.fb.group({
      firstname: [""],
      lastname: [""],
      email: [""],
      phoneNumber: [""],
    });
  }
  ngOnInit(): void {
    this.AuthService.getUserInfo().subscribe((data) => {
      this.userForm.patchValue({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });
    });
    this.UserId();
    this.passwordForm = this.fb.group(
      {
        oldPassword: ["", Validators.required],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }
  // Validator to check if passwords match
  passwordMatchValidator(
    form: AbstractControl
  ): { [key: string]: boolean } | null {
    const newPassword = form.get("newPassword")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onChangePassword(): void {
    const userId = localStorage.getItem("userID");
    if (this.passwordForm.valid) {
      const { oldPassword, newPassword } = this.passwordForm.value;
      const updatePasswordPayload = { oldPassword, newPassword };

      this.AuthService.updatePasswordUser(userId,updatePasswordPayload).subscribe({
        next: (response) => {
          console.log("Réponse du backend:", response);
          alert("Mot de passe mis à jour avec succès.");
        },
        error: (error) => {
          console.error(
            "Erreur lors de la mise à jour du mot de passe:", error
          );
          alert(
            "Une erreur est survenue lors de la mise à jour du mot de passe."
          );
        },
      });
    } else {
      alert("Veuillez remplir tous les champs correctement.");
    }
  }
  onSubmit(): void {
    const userId = localStorage.getItem("userID");

    if (this.userForm.valid) {
      const updatedUserInfo = {
        ...this.userForm.value,
        id: userId,
      };

      this.AuthService.updateUserInformation(userId, updatedUserInfo).subscribe(
        {
          next: (response) => {
            console.log("Mise à jour réussie :", response);
            alert("Vos informations ont été mises à jour avec succès.");
          },
          error: (error) => {
            console.error("Erreur lors de la mise à jour :", error);
            alert("Une erreur est survenue lors de la mise à jour.");
          },
        }
      );
    } else {
      alert("Veuillez remplir tous les champs correctement.");
    }
  }
  UserId() {
    this.AuthService.getUserInfo().subscribe({
      next: (response) => {
        this.userIn = response; // Assurez-vous que le backend renvoie un tableau d'objets
        console.log("user loaded:", this.userIn);
      },
      error: (err) => {
        console.error("Error loading user:", err);
      },
    });
  }
}
