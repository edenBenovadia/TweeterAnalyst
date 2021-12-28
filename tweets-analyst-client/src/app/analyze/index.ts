export interface Tweet {
    symbol: string;
    tweetId: string;
    text: string;
    creationDate: string;
    likes: number;
    replies: number;
    retweets: number;
    quotes: number;
    username?: string
}

export interface ChartEntity {
    time: string;
    value: string;
}

export interface ChartEntities {
    name: string;
    series: ChartEntity[];
}

export enum Aggregations {
    Min = 'min',
    FIVEMIN = '5min',
    THIRTYMIN = '30min',
    HOUR = 'H',
    DAY = 'D',
    NONE = '',
}

export enum TimeRange {
    SEVENDAYS = '7D',
    THREEDAYS = '3D',
    ONEDAY = '1D',
    NONE = '',
}