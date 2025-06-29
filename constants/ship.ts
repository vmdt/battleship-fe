export const SHIPBOARDING_SIZE = 10;

export enum Direction {
    Horizontal = 'horizontal',
    Vertical = 'vertical'
}

export enum SquareStatus {
    Empty = 'empty',
    Ship = 'ship',
    Hit = 'hit',
    Miss = 'miss',
    Preview = 'preview',
    PreviewInvalid = 'preview-invalid',
    HitAll = 'hit-all'
}