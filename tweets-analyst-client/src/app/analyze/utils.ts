import { ChartEntities, ChartEntity } from "./";

/**
 * return time in format 'yyyy:mm:dd:HH:MM:SS' (e.g. 2021:11:11:00:00:00)
 */
 export function timeFormat(d: Date): string {
    const [yyyy, mm, dd, HH, MM, SS] = [d.getFullYear(), twoDigits(d.getMonth() + 1), twoDigits(d.getDate()), twoDigits(d.getHours()), twoDigits(d.getMinutes()), twoDigits(d.getSeconds())];
    const formattedTime = yyyy + ':'.concat(
                                mm + ':'.concat(
                                    dd + ':'.concat(
                                        HH + ':'.concat( 
                                            MM + ':'.concat( 
                                                SS + '')))));

    return formattedTime;
}

export function transformToCharts(data: any[]): ChartEntities {
    const transformed: ChartEntity[] = [];

    for (let t of data) {
        transformed.push(<ChartEntity> {
            time: Object.keys(t)[0],
            value: Object.values(t)[0],
        });
    }

    return <ChartEntities> {
        name: '',
        series: transformed,
    };
}

export function hash(str: string) {
    var i, l,
    hval = 0x811c9dc5;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }

    return ("0000000" + (hval >>> 0).toString(16)).substring(-8);
}

export function roundByMinutes(units: number, aggregation: number, middle: number) {
    return units < aggregation ? (units < middle ? 0 : aggregation) : units - ((units % aggregation) < middle ? (units % aggregation) : -(aggregation - units % aggregation))
}

export function roundBy30Minutes(date: Date) {
    if (date.getMinutes() >= 45) {
        date.setHours(date.getHours() + 1);
        date.setMinutes(0);
    } else if (date.getMinutes() >= 30 && date.getMinutes() < 45) {
        date.setMinutes(30)
    } else if (date.getMinutes() >= 15 && date.getMinutes() < 30) {
        date.setMinutes(30)
    } else {
        date.setMinutes(0);
    }
}

export function twoDigits(time: number) {
    return (time < 10 ? '0' : '') + time;
}