import {
  CATEGORIES,
  Catalogue,
  CatalogueSearchParams,
  SITES
} from "./../models/models";

declare var H: any;

import { Component, OnInit, ViewChild, ElementRef, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HereMapComponent } from "./../here-map/here-map.component";

import { Subscription } from "rxjs";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

import { AuthenticationService } from "../services/auth.service";

@Component({
  selector: "app-catalogue",
  templateUrl: "./catalogue.component.html",
  styleUrls: ["./catalogue.component.css"]
})
export class CatalogueComponent implements OnInit {
  @Output() 
  form = new FormGroup({});
  submitted = false;

  @ViewChild("map") public mapElement: ElementRef;
  @ViewChild("here-map") public heremap: HereMapComponent;

  public lat: any = "46.271760";
  public lng: any = "20.144160";

  public width: any = "1600px";
  public height: any = "800px";
  public align: any = "center";

  keys = Object.keys;
  categories = CATEGORIES;
  sites = SITES;

  catalogue: Catalogue;
  catalogueSubscription: Subscription;

  columnApi: any;
  gridApi: any;
  gridColumnApi: any;

  public rowSelection: any;

  private platform: any;
  private map: any;

  private _appId: string = "wNtK9cEcbYg1qKuqpvdy";
  private _appCode: string = "t7A3pzNh5KnWvHQ4uMNyCA";

  public query: string;
  private search: any;
  private ui: any;
  private geocoder: any;
  private router: any;

  columnDefs = [
    {
      headerName: "Seller",
      field: "seller",
      sortable: true,
      filter: true,
      width: 150
      //suppressSizeToFit: true
    },
    {
      headerName: "Site",
      field: "site_id",
      sortable: true,
      filter: true,
      width: 100
    },
    {
      headerName: "Discount rate",
      field: "discount_rate",
      sortable: true,
      filter: true
    },
    {
      headerName: "Address",
      field: "address",
      sortable: true,
      filter: true
    },
    {
      headerName: "Category",
      field: "category_id",
      sortable: true,
      filter: true
    },
    {
      headerName: "Website",
      field: "url",
      cellRenderer: (url: any) => {
        return `<a href=http://${url.value} target="_blank">${url.value}</a>`;
      },
      editable: false
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true
    }
  ];

  constructor(
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder
  ) {
    this.rowSelection = "single";
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      siteIds: [[], [Validators.required]],
      categoryIds: [[], [Validators.required]]
    });

    if (this.authenticationService.catalogue) {
      this.catalogueSubscription = this.authenticationService.catalogue.subscribe(
        filterResult => {
          this.catalogue = filterResult;
        }
      );
    }
    this.platform = new H.service.Platform({
      app_id: this._appId,
      app_code: this._appCode,
      useHTTPS: true
    });
    this.geocoder = this.platform.getGeocodingService();
    this.router = this.platform.getRoutingService();
  }

  onFirstDataRendered(params): void {
    params.api.sizeColumnsToFit();
  }

  onSubmit() {
    const filterParams = {
      siteIds: this.form.controls["siteIds"].value,
      categoryIds: this.form.controls["categoryIds"].value
    };
    this.authenticationService.getCatalogueElementSearch(
      filterParams as CatalogueSearchParams
    );
    this.submitted = true;
  }

  onRevert() {
    this.form.reset();
  }

  onGridReady(params: any) {
    this.columnApi = params.columnApi;
    this.gridApi = params.api;
  }

  onRowSelected(event) {
    console.log(
      "row " + event.node.data + " selected = " + event.node.selected
    );
  }

  getLastSelectedNode() {
    let rows = this.gridApi.getSelectedRows();
    if (rows.length > 0) console.log(rows[rows.length - 1]);
    else console.log("No rows selected");
  }

  public address: string;

  onRowClicked(event: any) {
    console.log("row", event.data.address);
    this.catalogueroute(event.data.address, "1000");
  }

  public ngAfterViewInit() {
    let pixelRatio = window.devicePixelRatio || 1;
    let defaultLayers = this.platform.createDefaultLayers({
      tileSize: pixelRatio === 1 ? 256 : 512,
      ppi: pixelRatio === 1 ? undefined : 320
    });

    this.map = new H.Map(
      this.mapElement.nativeElement,
      defaultLayers.normal.map,
      { pixelRatio: pixelRatio }
    );

    let behavior = new H.mapevents.Behavior(
      new H.mapevents.MapEvents(this.map)
    );
    let ui = H.ui.UI.createDefault(this.map, defaultLayers);

    this.map.setCenter({ lat: this.lat, lng: this.lng });
    this.map.setZoom(14);

    let data: any;

  }

  
  public getCoordinates(query: string) {
    return new Promise((resolve, reject) => {
        this.geocoder.geocode({ searchText: query }, result => {
            if(result.Response.View.length > 0) {
                if(result.Response.View[0].Result.length > 0) {
                    resolve(result.Response.View[0].Result);
                } else {
                    reject({ message: "no results found" });
                }
            } else {
                reject({ message: "no results found" });
            }
        }, error => {
            reject(error);
        });
    });
  }

  public catalogueroute(start: string, range: string) {
  let transportmode = "pedestrian";
  let InfoBubble = "";
  let pixelRatio = window.devicePixelRatio || 1;
  let defaultLayers = this.platform.createDefaultLayers({
    tileSize: pixelRatio === 1 ? 256 : 512,
    ppi: pixelRatio === 1 ? undefined : 320
  });
  let ui = H.ui.UI.createDefault(this.map, defaultLayers);
  let params = {
    mode: "fastest;pedestrian;traffic:enabled",
    range: range,
    rangetype: "distance",
    departure: "now"
  };
  InfoBubble = start;
  this.map.removeObjects(this.map.getObjects());
  this.getCoordinates(start).then(
    geocoderResult => {
      params["start"] =
        geocoderResult[0].Location.DisplayPosition.Latitude +
        "," +
        geocoderResult[0].Location.DisplayPosition.Longitude;
      this.router.calculateIsoline(
        params,
        data => {
          if (data.response) {
            let center = new H.geo.Point(
                data.response.center.latitude,
                data.response.center.longitude
              ),
              isolineCoords = data.response.isoline[0].component[0].shape,
              linestring = new H.geo.LineString(),
              isolinePolygon,
              isolineCenter;
            isolineCoords.forEach(coords => {
              linestring.pushLatLngAlt.apply(linestring, coords.split(","));
            });
            //isolinePolygon = new H.map(linestring);
            isolineCenter = new H.map.Marker(center);
            this.map.setCenter({
              lat: data.response.center.latitude,
              lng: data.response.center.longitude
            });
            this.map.setZoom(16);
            let marker = new H.map.Marker({
              lat: data.response.center.latitude,
              lng: data.response.center.longitude
            });
            marker.setData("<p> " + start + "</p>");
            marker.addEventListener(
              "tap",
              event => {
                let bubble = new H.ui.InfoBubble(event.target.getPosition(), {
                  content: event.target.getData()
                });
                ui.addBubble(bubble);
              },
              false
            );
            this.map.addObject(marker);
            this.map.addObjects([isolineCenter, isolinePolygon]);
            this.map.setViewBounds(isolinePolygon.getBounds());
          }
        },
        error => {
          console.error(error);
        }
      );
    },
    error => {
      console.error(error);
    }
  );
}
  
}
