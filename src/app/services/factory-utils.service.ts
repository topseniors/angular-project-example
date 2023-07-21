import { Injectable } from '@angular/core';

@Injectable()
export class FactoryUtilsService {
  private randomNames: string[] = ['randy', 'foo', 'opscope', 'chaos', 'bar', 'fuzz', 'buzz', 'rick', 'morty'];

  constructor() { }

  getRandomInt: (min?:number, max?:number)=>number = (min:number=0, max:number=10) => Math.max(min,min+Math.round((max-min)*Math.random()))

  getRandomBool: ()=>number = this.getRandomInt.bind(null,0,1)

  private getRandomSingleName: ()=>string = () => this.randomNames[Math.floor(Math.random()*this.randomNames.length)]

  getRandomName: (n?:number)=>string = (n:number=1) => {
    let fullName = this.getRandomSingleName();
    for (let i=1; i<n; i++) { fullName+= '.'+this.getRandomSingleName(); }
    return fullName;
  }

  private getRandomIpPart: ()=>string = () => Math.floor(255*Math.random())+''

  getRandomIp: ()=>string = () => {
    let ip:string = this.getRandomIpPart();
    for (let i=1; i<4; i++) { ip+= '.'+this.getRandomIpPart(); }
    return ip;
  }

  maybe:(any)=>(any) = (input:any) => this.getRandomBool()?input:null
}
