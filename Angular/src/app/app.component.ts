import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";

import { Subscription } from "rxjs";

import { StorageService } from "./services/storage.service";
import { AuthenticationService } from "./services/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  @ViewChild("map")
  public mapElement: ElementRef;

  public userSubscription: Subscription;
  public isLoggedIn?: boolean;

  constructor(
    private authService: AuthenticationService,
    private storageService: StorageService
  ) {
  }

  ngOnInit() {
    this.storageService.watchStorage().subscribe((data: string) => {
      if (this.storageService.getItem("user")) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  public onLogout(): void {
    this.authService.logout();
  }
}
