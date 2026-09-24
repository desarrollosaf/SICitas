import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroment } from '../../enviroments/enviroment';


@Injectable({
  providedIn: 'root'
})
export class CitasGeneralService {
  private myAppUrl: string;
  private myAPIUrl: string;
  private http = inject( HttpClient );
  constructor() {
      this.myAppUrl = enviroment.endpoint;
      this.myAPIUrl ='api/citasGeneral';
   }

  getcitas(rfc: String): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/getGeneral/${rfc}`)
  }

  getEvento(fecha: String): Observable<any> {
    return this.http.get<any>(`${this.myAppUrl}${this.myAPIUrl}/getEvento/${fecha}`)
  }

  saveCita(data:any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/savecita/`,data)
  }

  generarPdfCita(id: number): Observable<Blob> {
    return this.http.get(`${this.myAppUrl}${this.myAPIUrl}/pdf/${id}`, {
      responseType: 'blob',
    });
  }

  
}