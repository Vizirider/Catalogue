import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "../services/auth.service";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"]
})
export class ResetPasswordComponent implements OnInit {
  resetpasswordForm = new FormGroup({});
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.resetpasswordForm = this.formBuilder.group({
      email: ["", [Validators.required]]
    });
  }

  get f() {
    return this.resetpasswordForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.resetpasswordForm.invalid) {
      alert("Missing input! \n");
      return;
    }
    this.authenticationService.resetpassword(this.resetpasswordForm.value);
  }
  onReset() {
    this.authenticationService.resetpassword(this.resetpasswordForm.value);
  }
}
