import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/api')//decorator prefix
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')//same as router.get
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('/data')
  postData():string{
    return 'Data received';
  }
  //@Put
  //@Delete
  //@Patch
}
