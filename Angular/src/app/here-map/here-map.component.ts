import { Component, OnInit, ViewChild, ElementRef, Input } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
RANGETYPES
} from "./../models/models";

declare var H: any;

@Component({
  selector: "here-map",
  templateUrl: "./here-map.component.html",
  styleUrls: ["./here-map.component.css"],
  // template: `
  // <app-catalogue [lat]='lat' [lng]='lng'
  // [width]='width' [height]='height' [platform]='platform'
  // [map]='map' [_appId]='_appId' [_appCode]='_appCode'
  // [query]='query' [search]='search' [ui]='ui'
  // [geocoder]='geocoder' [router]='router'
  // ></app-catalogue>
  // `
})
export class HereMapComponent implements OnInit {
  title = "HereMapDemo";

  keys = Object.keys;
  rangetype = RANGETYPES;

  @ViewChild("map", {}) public mapElement: ElementRef;

  public lat: any = "46.271760";
  public lng: any = "20.144160";

  public width: any = "1600px";
  public height: any = "800px";

  public platform: any;
  public map: any;

  public _appId: string = "wNtK9cEcbYg1qKuqpvdy";
  public _appCode: string = "t7A3pzNh5KnWvHQ4uMNyCA";

  public query: string;
  public search: any;
  public ui: any;
  public geocoder: any;
  public router: any;

  public constructor() {
    this.query = "";
  }

  public ngOnInit() {

    this.platform = new H.service.Platform({
      app_id: this._appId,
      app_code: this._appCode,
      useHTTPS: true
    });
    //this.search = new H.places.Search(this.platform.getPlacesService());
    this.geocoder = this.platform.getGeocodingService();
    this.router = this.platform.getRoutingService();

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

  public places(query: string) {
    this.map.removeObjects(this.map.getObjects());
    this.search.request(
      { q: query, at: this.lat + "," + this.lng },
      {},
      data => {
        for (let i = 0; i < data.results.items.length; i++) {
          this.dropMarker({ "lat": data.results.items[i].position[0], "lng": data.results.items[i].position[1] }, data.results.items[i]);
          if (i == 0)
            this.map.setCenter({ lat: data.results.items[i].position[0], lng: data.results.items[i].position[1] })
        }
        this.ngAfterViewInit();
      },
      error => {
        console.error(error);
      }
    );
  }

  public dropMarker(coordinates: any, data: any) {
    let marker = new H.map.Marker(coordinates);
    marker.setData("<p>" + data.title + "<br>" + data.vicinity + "</p>");
    marker.addEventListener(
      "tap",
      event => {
        let bubble = new H.ui.InfoBubble(event.target.getPosition(), {
          content: event.target.getData()
        });
        this.ui.addBubble(bubble);
      },
      false
    );
    this.map.addObject(marker);
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

  public route(start: string, range: string) {
    let transportmode = "pedestrian"
    let pixelRatio = window.devicePixelRatio || 1;
    let defaultLayers = this.platform.createDefaultLayers({
      tileSize: pixelRatio === 1 ? 256 : 512,
      ppi: pixelRatio === 1 ? undefined : 320
    });
    let ui = H.ui.UI.createDefault(this.map, defaultLayers);
    let params = {
        "mode": "fastest;pedestrian;traffic:enabled",
        "range": range,
        "rangetype": "distance",
        "departure": "now"
    }
    this.map.removeObjects(this.map.getObjects());
    this.getCoordinates(start).then(geocoderResult => {
        params["start"] = geocoderResult[0].Location.DisplayPosition.Latitude + "," + geocoderResult[0].Location.DisplayPosition.Longitude;
        this.router.calculateIsoline(params, data => {
            if(data.response) {
                let center = new H.geo.Point(data.response.center.latitude, data.response.center.longitude),
                    isolineCoords = data.response.isoline[0].component[0].shape,
                    linestring = new H.geo.LineString(),
                    isolinePolygon,
                    isolineCenter;
                isolineCoords.forEach(coords => {
                    linestring.pushLatLngAlt.apply(linestring, coords.split(','));
                    let marker = new H.map.Marker({ lat: data.response.center.latitude, lng: data.response.center.longitude });
                    marker.setData(start);
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
                });
                isolinePolygon = new H.map.Polygon(linestring);
                isolineCenter = new H.map.Marker(center);
                this.map.addObjects([isolineCenter, isolinePolygon]);
                this.map.setViewBounds(isolinePolygon.getBounds());
                
                let marker = new H.map.Marker({ lat: 46.27176, lng: 20.14416 });
                marker.setData("<p> Szeged ITSH discount catalogue</p>");
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

                let marker1 = new H.map.Marker({ lat: 46.27253, lng: 20.1526 });
                marker1.setData("<p> Makkos bisztró</p>");
                marker1.addEventListener(
                  "tap",
                  event => {
                    let bubble = new H.ui.InfoBubble(event.target.getPosition(), {
                      content: event.target.getData()
                    });
                    ui.addBubble(bubble);
                  },
                  false
                );
                this.map.addObject(marker1);
                
            }
        }, error => {
            console.error(error);
        });
    }, error => {
        console.error(error);
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