export function firstCharToUpperCase(string: String): string {
  let str = `${string}`;
  return str[0].toUpperCase() + str.slice(1);
}
export function numberTh(num: number): string {
  const lastNum = num % 10;
  let th: string = null;
  switch (lastNum) {
    case 1:
      th = "st";
      break;
    case 2:
      th = "nd";
      break;
    case 3:
      th = "rd";
    default:
      th = "th";
  }
  return `${num}${th}`;
}
export function timestampToTimespan(timestamp: string): number {
  if (!timestamp.match(/^(\d{1,2}:?)+$/)) return null;
  const times = timestamp.split(":").reverse();
  let timespan = 0;
  if (times[0]) timespan += parseInt(times[0]) * 1000;
  if (times[1]) timespan += parseInt(times[1]) * 60 * 1000;
  if (times[2]) timespan += parseInt(times[2]) * 60 * 60 * 1000;
  if (times[3]) timespan += parseInt(times[3]);
  return timespan;
}
export function randomInteger(min = 0, max = 1): number {
  return Math.floor(Math.random() * (max - min) + 1) + min;
}
export function celsToFahr(a: number): number {
  return Math.round(((a * 9) / 5 + 32) * 100) / 100;
}
export function fahrToCels(a: number): number {
  return Math.round((((a - 32) * 5) / 9) * 100) / 100;
}
export function numberComma(number: number): string {
  if (`${number}`.includes(".")) {
    let string = `${number}`.split(".");
    string[1] = string[1].replace(/(?<=\d)(?=(\d{3})+(?!\d))/gi, ",");
    return `${string[1]}.${string[2]}`;
  } else {
    let string = `${number}`;
    string = string.replace(/(?<=\d)(?=(\d{3})+(?!\d))/gi, ",");
    return string;
  }
}
export function numberEmoji(number: number): string {
  let num = number.toString();
  num = num.replace(/10/gi, "keycap_ten");
  num = num.replace(/0/gi, "zero");
  num = num.replace(/1/gi, "one");
  num = num.replace(/2/gi, "two");
  num = num.replace(/3/gi, "three");
  num = num.replace(/4/gi, "four");
  num = num.replace(/5/gi, "five");
  num = num.replace(/6/gi, "six");
  num = num.replace(/7/gi, "seven");
  num = num.replace(/8/gi, "eight");
  num = num.replace(/9/gi, "nine");
  return num;
}
export function timeConverter(UNIX_timestamp: number): string {
  try {
    let a = new Date(UNIX_timestamp);
    let months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = "" + a.getHours();
    let min = "" + a.getMinutes();
    let sec = "" + a.getSeconds();
    if (sec.length == 1) sec = `0${sec}`;
    if (min.length == 1) min = `0${min}`;
    if (hour.length == 1) hour = `0${hour}`;
    let time =
      date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
    return time;
  } catch (err) {
    console.error(err);
  }
}
export function toMs(timespan: string): number {
  let string = timespan;
  try {
    if (string == null) return null;
    if (
      !string.match(
        /^(\d+(centur(y|ies)|c|years?|y|months?|mo|weeks?|w|days?|d|hours?|h|mins?|minutes?|m|secs?|seconds?|s|milliseconds?|ms))+$/i
      )
    ) {
      return null;
    }
    const array = string.match(/\d+[a-z]+/gi);
    const le = array.length;
    let darr = [];
    let carr = [];
    for (let x = 0; x < le; x++) {
      darr.push(parseInt(array[x]));
      let l = array[x].replace(/\d+/gi, "");
      l = l.replace(/(centur(y|ies)|c)/gi, "3155760000000");
      l = l.replace(/(years?|y)/gi, "31558150000");
      l = l.replace(/(months?|mo)/gi, "2629800000");
      l = l.replace(/(weeks?|w)/gi, "604800000");
      l = l.replace(/(days?|d)/gi, "86400000");
      l = l.replace(/(hours?|h)/gi, "3600000");
      l = l.replace(/(milliseconds?|ms)/gi, "1");
      l = l.replace(/(minutes?|mins?|m)/gi, "60000");
      l = l.replace(/(seconds?|secs?|s)/gi, "1000");
      carr.push(parseInt(l));
    }
    let numb = 0;
    for (let z = 0; z < le; z++) {
      numb += darr[z] * carr[z];
    }
    return numb;
  } catch (e) {
    console.error(e);
  }
}
export function toTimespan(number: number, ms?: boolean): string {
  try {
    let n: any = {};
    n.centuries = Math.floor(number / 3155760000000);
    number -= n.centuries * 3155760000000;
    n.years = Math.floor(number / 31558150000);
    number -= n.years * 31558150000;
    n.months = Math.floor(number / 2629800000);
    number -= n.months * 2629800000;
    n.weeks = Math.floor(number / 604800000);
    number -= n.weeks * 604800000;
    n.days = Math.floor(number / 86400000);
    number -= n.days * 86400000;
    n.hours = Math.floor(number / 3600000);
    number -= n.hours * 3600000;
    n.minutes = Math.floor(number / 60000);
    number -= n.minutes * 60000;

    if (ms) {
      n.seconds = Math.floor(number / 1000);
      number -= n.seconds * 1000;
      n.milliseconds = number;
      number = 0;
    } else {
      n.seconds = Math.floor(number / 100) / 10;
      number = 0;
    }
    let newidk = (text: string, numb: number) => {
      if (numb == 1) {
        let ne = text.substr(0, text.length - 1);
        if (text === "centuries") ne = "century";
        return `${numb} ${ne}`;
      } else if (numb > 0) {
        return `${numb} ${text}`;
      }
    };
    let resp = [];
    for (let key in n) {
      console.log(key);
      if (newidk(key, n[key])) {
        resp.push(newidk(key, n[key]));
      }
    }
    return resp.join(", ");
  } catch (error) {
    console.error(error);
  }
}
export function filterOutliers(values: number[]): number[] {
  if (values.length < 4) return values;
  values = values.sort();
  let q1: number, q3: number;
  const len = values.length;
  if ((len / 4) % 1 === 0) {
    q1 = (values[len / 4] + values[len / 4 + 1]) / 2;
    q3 = (values[(len * 3) / 4] + values[(len * 3) / 4 + 1]) / 2;
  } else {
    q1 = values[Math.floor(len / 4 + 1)];
    q3 = values[Math.ceil((len * 3) / 4 + 1)];
  }

  const iqr = q3 - q1;
  const maxValue = q3 + iqr * 1.5;
  const minValue = q1 - iqr * 1.5;

  return values.filter((x) => x >= minValue && x <= maxValue);
}

export function objDifference(
  obj1: object,
  obj2: object,
  keepOld = false,
  arrayIndexesDontMatter = false
): any {
  const bothArrays = Array.isArray(obj1) && Array.isArray(obj2);
  const r = bothArrays ? [] : {};
  if (keepOld) {
    const copy = Object.create(obj1);
    obj1 = obj2;
    obj2 = copy;
  }
  for (const prop in obj2) {
    if (obj2[prop] != null && prop != "__proto__") {
      if (obj1[prop] == null) {
        if (bothArrays) (r as any[]).push(obj2[prop]);
        else r[prop] = obj2[prop];
      } else if (obj2[prop] === Object(obj2[prop])) {
        const difference = objDifference(obj1[prop], obj2[prop], keepOld);
        if (Object.keys(difference).length > 0) r[prop] = difference;
      } else if (obj2[prop] !== obj1[prop]) {
        if (obj2[prop] === undefined) {
          r[prop] = "undefined";
        }
        if (obj2[prop] === null) {
          r[prop] = null;
        } else if (typeof obj2[prop] === "function") {
          r[prop] = "function";
        } else if (typeof obj2[prop] === "object") {
          r[prop] = "object";
        } else {
          if (bothArrays) {
            if ((obj1 as any[]).indexOf(obj2[prop]) === -1) {
              (r as any[]).push(obj2[prop]);
              continue;
            } else if (arrayIndexesDontMatter) continue;
          }
          r[prop] = obj2[prop];
        }
      }
    }
  }
  return r;
}
