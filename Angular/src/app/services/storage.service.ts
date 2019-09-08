import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class StorageService {
  private storageSub = new Subject<boolean>();

  watchStorage(): Observable<any> {
    return this.storageSub.asObservable();
  }

  getItem(key: string): any {
    return localStorage.getItem(key);
  }

  setItem(key: string, data: any): void {
    localStorage.setItem(key, data);
    this.storageSub.next();
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
    this.storageSub.next();
  }

  clear(): void {
    localStorage.clear();
    this.storageSub.next();
  }
}
