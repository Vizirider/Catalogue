import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { Router } from "@angular/router";

import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AlertsService } from "angular-alert-module";
import { StorageService } from "./storage.service";

import {
  Catalogue,
  CatalogueSearchParams,
  LoginRequest,
  User,
  UserDetails,
  UserRequest,
  ResetPasword,
  RegisterRequest
} from "../models/models";

@Injectable()
export class AuthenticationService implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.storageService.getItem("token");
    if (this.storageService.getItem("token")) {
      return next.handle(
        req.clone({
          headers: req.headers.set("Authorization", `Bearer ${token}`)
        })
      );
    }
    return next.handle(req);
  }

  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;

  private CatalougeSubject: BehaviorSubject<Catalogue>;
  public catalogue: Observable<Catalogue>;

  public URL = "http://localhost:3000/api/v1";
  public defaultSiteText = "";
  public site = "";

  constructor(
    private alerts: AlertsService,
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    if (this.storageService.getItem("user")) {
      this.userSubject = new BehaviorSubject<User>(
        JSON.parse(localStorage.getItem("user"))
      );
      this.user = this.userSubject.asObservable();
    }
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  public getUserDetails(): UserDetails {
    let token = this.storageService.getItem("token");
    let payload: any;
    if (token) {
      payload = token.split(".")[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    }
  }

  public isLoggedIn(): boolean {
    return this.getUserDetails() ? true : false;
  }

  public login(loginData: LoginRequest) {
    return this.http
      .post<any>(`${this.URL}/login`, loginData)
      .pipe(
        map(user => {
          if (user) {
            this.storageService.setItem("token", user.token);

            this.storageService.setItem("user", JSON.stringify(user));

            this.userSubject = new BehaviorSubject<User>(
              JSON.parse(localStorage.getItem("user"))
            );
            this.user = this.userSubject.asObservable();

            this.CatalougeSubject = new BehaviorSubject<Catalogue>(
              JSON.parse(localStorage.getItem("catalogue"))
            );
            this.catalogue = this.CatalougeSubject.asObservable();

            this.getDefaultSiteText(user);
            user.defaultsitetext = this.defaultSiteText;
            this.site = user.defaultsitetext;
            user.token = JSON.parse(localStorage.getItem("user"));
          }
          return user;
        })
      )
      .subscribe(response => {
        this.router.navigate(["/user"]);
      });
  }

  public resetpassword(resetpasswordData: ResetPasword) {
    this.http
      .post<string>(
        this.URL + `/user/reset-password-with-email`,
        resetpasswordData
      )
      .subscribe(response => {});
  }

  public register(registerData: RegisterRequest) {
    this.http
      .post<string>(this.URL + `/register`, registerData)
      .subscribe(response => {
        this.alerts.setMessage("Registration successfully!", "success");
      });
  }

  public updateUser(userData: UserRequest) {
    this.http.put<string>(this.URL + `/user`, userData).subscribe(resp => {});
  }

  public getCatalogueElementSearch(
    catalogueSearchParams: CatalogueSearchParams
  ) {
    this.http
      .post<any>(this.URL + `/catalogue/search`, catalogueSearchParams)
      .pipe(
        map(filterResult => {
          if (filterResult) {
            this.storageService.setItem("catalogue", filterResult);
            this.CatalougeSubject.next(filterResult);
          }
          return filterResult;
          console.log(filterResult)
        })
      )
      .subscribe(resp => {});
  }

  public logout(): void {
    this.storageService.clear();
    this.router.navigateByUrl("/");
  }

  private getDefaultSiteText(user: any): void {
    switch (user.user.default_site_id) {
      case 1:
        this.defaultSiteText = "Szeged";
        break;
      case 2:
        this.defaultSiteText = "Pécs";
        break;
      case 3:
        this.defaultSiteText = "Debrecen";
        break;
      case 4:
        this.defaultSiteText = "Budapest";
        break;
      case 5:
        this.defaultSiteText = "Telephelytől független";
        break;
      default:
        this.defaultSiteText = "Valami más";
    }
  }
}
