import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { NgbModal, NgbModalRef, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { UserService } from '../../../../core/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { CitasIssemymService } from '../../../../service/citas-issemym.service';

@Component({
  selector: 'app-issemym',
  imports: [
    NgxDatatableModule, 
    CommonModule, 
    RouterModule, 
    FormsModule,
    ReactiveFormsModule, 
    NgbTooltipModule, 
    FullCalendarModule
  ],
  templateUrl: './issemym.component.html',
  styleUrl: './issemym.component.scss'
})
export class IssemymComponent {
  @ViewChild('table') table: DatatableComponent;
  @ViewChild('fullcalendar') calendarComponent: FullCalendarComponent;
  @ViewChild('xlModal', { static: true }) xlModal!: TemplateRef<any>;

  formModal: FormGroup;
  showModal = false;
  selectedDate: Date | null = null;
  fechaFormat: any;
  fechaModal: any;
  selectedHour: string = '';
  fechaSeleccionada: any;
  horaSeleccionada: string = '';
  mensajeDisponibilidad: string = '';
  numeroLugares: number = 0;
  currentUser: any;
  banderaCita: number = 0;
  fechaHoraActual: string = '';
  fechaCitaEnvio: string = '';
  fechaFormateadaM: string = '';
  personaSeleccionada: any = null;
  datosCita: any = null;
  modalRef: NgbModalRef;
  viewState: 'lista' | 'enviar-link' | 'atender' = 'lista';
  mostrarCalendario = false;
  highlightedDates: string[] = ['2026-04-13', '2026-04-14'];
  horarios: {
    horario_id: number;
    horario_texto: string;
    sedes: { sede_id: number; sede_texto: string }[];
  }[] = [];
  horaSeleccionada2: number | null = null;
  sedeSeleccionada: number | null = null;
  sedesDisponibles2: Array<{ sede_id: number; sede_texto: string }> = [];
  correoUsuario: string = '';
  correoConfirmado: string = '';
  telefonoUsuario: string = '';
  telefonoConfirmado: string = '';
  enviandoRegistro: number | null = null;

  public _citasService = inject(CitasIssemymService);

  constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router, private _userService: UserService) {
    this.formModal = this.fb.group({
      textLink: [''],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this._userService.currentUserValue;
    this._citasService.getcitaRFC(this.currentUser.rfc).subscribe({
      next: (response: any) => {
        this.datosCita = response
        if (response.citas.length > 0) {
          this.mostrarCalendario = true;
        }
      },
      error: (e: HttpErrorResponse) => {
        if (e.status == 400) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: "¡Atención!",
            text: "Ya tienes una cita activa",
            showConfirmButton: false,
            timer: 5000
          });
          if (this.modalRef) {
            this.modalRef.close('');
          }
        } else {
          const msg = e.error?.msg || 'Error desconocido';
          console.error('Error del servidor:', msg);
        }
      }
    });
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    initialDate: '2026-04-13',
    locale: 'es',
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    selectable: true,
    editable: false,
    weekends: true,
    dayMaxEvents: true,
    validRange: {
      start: '2026-04-15',
      end: '2026-04-17'
    },

    dateClick: (info) => {
      const clickedDate = info.dateStr;
      if (this.highlightedDates.includes(clickedDate)) {
        this.selectedDate = info.date;
        this.fechaCitaEnvio = clickedDate;
        this.fechaFormateadaM = info.date.toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        this._citasService.getCitas(clickedDate).subscribe({
          next: (response: any) => {
            const sedeFija = this.fechaCitaEnvio == '2026-04-15' ? 3 : (this.fechaCitaEnvio == '2026-04-16' ? 3 : null);

            if (sedeFija) {
              this.horarios = (response.horarios || []).filter((horario: any) =>
                horario.sedes.some((sede: any) => sede.sede_id === sedeFija)
              );
              this.horarios.forEach(horario => {
                horario.sedes = horario.sedes.filter(sede => sede.sede_id === sedeFija);
              });

              this.horaSeleccionada2 = null;
              this.sedeSeleccionada = sedeFija;
              this.sedesDisponibles2 = this.horarios.length > 0 ? this.horarios[0].sedes : [];
            } else {
              this.horarios = response.horarios || [];
              this.sedeSeleccionada = null;
              this.sedesDisponibles2 = [];
            }
            // console.log(this.horarios);
            if (!this.horarios || this.horarios.length === 0) {
              this.modalService.dismissAll();
              Swal.fire({
                icon: 'warning',
                title: 'Sin horarios disponibles',
                text: 'Ya no hay horarios disponibles para esta fecha.',
                showConfirmButton: false,
                timer:2000,
              });
              return;
        }
          },
          error: (e: HttpErrorResponse) => {
            const msg = e.error?.msg || 'Error desconocido';
            console.error('Error del servidor:', msg);
          }
        });
        this.abrirModal(null);
      } else {
        console.log('Fecha no permitida:', clickedDate);
      }
    },

    dayCellDidMount: (info) => {
      const dateStr = info.date.toISOString().split('T')[0];
      const isEnabled = this.highlightedDates.includes(dateStr);

      if (!isEnabled) {
        info.el.style.backgroundColor = '#f0f0f0';
        info.el.style.opacity = '0.4';
        info.el.style.pointerEvents = 'none';
      } else {
        info.el.style.backgroundColor = '#d1e7dd';
        info.el.style.border = '2px solid #0f5132';
        info.el.style.cursor = 'pointer';
      }
    }
  };

  onHoraChange() {
    const horario = this.horarios.find(h => h.horario_id === this.horaSeleccionada2);

    if (this.sedeSeleccionada) {
      this.sedesDisponibles2 = (horario?.sedes ?? []).filter(sede => sede.sede_id === this.sedeSeleccionada);
    } else {
      this.sedesDisponibles2 = (horario?.sedes ?? []).map(sede => {
        if (typeof sede === 'string') {
          return { sede_id: 0, sede_texto: sede };
        }
        return sede;
      });
    }
  }


  guardarSeleccion() {
    this.currentUser = this._userService.currentUserValue;
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correoRegex.test(this.correoUsuario)) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: '¡Error!',
        text: 'El correo electrónico no es válido.',
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(this.telefonoUsuario)) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: '¡Error!',
        text: 'El teléfono debe contener exactamente 10 dígitos.',
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    if (this.correoUsuario !== this.correoConfirmado) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: "¡Error!",
        text: "Los correos no coinciden.",
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    if (this.telefonoUsuario !== this.telefonoConfirmado) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: "¡Error!",
        text: "Los teléfonos no coinciden.",
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }


    const datos = {
      fecha_cita: this.fechaCitaEnvio,
      horario_id: this.horaSeleccionada2,
      sede_id: this.sedeSeleccionada,
      rfc: this.currentUser.rfc,
      correo: this.correoUsuario,
      telefono: this.telefonoUsuario
    };

    this.enviandoRegistro = 1;

    this._citasService.saveCita(datos).subscribe({
      next: (response: any) => {
        this.enviandoRegistro = null;
        if (response.status == 200) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: "¡Cita registrada!",
            text: "Antes de acudir, descarga e imprime tu comprobante de cita.",
            showConfirmButton: false,
            timer: 5000
          });
          this._citasService.getcitaRFC(this.currentUser.rfc).subscribe({
            next: (response: any) => {
              this.datosCita = response
              if (response.citas.length > 0) {
                this.mostrarCalendario = true;
              }
            },
            error: (e: HttpErrorResponse) => {
              if (e.status == 400) {
                Swal.fire({
                  position: 'center',
                  icon: 'error',
                  title: "¡Atención!",
                  text: "Ya tienes una cita activa",
                  showConfirmButton: false,
                  timer: 5000
                });
                if (this.modalRef) {
                  this.modalRef.close('');
                }
              } else {
                const msg = e.error?.msg || 'Error desconocido';
                console.error('Error del servidor:', msg);
              }
            }
          });
          this.mostrarCalendario = true;
          this.modalRef.close();
        }

      },
      error: (e: HttpErrorResponse) => {
        this.enviandoRegistro = null;
        if (e.status == 400) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: "¡Atención!",
            text: "Ya tienes una cita activa",
            showConfirmButton: false,
            timer: 5000
          });
          if (this.modalRef) {
            this.modalRef.close('');
          }
        } else {
          const msg = e.error?.msg || 'Error desconocido';
          console.error('Error del servidor:', msg);
        }
      }
    });

  }



  onEventClick(arg: any): void {
    // console.log('holi')
    const evento = arg.event;
    const today = new Date();
    const clickedDate = evento.start;
    this.selectedDate = evento.start;
    this.fechaSeleccionada = evento.start;
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0'); // Mes va de 0 a 11
    const day = String(clickedDate.getDate()).padStart(2, '0');

    this.fechaFormat = `${year}-${month}-${day}`;
    this.fechaFormateadaM = this.fechaSeleccionada.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    this.abrirModal(1)
  }

  abrirModal(persona: any) {
    this.personaSeleccionada = persona;


    if (this.fechaCitaEnvio === '2026-02-24') {
      this.sedeSeleccionada = 1;
    } else if (this.fechaCitaEnvio === '2025-11-05') {
      this.sedeSeleccionada = 2;
    } else {
      this.sedeSeleccionada = 3;
    }

    if (this.sedeSeleccionada) {
      this.sedesDisponibles2 = [this.getSedeById(this.sedeSeleccionada)];
    } else {
      this.sedesDisponibles2 = [];
    }

    this.horarios = this.horarios.filter(horario =>
      horario.sedes.some(sede => sede.sede_id === this.sedeSeleccionada)
    );

    if (this.horarios.length > 0) {
      this.horaSeleccionada2 = this.horarios[0].horario_id;
    } else {
      this.horaSeleccionada2 = null;
    }

    this.modalRef = this.modalService.open(this.xlModal, { size: 'xl' });
    setTimeout(() => {
      const elementoDentroDelModal = document.getElementById('focus-target');
      elementoDentroDelModal?.focus();
      if (this.table) {
        this.table.recalculate();
      }
    }, 400);

    this.modalRef.result.then(() => {
      this.limpiaf();
      this.viewState = 'lista';
    }).catch(() => {
      this.limpiaf();
      this.viewState = 'lista';
    });
  }

  getSedeById(id: number) {
    const allSedes = [
      { sede_id: 1, sede_texto: 'San Rafael 108' },
      { sede_id: 2, sede_texto: 'Sede 2' },
    ];
    return allSedes.find(sede => sede.sede_id === id) || { sede_id: id, sede_texto: 'Sede desconocida' };
  }

  descargarpdf() {
    this._citasService.generarPdfinal(this.currentUser.rfc).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'acuseCita' + this.currentUser.rfc + '.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar el PDF', error);
      }
    });

  }

  limpiaf() {
    ['textLink', 'descripcion'
    ].forEach(campo => {
      const control = this.formModal.get(campo);
      control?.setValue(null);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
    this.formModal.patchValue({
      textLink: '',
      descripcion: ''
    });
  }

}

