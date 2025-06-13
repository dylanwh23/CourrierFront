import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoportechatComponent } from './soportechat.component';

describe('SoportechatComponent', () => {
  let component: SoportechatComponent;
  let fixture: ComponentFixture<SoportechatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoportechatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoportechatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
