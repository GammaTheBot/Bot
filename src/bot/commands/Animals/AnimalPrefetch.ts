import axios from 'axios';
export class Prefetcher{
    queue: any[] = [];
    url: string;
    constructor(url: string){
        this.url = url;
        this.init();
    }
    private async init(){
        for(let i = 0; i < 10; i++){
            await this.get();
        }
    }
    protected async get(){
        try {
        const resp = await axios.get(this.url);
        const data = await resp.data;
        if(data == null) return await this.get();
        const parsed = await this.parse(data);
        if(parsed) this.queue.push(parsed);
        } catch(_){}
    }

    

    public async retrieve(): Promise<any>{
        const value = await this.queue.shift();
        this.get();
        if(value == null){
            await this.get();
            return await this.retrieve();
        }
        return value;
    }

    public parse(siteData: any): any{
        return siteData;
    }
}