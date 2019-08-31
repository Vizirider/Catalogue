import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthenticationService } from "../auth.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({});
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ["", [Validators.required]],
      email: ["", [Validators.required]],
      password: ["", [Validators.required]],
      defaultSite: ["", [Validators.required]]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      alert("Missing input! \n");
      return;
    }

    // Do useful stuff with the gathered data
    alert("Success registration! \n");
    this.authenticationService.register(this.registerForm.value);
  }
}
