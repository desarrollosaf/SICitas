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
import CitasGeneral from '../../../../../../backend/src/models/citas_general';
import { CitasGeneralService } from '../../../../service/citas-general.service';

@Component({
  selector: 'app-general',
  imports: [
    NgxDatatableModule, 
    CommonModule, 
    RouterModule, 
    FormsModule,
    ReactiveFormsModule, 
    NgbTooltipModule, 
    FullCalendarModule
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class GeneralComponent {
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
  datosCita: any[] = [];
  evento_id: any;
  eventosCal: any[] = [];
  eventos: any;
  modalRef: NgbModalRef;
  viewState: 'lista' | 'enviar-link' | 'atender' = 'lista';
  mostrarCalendario = false;
  highlightedDates: string[] = [];
  horarios: {
    horario_id: number;
    horario_texto: string;
    sedes: { sede_id: number; sede_texto: string }[];
  }[] = [];
  tramites: any[] = [];
  horaSeleccionada2: number | null = null;
  tramitesSeleccionados: number[] = [];
  sedeSeleccionada: number | null = null;
  sedesDisponibles2: Array<{ sede_id: number; sede_texto: string }> = [];
  enviandoRegistro: number | null = null;

  public _citasService = inject(CitasGeneralService);

  constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router, private _userService: UserService) {
    this.formModal = this.fb.group({
      textLink: [''],
      descripcion: ['']
    });
  }

  cargandoCitas = false;

  ngOnInit(): void {
    this.currentUser = this._userService.currentUserValue;
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargandoCitas = true;
    this._citasService.getcitas(this.currentUser.rfc).subscribe({
      next: (response: any) => {
        this.cargandoCitas = false;
        this.datosCita = response.resultados.citas;
        this.eventosCal = response.resultados.eventos;
        this.calendarOptions = {
          ...this.calendarOptions,
            events: this.eventosCal.map((eventosCal: any) => ({
            title: eventosCal.evento,
            start: `${eventosCal.fecha_cita}T00:00:00`,
            end: `${eventosCal.fecha_cita}T23:59:00`
          }))
        };
        this.highlightedDates = this.eventosCal.map(
          (evento: any) => evento.fecha_cita
        );

        const fechaMasCercana = this.highlightedDates
          .slice()
          .sort()[0];

        setTimeout(() => {
          const api = this.calendarComponent?.getApi();
          api?.render();
          if (fechaMasCercana) {
            api?.gotoDate(fechaMasCercana);
          }
        });
      },
      error: (e: HttpErrorResponse) => {
        this.cargandoCitas = false;
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

  abrirCitaParaFecha(fechaStr: string, fecha: Date): void {
    if (!this.highlightedDates.includes(fechaStr)) {
      console.log('Fecha no permitida:', fechaStr);
      return;
    }

    this.selectedDate = fecha;
    this.fechaCitaEnvio = fechaStr;
    this.fechaFormateadaM = fecha.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    this._citasService.getEvento(fechaStr).subscribe({
      next: (response: any) => {
        this.abrirModal(response.evento);
        this.evento_id = response.evento.id;
        this.horarios = response.horarios;
        this.tramites = response.evento.m_tramites;
        if (response.evento.sede) {
          this.horaSeleccionada2 = null;
          this.sedeSeleccionada = response.evento.sede;
        } else {
          this.horarios = response.horarios || [];
          this.sedeSeleccionada = response.evento.sede;
          this.sedesDisponibles2 = [];
        }
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    selectable: true,
    editable: true,
    weekends: true,
    dayMaxEvents: true,
    dateClick: (info) => {
      this.abrirCitaParaFecha(info.dateStr, info.date);
    },

    eventClick: (info) => {
      const fechaStr = info.event.startStr.split('T')[0];
      this.abrirCitaParaFecha(fechaStr, info.event.start as Date);
    },

    dayCellClassNames: (arg) => {
      const dateStr = arg.date.toISOString().split('T')[0];
      const isEnabled = this.highlightedDates.includes(dateStr);
      return isEnabled ? ['dia-disponible'] : ['dia-no-disponible'];
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

    const datos = {
      fecha_cita: this.fechaCitaEnvio,
      horario_id: this.horaSeleccionada2,
      sede_id: this.sedeSeleccionada,
      rfc: this.currentUser.rfc,
      tramite: this.tramitesSeleccionados,
      evento: this.evento_id,
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
      
          this.mostrarCalendario = true;
          this.modalRef.close();
          this.cargarDatos();
        }
      },
      error: (e: HttpErrorResponse) => {
        this.enviandoRegistro = null;
        if (e.status == 400) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: "¡Atención!",
            text: e.error?.msg,
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

  abrirModal(evento: any) {
    this.personaSeleccionada = evento;
    this.sedeSeleccionada = evento.sede;

    if (this.sedeSeleccionada) {
      this.sedesDisponibles2 = [this.getSedeById(this.sedeSeleccionada)];
    } else {
      this.sedesDisponibles2 = [];
    }

    if(evento.horarios == true){
       if (this.horarios.length > 0) {
        this.horaSeleccionada2 = this.horarios[0].horario_id;
      } else {
        this.horaSeleccionada2 = null;
      }
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

  getIndicacionesEvento(eventoNombre: string | undefined): { titulo: string; items: string[] }[] {
    const nombre = (eventoNombre || '').toLowerCase();

    if (nombre.includes('vasectom')) {
      return [
        { titulo: 'Antes', items: [
          'Bañarse y acudir con higiene adecuada.',
          'Llevar ropa interior ajustada o de soporte.',
          'Informar sobre medicamentos y condiciones de salud.'
        ]},
        { titulo: 'Procedimiento', items: [
          'Se cortan y bloquean los conductos deferentes.',
          'Dura aproximadamente 20-30 minutos.'
        ]},
        { titulo: 'Ventajas', items: [
          'Muy efectiva.',
          'No afecta hormonas ni función sexual.',
          'No requiere hospitalización.'
        ]},
        { titulo: 'Recuperación', items: [
          'Regreso a casa el mismo día.',
          'Reposo relativo 24-48 horas.',
          'Evitar esfuerzos según indicación médica.',
          'La protección no es inmediata: usar otro anticonceptivo hasta confirmar con análisis de semen.'
        ]}
      ];
    }

    if (nombre.includes('mastograf')) {
      return [
        { titulo: 'Requisitos y documentos', items: [
          'Acudir bañada sin vello axilar, sin crema o desodorante.'
        ]},
        { titulo: 'Presentar', items: [
          'Copias de credencial de elector, CURP y acta de nacimiento actualizada.',
          'Si cuentas con derechohabiencia, copia de carnet o credencial con número de afiliación (IMSS, ISSSTE o ISSEMYM).',
          '1 sobre tamaño carta con nombre completo e indicando "Congreso del Estado de México".',
          '1 CD-R marca Verbatim o alguna otra, excepto Sony y HP.',
          'Estudios previos, si los tienes.'
        ]}
      ];
    }

    return [];
  }

  getSedeById(id: number) {
    const allSedes = [
      { sede_id: 1, sede_texto: 'San Rafael 108' },
      { sede_id: 2, sede_texto: 'Salón Benito Juárez' },
      { sede_id: 3, sede_texto: 'Estacionamiento de la dirección general de comunicación social' },
      { sede_id: 4, sede_texto: 'Clínica Uneme (C. Juan Aldama 1316, Col. del Parque, 50180, Toluca de Lerdo, Méx.)' },
      { sede_id: 5, sede_texto: 'Voluntariado del Congreso del Estado de México (Calle Plutarco González número 111, Col. La Merced y Alameda, Toluca de Lerdo, Méx.)' },
    ];
    return allSedes.find(sede => sede.sede_id === id) || { sede_id: id, sede_texto: 'Sede desconocida' };
  }

  descargarpdf(id: number) {
    this._citasService.generarPdfCita(id).subscribe({
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

  seleccionarTramite(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.tramitesSeleccionados.includes(id)) {
        this.tramitesSeleccionados.push(id);
      }
    } else {
      this.tramitesSeleccionados =
        this.tramitesSeleccionados.filter(tramite => tramite !== id);
    }
  }   

}

