import { Interface } from "ethers";
import { MockStableCoinAddress } from "../desales.config";

export class Time {
    static formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          // timeZoneName: 'short',
        };
        const formattedDate = date.toLocaleDateString('en-US', options);
        // const suffix = this.getOrdinalSuffix(date.getDate());
        return `${formattedDate}`
      }
  
    static getOrdinalSuffix(day) {
      if (day >= 11 && day <= 13) {
        return 'th';
      }
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    }
  
    static getTimeDifference(timestamp) {
      const now = Date.now() / 1000;
      const difference = timestamp - now;
      let days = Math.floor(difference / (24 * 60 * 60)).toString().padStart(2, '0');
      let hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60)).toString().padStart(2, '0');
      let minutes = Math.floor((difference % (60 * 60)) / 60).toString().padStart(2, '0');
      let seconds = Math.floor(difference % 60).toString().padStart(2, '0');
      if (parseInt(days) < 0) days = '00';
      if (parseInt(hours) < 0) hours = '00';
      if (parseInt(minutes) < 0) minutes = '00';
      if (parseInt(seconds) < 0) seconds = '00';
      return { days, hours, minutes, seconds };
    }

    static getTimeDifferenceString(timestamp) {
      const { days, hours, minutes, seconds } = this.getTimeDifference(timestamp);
      return `${days}d ${hours}h ${minutes}m` 
    }

  
    static getTimestampInSeconds(dateTimeString) {
      const date = new Date(dateTimeString);
      return Math.floor(date.getTime() / 1000);
    }

  }
  export function getTxnEventData(txnReceipt, eventName, abi) {
    const contractInterface = new Interface(abi);
    let foundLog;
    console.log(txnReceipt);
    txnReceipt.logs.find(log => {
      foundLog = contractInterface.parseLog(log);
      if (foundLog?.name === eventName) return true;
    });
    console.log(foundLog);
    return foundLog.args;
  }

  export function getTxnEventArg(txnReceipt, eventName, argName, abi) {
    const contractInterface = new Interface(abi);
    let foundLog;
    console.log(txnReceipt);
    txnReceipt.logs.find((log) => {
      foundLog = contractInterface.parseLog(log);
      if (foundLog?.name === eventName) return true;
    });
    console.log(foundLog);
    return foundLog.args[argName];
  }
export function convertIpfsUrl(ipfsUrl) {
  const cid = ipfsUrl.split('ipfs://')[1].split('/')[0];
  const path = ipfsUrl.split(cid + '/')[1];
  return `https://ipfs.io/ipfs/${cid}/${path}`;
}
export const stablecoins = [
  { name: 'USDC', address: MockStableCoinAddress },
  { name: 'USDT', address: MockStableCoinAddress },
  { name: 'DAI', address: MockStableCoinAddress },
  { name: 'MUSDC', address: MockStableCoinAddress },
];


export const GraphURL = 'https://api.studio.thegraph.com/query/53468/auctionwithtime/version/latest';

