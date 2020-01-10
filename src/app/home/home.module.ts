import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HomeRoutingModule } from "./home-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { HomeComponent } from "./home.component";
import { SharedModule } from "../shared/shared.module";
import { ProfileComponent } from './profile/profile.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { LogComponent } from './log/log.component';

@NgModule({
  declarations: [HomeComponent, ProfileComponent, WorkflowComponent, LogComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    HomeRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    BrowserModule,
    BrowserAnimationsModule
  ]
})
export class HomeModule {}
