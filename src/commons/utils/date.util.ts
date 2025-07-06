import { DateTimeDto } from '../types/datetime.type'

export function dateParsing(date: Date): DateTimeDto {
  return {
    date: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDay()
    },
    time: {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    }
  }
}

export function dateToString(date: Date): string {
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const timeString = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  return `${dateString} ${timeString}`
}
