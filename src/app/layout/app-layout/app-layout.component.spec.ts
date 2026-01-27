import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppLayoutComponent } from './app-layout.component';
import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


// Mock child components
@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: ''
})
class MockSidebarComponent {}

@Component({
  selector: 'app-header',
  standalone: true,
  template: ''
})
class MockHeaderComponent {}

describe('AppLayoutComponent', () => {
  let component: AppLayoutComponent;
  let fixture: ComponentFixture<AppLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AppLayoutComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    })

    .overrideComponent(AppLayoutComponent, {
      remove: { imports: [ SidebarComponent, HeaderComponent ] },
      add: { imports: [ MockSidebarComponent, MockHeaderComponent ] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a sidebar and header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });

  it('should have a router-outlet', () => {
     const compiled = fixture.nativeElement as HTMLElement;
     expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
