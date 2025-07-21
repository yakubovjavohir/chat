import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export function formatDate(){
      dayjs.extend(utc);
      dayjs.extend(timezone);

      return dayjs().tz("Asia/Tashkent").format();
}