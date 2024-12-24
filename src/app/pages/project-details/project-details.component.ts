import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-project-details",
  templateUrl: "./project-details.component.html",
  styleUrls: ["./project-details.component.scss"],
  providers: [NgbModalConfig, NgbModal],
})
export class ProjectDetailsComponent implements OnInit {
  project: any = {}; // Projet actuel
  tasks: any[] = []; // Liste des tâches
  idd!: string; // ID du projet actuel
  workspaceForm!: FormGroup; // Formulaire pour le workspace
  taskForm: FormGroup;
  loading: boolean = false; // Indicateur de chargement
  errorMessage: string = ""; // Message d'erreur

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Récupération de l'ID du projet depuis l'URL
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.idd = id;
      this.loadProjectDetails(id);
      this.loadTasks(id);
    }

    // Initialisation du formulaire
    this.workspaceForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      description: ["", Validators.required],
      status: ["", Validators.required],
    });
    this.taskForm = this.fb.group({
      title: ["", Validators.required], // Champ obligatoire
      priority: ["", Validators.required],
      description: ["", Validators.required],
      dueDate: ["", Validators.required],
    });
  }

  // Charger les détails du projet
  loadProjectDetails(id: string): void {
    this.loading = true;
    this.authService.getProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        // Pré-remplir le formulaire avec les données du projet
        this.workspaceForm.patchValue({
          name: data.name,
          description: data.description,
          status: data.status,
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement du projet.";
        console.error(err);
        this.loading = false;
      },
    });
  }

  // Charger les tâches liées au projet
  loadTasks(id: string): void {
    this.authService.getTaskByIdproject(id).subscribe({
      next: (response) => {
        this.tasks = response;
        console.log("Tâches chargées :", this.tasks);
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement des tâches.";
        console.error(err);
      },
    });
  }

  // Mettre à jour le workspace
  updateWorkspace(): void {
    if (this.workspaceForm.invalid) {
      console.error("Le formulaire est invalide.");
      return;
    }

    const ownerID = localStorage.getItem("userID"); // Récupération de l'ID utilisateur
    if (!ownerID) {
      console.error("ID de l'utilisateur introuvable dans le local storage");
      return;
    }

    const workspaceData = {
      ...this.workspaceForm.value,
      owner: ownerID, // Ajout de l'ID du propriétaire
    };

    this.loading = true; // Activer l'indicateur de chargement
    this.authService.updateWorkspace(workspaceData, this.idd).subscribe({
      next: (response) => {
        console.log("Workspace mis à jour avec succès :", response);
        // Recharger la page ou rediriger
        window.location.reload();
      },
      error: (error) => {
        this.errorMessage = "Erreur lors de la mise à jour du workspace.";
        console.error(error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  confirmDelete(): void {
    this.authService.deleteProject(this.idd).subscribe({
      next: () => {
        console.log("Projet supprimé avec succès");
        // Redirigez ou mettez à jour la liste après la suppression
        this.router.navigate(["/dashboard"]).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        console.error("Erreur lors de la suppression du projet :", err);
      },
    });
  }

  confirmDeleteTask(id): void {
    this.authService.deleteTask(id).subscribe({
      next: () => {
        console.log("Projet supprimé avec succès");
        // Redirigez ou mettez à jour la liste après la suppression
        window.location.reload();
      },
      error: (err) => {
        console.error("Erreur lors de la suppression du projet :", err);
      },
    });
  }

  addTask(): void {
    if (this.taskForm.valid) {
      const ownerID = localStorage.getItem("userID");
      const taskData = {
        ...this.taskForm.value,
        assignedToId: ownerID, // Ajout de l'ID du propriétaire
        projectId: this.idd,
      };

      this.authService.addTask(taskData).subscribe({
        next: () => {
          console.log("Task added successfully");
          window.location.reload();
          this.loadTasks(this.idd);
        },
        error: (err) => {
          console.error("Error adding task:", err);
        },
      });
    }
  }

  // Méthodes pour mettre à jour le statut
  setStatusTODO(id: string): void {
    this.authService
      .updateStatusTODO(id)
      .subscribe(() => this.loadTasks(this.idd));
  }

  setStatusIN_PROGRESS(id: string): void {
    this.authService
      .updateStatusIN_PROGRESS(id)
      .subscribe(() => this.loadTasks(this.idd));
  }

  setStatusCOMPLETED(id: string): void {
    this.authService
      .updateStatusCOMPLETED(id)
      .subscribe(() => this.loadTasks(this.idd));
  }

  // Méthodes pour mettre à jour la priorité
  setPriorityLOW(id: string): void {
    this.authService
      .updatePriorityLOW(id)
      .subscribe(() => this.loadTasks(this.idd));
  }

  setPriorityMEDIUM(id: string): void {
    this.authService.updatePriorityMEDIUM(id).subscribe({
      next: () => this.loadTasks(this.idd),
      error: (error) =>
        console.error("Erreur sur updateStatusCOMPLETED :", error),
    });
  }

  setPriorityHIGH(id: string): void {
    this.authService
      .updatePriorityHIGH(id)
      .subscribe(() => this.loadTasks(this.idd));
  }
}
