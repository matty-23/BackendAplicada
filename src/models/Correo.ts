import { ArchivoAdjuntoDTO } from "../DTO/CorreoDTO";

export class Correo{
    private id:string;
    private destinatarios:string[];
    private asunto:string;
    private mensajeHtml:string;
    private headers?: Record<string, string>;
    private archivosAdjuntos?:ArchivoAdjuntoDTO[];

    constructor(id:string, destinatarios:string[], asunto:string, mensajeHtml:string, headers?: Record<string, string>, archivosAdjuntos?:ArchivoAdjuntoDTO[]){
        this.id=id;
        this.destinatarios=destinatarios;
        this.asunto=asunto;
        this.mensajeHtml=mensajeHtml;
        this.headers=headers;
        this.archivosAdjuntos=archivosAdjuntos;
    }

    getId():string{
        return this.id;
    }
    getDestinatarios():string[]{
        return this.destinatarios;
    }
    getAsunto():string{
        return this.asunto;
    }
    getMensajeHtml():string{
        return this.mensajeHtml;
    }
    getArchivosAdjuntos():ArchivoAdjuntoDTO[]|undefined{
        return this.archivosAdjuntos;
    }
    getHeaders():Record<string, string> | undefined{
        return this.headers;
    }

}