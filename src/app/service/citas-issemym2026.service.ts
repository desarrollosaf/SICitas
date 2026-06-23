import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class CitasIssemym2026Service {

  private myAppUrl: string;
  private myAPIUrl: string;
  private http = inject( HttpClient );
  constructor() {
      this.myAppUrl = enviroment.endpoint;
      this.myAPIUrl ='api/citasSalud';
  }
  getcitaRFC(rfc: String): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/getcitaservidor/${rfc}`)
  }
 
  getCitas(fecha: String): Observable<any> {
  return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/gethorarios/${fecha}`)
  }

  saveCita(data:any): Observable<string> {
  return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/savecita/`,data)
  }

  generarPdfinal(rfc: string): Observable<Blob> {
  return this.http.get(`${this.myAppUrl}${this.myAPIUrl}/pdfAcuse/${rfc}`, {
      responseType: 'blob'
    });
  }

}
