import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, empty, defer, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { ipfsToken } from './tokens';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class IpfsDaemonService {
  constructor(@Inject(ipfsToken) private ipfs, private httpClient: HttpClient) { }

  public getId(): Observable<string> {
    return from(this.ipfs.id()).pipe(
      tap((res: any) =>
        console.log(`IPFS node id object: ${JSON.stringify(res)}`)
      ),
      map(res => res.id)
    );
  }

  public getVersion(): Observable<string> {
    return from(this.ipfs.version()).pipe(
      tap((res: any) =>
        console.log(`IPFS node version object: ${JSON.stringify(res)}`)
      ),
      map(res => res.version)
    );
  }

  public addFile(file: File): Observable<string> {

    const data = {
      path: file.name,
      content: file
    };

    const options = {
      progress: (prog) => console.log(`progress report: ${prog}`)
    };

    return from(this.ipfs.add(data, options)).pipe(
      tap((res: any) =>
        console.log(`IPFS node response json: ${JSON.stringify(res)}`)
      ),
      map((res: any) => res[res.length - 1].hash)
    );
  }

  public getFile(hash: string): Observable<Blob> {

    // const sz = defer(async () => await toBuffer(this.ipfs.cat(hash)));

    return of(1).pipe(
      switchMap(async () => {

        // const buff = await toBuffer(this.ipfs.cat(hash));
        const chunks = []
        for await (const chunk of this.ipfs.cat(hash)) {
          chunks.push(chunk)
        }

        const buff = Buffer.concat(chunks);
        return buff;
      }),
      switchMap((buffer: Buffer) => {
        // based on https://mraddon.blog/2018/07/15/how-to-push-load-image-file-from-to-ipfs-using-javascript-examples-part-iv/
        const byteString = buffer.toString('base64');

        // idea based on https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
        const url = `data:application/octet-stream;base64,${byteString}`;

        // idea based on https://brianflove.com/2017/11/02/angular-http-client-blob/
        return this.httpClient.get(url, {
          responseType: 'blob'
        });
      }


      ))

  }

}
