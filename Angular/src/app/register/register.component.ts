import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthenticationService } from "../services/auth.service";
import { SITES } from "./../models/models"

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({});
  submitted = false;

  keys = Object.keys;
  sites = SITES;
  
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
    

    if (!this.registerForm.controls["name"].value){
      alert("Missing name! \n");
      return;
    }else if(!this.registerForm.controls["email"].value){
      alert("Email's required! \n");
    }else if(!this.registerForm.controls["password"].value){
      alert("Missing password \n");
    }else if(!this.registerForm.controls["defaultSite"].value){
      alert("Choose your default site!! \n");
    }else{
      alert("Success registration! \n");
      this.authenticationService.register(this.registerForm.value);
      this.submitted = true;
    }

    // Do useful stuff with the gathered data

  }
}
