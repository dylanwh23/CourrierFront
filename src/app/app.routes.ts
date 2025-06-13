import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TarifasComponent } from './tarifas/tarifas.component';
import { SoporteComponent } from './soporte/soporte.component';
import { CalculadoraComponent } from './calculadora/calculadora.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { MisDatosComponent } from './profile/profileSecciones/mis-datos/mis-datos.component';
import { MisOrdenesComponent } from './profile/profileSecciones/mis-ordenes/mis-ordenes.component';
import { MisReclamosComponent } from './profile/profileSecciones/mis-reclamos/mis-reclamos.component';
import { SoportechatComponent } from './soportechat/soportechat.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tarifas', component: TarifasComponent },
  { path: 'soporte', component: SoporteComponent },
  { path: 'calculadora', component: CalculadoraComponent },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'soportechat', component: SoportechatComponent },
   {
    path: 'profile',
    component: ProfileComponent,
    children: [
      { path: 'misdatos', component: MisDatosComponent },
      { path: 'misordenes', component: MisOrdenesComponent },
      { path: 'misreclamos', component: MisReclamosComponent }
    ]
  }

];
