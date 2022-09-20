import { Injectable, NotFoundException } from '@nestjs/common';
import { Response, Request } from 'express';

import { createReadStream, readdirSync, statSync } from 'fs';

@Injectable()
export class AppService {
  public getAllVideos(): Array<{
    name: string;
    url: string;
  }> {
    const baseUrl: string = 'http://localhost:3000';

    const allFiles: Array<string> = readdirSync('videos/');

    const finalResponse: Array<{
      name: string;
      url: string;
    }> = [];

    for (const file of allFiles) {
      finalResponse.push({ name: `${file}`, url: `${baseUrl}/video/${file}` });
    }

    return finalResponse;
  }

  public streamVideo(name: string, response: Response, request: Request) {
    const isValidVideo = this.isValidVideo(name);

    if (!isValidVideo) {
      throw new NotFoundException('El video no existe');
    }

    const { range } = request.headers;

    if (!range) {
      throw new NotFoundException('range not found');
    }

    const path = `videos/${name}`;
    const videoSize = statSync(path).size;
    const chunksize = 1 * 1e6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + chunksize, videoSize - 1);
    const contentLength = end - start + 1;

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };

    response.writeHead(206, headers);

    const stream = createReadStream(path, { start, end });

    stream.pipe(response);
  }

  private isValidVideo(name: string) {
    const allFiles: Array<string> = readdirSync('videos/');

    return allFiles.includes(name);
  }
}
