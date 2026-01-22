import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SidebarComponent, BrowserAnimationsModule, HttpClientTestingModule, RouterTestingModule ],
      providers: [
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu items', () => {
    const menuItems = fixture.debugElement.queryAll(By.css('[nz-menu-item], [nz-submenu]'));
    // Dashboard (1) + Users (sub) + Users/Roles/Perms (3) + Inventory (sub) + 5 items + Sales (sub) + 2 items + Purch (sub) + 1 item
    // Submenus are also elements.
    // Let's just check for some known text
    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.textContent).toContain('Users');
    expect(nativeElement.textContent).toContain('Roles');
    expect(nativeElement.textContent).toContain('Permissions');
    expect(nativeElement.textContent).toContain('Products');
    expect(nativeElement.textContent).toContain('Warehouses');
    expect(nativeElement.textContent).toContain('Customers');
    expect(nativeElement.textContent).toContain('Sales Orders');
    expect(nativeElement.textContent).toContain('Purchase Orders');
  });
  
  it('should have correct router links', () => {
     // Check a few links
     const links = fixture.debugElement.queryAll(By.css('[routerLink]'));
     const linkPaths = links.map(l => l.attributes['routerLink']);
     expect(linkPaths).toContain('/users');
     expect(linkPaths).toContain('/roles');
     expect(linkPaths).toContain('/sales/customers');
  });
});
