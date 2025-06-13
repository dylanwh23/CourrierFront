import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TarifasComponent } from './tarifas/tarifas.component';
import { SoporteComponent } from './soporte/soporte.component';
import { CalculadoraComponent } from './calculadora/calculadora.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { SoportechatComponent } from './soportechat/soportechat.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tarifas', component: TarifasComponent },
  { path: 'soporte', component: SoporteComponent },
  { path: 'calculadora', component: CalculadoraComponent },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'soportechat', component: SoportechatComponent }

];
