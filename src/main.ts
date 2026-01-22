import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { icons } from './app/ant-design-icons';
import { NzIconService } from 'ng-zorro-antd/icon';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    const iconService = appRef.injector.get(NzIconService);
    iconService.addIcon(...icons);
  })
  .catch((err) => console.error(err));
