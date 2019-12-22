
export enum AppearanceColor {
    Error = 'warn',
    Success = 'accent',
    Info = 'primary'
}

export interface SnackBarInterface {
    message: string;
    color: AppearanceColor;
}

