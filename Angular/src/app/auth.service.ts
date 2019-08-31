import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpClient,
  HttpHeaders
} from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AlertsService } from "angular-alert-module";
import {
  UserDetails,
  LoginRequest,
  ResetPasword,
  RegisterRequest,
  UserRequest,
  CatalogueSearchParams,
  User,
  Catalogue
} from "./models/models";

@Injectable()
export class AuthenticationService implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let reqHeader = req.clone({
      headers: req.headers.set("Authorization", "MyAuthToken")
    });
    return next.handle(reqHeader);
  }

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  private CatalougeSubject: BehaviorSubject<Catalogue>;
  public catalogue: Observable<Catalogue>;

  URL = "http://localhost:3000/api/v1";
  bearer = "Bearer ";
  defaultsitetext = "";
  site = "";
  token = "";

  constructor(
    private http: HttpClient,
    private router: Router,
    private alerts: AlertsService
  ) {
    if (localStorage.getItem("currentUser")) {
      this.currentUserSubject = new BehaviorSubject<User>(
        JSON.parse(localStorage.getItem("currentUser"))
      );
      this.currentUser = this.currentUserSubject.asObservable();
    }
    if (localStorage.getItem("catalogue")) {
      this.CatalougeSubject = new BehaviorSubject<Catalogue>(
        JSON.parse(localStorage.getItem("catalogue"))
      );
      this.catalogue = this.CatalougeSubject.asObservable();
    }
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  private saveToken(token: string): void {
    localStorage.setItem("userToken", token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem("userToken");
    }
    return this.token;
  }

  public getUserDetails(): UserDetails {
    let token = this.getToken();
    let payload: any;
    if (token) {
      payload = token.split(".")[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    let user = this.getUserDetails();
    if (user) {
      return user.is_active;
    } else {
      return false;
    }
  }

  public login(loginData: LoginRequest) {
    return this.http
      .post<any>(this.URL + `/login`, loginData)
      .pipe(
        map(user => {
          if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));

            this.currentUserSubject = new BehaviorSubject<User>(
              JSON.parse(localStorage.getItem("currentUser"))
            );
            this.currentUser = this.currentUserSubject.asObservable();

            this.CatalougeSubject = new BehaviorSubject<Catalogue>(
              JSON.parse(localStorage.getItem("catalogue"))
            );
            this.catalogue = this.CatalougeSubject.asObservable();

            let currentUser = JSON.parse(localStorage.getItem("currentUser"));

            switch (currentUser.user.default_site_id) {
              case 1:
                this.defaultsitetext = "Szeged";
                break;
              case 2:
                this.defaultsitetext = "Pécs";
                break;
              case 3:
                this.defaultsitetext = "Debrecen";
                break;
              case 4:
                this.defaultsitetext = "Budapest";
                break;
              case 5:
                this.defaultsitetext = "Telephelytől független";
                break;
              default:
                this.defaultsitetext = "Valami más";
            }
            user.defaultsitetext = this.defaultsitetext;
            this.site = user.defaultsitetext;
            user.token = currentUser.token;
            this.token = user.token;
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
    this.http
      .put<string>(this.URL + `/user`, userData, {
        headers: new HttpHeaders({
          Authorization: this.bearer + this.token
          // 'Content-Type' : 'application/x-www-form-urlencoded'
        })
      })
      .subscribe(resp => {});
  }

  public getCatalogueElementSearch(
    catalogueSearchParams: CatalogueSearchParams
  ) {
    this.http
      .post<any>(this.URL + `/catalogue/search`, catalogueSearchParams, {
        headers: new HttpHeaders({
          Authorization: this.bearer + this.token,
          "Content-Type": "application/json"
        })
      })
      .pipe(
        map(filterResult => {
          if (filterResult) {
            localStorage.setItem("catalogue", filterResult);
            this.CatalougeSubject.next(filterResult);
          }
          return filterResult;
        })
      )
      .subscribe(resp => {});
  }

  public logout(): void {
    this.token = "/";
    window.localStorage.clear();
    this.router.navigateByUrl("/");
  }
}
