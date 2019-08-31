import { Component, OnInit, ViewChild, ElementRef, Input } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

declare var H: any;

@Component({
  selector: "here-map",
  templateUrl: "./here-map.component.html",
  styleUrls: ["./here-map.component.css"]
})
export class HereMapComponent {
  title = "HereMapDemo";

  @ViewChild("map", {}) public mapElement: ElementRef;

  public lat: any = "46.271760";
  public lng: any = "20.144160";

  public width: any = "1000px";
  public height: any = "800px";

  private platform: any;
  private map: any;

  private _appId: string = "wNtK9cEcbYg1qKuqpvdy";
  private _appCode: string = "t7A3pzNh5KnWvHQ4uMNyCA";

  public query: string;
  private search: any;
  private ui: any;

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

  public places(query: string) {
    //this.map.removeObjects(this.map.getObjects());
    this.search.request(
      { q: query, at: this.lat + "," + this.lng },
      {},
      data => {
        // for (let i = 0; i < data.results.items.length; i++) {
        //   this.dropMarker({ "lat": data.results.items[i].position[0], "lng": data.results.items[i].position[1] }, data.results.items[i]);
        //   if (i == 0)
        //     this.map.setCenter({ lat: data.results.items[i].position[0], lng: data.results.items[i].position[1] })
        // }
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
}
