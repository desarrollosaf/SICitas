import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./issemym2026.component').then(c => c.Issemym2026Component)
    },
    // {
    //     path: 'servidores-publicos',
    //     loadComponent: () => import('./servidores-publicos/servidores-publicos.component').then(c => c.ServidoresPublicosComponent)
    // },
] as Routes;