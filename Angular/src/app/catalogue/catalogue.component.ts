import {
  Catalogue,
  User,
  CatalogueSearchParams,
  SITES,
  CATEGORIES
} from "./../models/models";
import { Injectable } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthenticationService } from "../auth.service";
import { Subscription } from "rxjs";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

@Component({
  selector: "app-catalogue",
  templateUrl: "./catalogue.component.html",
  styleUrls: ["./catalogue.component.css"]
})
@Injectable()
export class CatalogueComponent implements OnInit {
  catalogueForm = new FormGroup({});
  objectKeys = Object.keys;
  submitted = false;
  currentUser?: User;
  currentUserSubscription: Subscription;
  Catalogue: Catalogue;
  gridApi: any;
  columnApi: any;
  CatalogueSubscription: Subscription;
  sites = SITES;
  categories = CATEGORIES;
  columnDefs = [
    { headerName: "Address", field: "address", sortable: true, filter: true },
    { headerName: "Seller", field: "seller", sortable: true, filter: true },
    {
      headerName: "Discount rate",
      field: "discount_rate",
      sortable: true,
      filter: true
    },
    { headerName: "Site name", field: "site_id", sortable: true, filter: true },
    {
      headerName: "Category name",
      field: "category_id",
      sortable: true,
      filter: true
    },
    { headerName: "Description", field: "description", editable: true }
  ];
  rowData = [];

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService
  ) {
    this.CatalogueSubscription = this.authenticationService.catalogue.subscribe(
      filterResult => {
        this.Catalogue = filterResult;
      }
    );
  }

  ngOnInit() {
    this.catalogueForm = this.formBuilder.group({
      siteIds: [[], [Validators.required]],
      categoryIds: [[], [Validators.required]]
    });
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(
      user => {
        this.currentUser = user;
      }
    );
  }

  get f() {
    return this.catalogueForm.controls;
  }

  onSubmit() {
    const filterParams = {
      siteIds: this.catalogueForm.controls["siteIds"].value,
      categoryIds: this.catalogueForm.controls["categoryIds"].value
    };
    this.authenticationService.getCatalogueElementSearch(
      filterParams as CatalogueSearchParams
    );
    this.submitted = true;
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
}
