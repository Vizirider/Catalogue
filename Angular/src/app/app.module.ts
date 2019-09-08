import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { LoginComponent } from "./login/login.component";
import { HomeComponent } from "./home/home.component";
import { RegisterComponent } from "./register/register.component";
import { AuthenticationService } from "./services/auth.service";
import { AuthGuardService } from "./services/auth-guard.service";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { UserComponent } from "./user/user.component";
import { AlertsModule } from "angular-alert-module";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { CatalogueComponent } from "./catalogue/catalogue.component";
import { AgGridModule } from "ag-grid-angular";
import { AgmCoreModule } from "@agm/core";
import { HereMapComponent } from "./here-map/here-map.component";
import { StorageService } from "./services/storage.service";

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "register",
    component: RegisterComponent
  },
  {
    path: "user",
    component: UserComponent
  },
  {
    path: "reset-password",
    component: ResetPasswordComponent
  },
  {
    path: "catalogue",
    component: CatalogueComponent
  },
  {
    path: "here-map",
    component: HereMapComponent
  },
  {
    path: "",
    component: HomeComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    RegisterComponent,
    UserComponent,
    ResetPasswordComponent,
    CatalogueComponent,
    HereMapComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    AlertsModule.forRoot(),
    AgGridModule.withComponents(null),
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyAhB4jCPVkzclJgItF4zGKJNLVyDvfpOAY"
    }),
    FormsModule,
  ],
  providers: [
    AuthenticationService,
    AuthGuardService,
    StorageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
