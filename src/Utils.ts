export class Utils {
  static getPlural(number: number, text: string, plural: string): string {
    return number === 1 ? text : plural;
  }
}
