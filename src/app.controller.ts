import { Controller, Get, Param, Response, Req } from '@nestjs/common';
import { Response as IResponse, Request } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('all-videos')
  getAllVideos(): Array<{
    name: string;
    url: string;
  }> {
    return this.appService.getAllVideos();
  }

  @Get('video/:name')
  streamVideo(
    @Param('name') name: string,
    @Response() response: IResponse,
    @Req() request: Request,
  ) {
    this.appService.streamVideo(name, response, request);
  }
}
