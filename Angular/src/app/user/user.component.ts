import { Injectable } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthenticationService } from "../services/auth.service";
import { Subscription } from "rxjs";
import { User, SITES } from "../models/models";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.css"]
})
@Injectable()
export class UserComponent implements OnInit {
  form = new FormGroup({});
  submitted = false;

  keys = Object.keys;
  sites = SITES;

  user?: User;
  userSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: ["", [Validators.required]],
      email: ["", [Validators.required]],
      password: ["", [Validators.required]],
      //passwordMatch: [""],
      defaultSite: ["", [Validators.required]]
    });
    if (this.authenticationService.user) {
      this.userSubscription = this.authenticationService.user.subscribe(
        user => {
          this.user = user;
        }
      );
    }
  }

  get f() {
    return this.form.controls;
  }

  // passwordMatch() {
  //   let password = document.getElementById("Password");
  //   let confirmPassword = document.getElementById("confirmPassword");
  //   if (password === confirmPassword) {
  //     console.log("Your passwords match' \n");
  //   } else {
  //     alert("Your passwords didn't match\n please try again\n");
  //   }
  // }

  onSubmit() {
    if (!this.form.controls["name"].value) {
      alert("Missing name!");
    } else if (!this.form.controls["email"]) {
      alert("Email's required! \n");
    } else if (!this.form.controls["password"].value) {
      alert("Missing password \n");
    } else if (!this.form.controls["defaultSite"].value) {
      alert("Missing default site!");
    // } else if (this.form.controls["password"].value 
    //   != this.form.controls["passwordMatch"].value) {
    //     console.log(this.form.controls["password"].value);
    //     console.log(this.form.controls["passwordMatch"].value)
    //   alert("Your password didn't match\nTry again!\n");
    // 
    }else {
      this.authenticationService.updateUser(this.form.value);
      //   {
      //   name: this.form.controls['name'].value,
      //   email: this.form.controls['email'].value,
      //   password: this.form.controls['password'].value,
      //   site: this.form.controls['site'].value
        
      // }
      this.submitted = true;
    }
  }
}
