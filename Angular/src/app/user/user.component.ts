import { Injectable } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthenticationService } from "../auth.service";
import { Subscription } from "rxjs";
import { User } from "../models/models";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.css"]
})
@Injectable()
export class UserComponent implements OnInit {
  userForm = new FormGroup({});
  submitted = false;
  currentUser: User;
  currentUserSubscription: Subscription;
  users: User[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      name: ["", [Validators.required]],
      email: ["", [Validators.required]],
      password: ["", [Validators.required]],
      defaultSite: ["", [Validators.required]]
    });
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(
      user => {
        this.currentUser = user;
      }
    );
  }

  get f() {
    return this.userForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // if (this.userForm.invalid) {
    //   alert('Missing input! \n')
    //   return;
    // }

    // Do useful stuff with the gathered data
    this.authenticationService.updateUser(this.userForm.value);
  }
}
