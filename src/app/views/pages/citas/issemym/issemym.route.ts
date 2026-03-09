import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./issemym.component').then(c => c.IssemymComponent)
    },
    // {
    //     path: 'servidores-publicos',
    //     loadComponent: () => import('./servidores-publicos/servidores-publicos.component').then(c => c.ServidoresPublicosComponent)
    // },
] as Routes;