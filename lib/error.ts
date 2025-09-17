export class AppError extends Error {
  public code = "App Error";
  public details: string[];

  constructor(message: string, details?: string[], e?: Error) {
    super(message); // 親クラスのコンストラクタを呼び出し
    this.details = details || [];
    if (e) {
      // エラーが渡された場合はスタックトレースを追加する
      this.stack += `\nCaused by: ${e.stack}`;
    }
    this.name = this.constructor.name; // エラー名をクラス名に設定
    Object.setPrototypeOf(this, AppError.prototype); // プロトタイプチェーンを正しく設定
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  public code = "Validation Error";
}

export const mergeValidationError = (es: ValidationError[]): ValidationError =>
  new ValidationError(
    "multiple types are invalid",
    es.reduce<string[]>((acc, e) => acc.concat(e.details), []), // 複数のエラーの details を連結 してつめる
    // stack にエラーは入れない. ( NOTE: うまく結合する方法があれば入れたい)
  );

/**
 * データベース関連の致命的なエラー
 */
export class DatabaseError extends AppError {
  public code = "Database Error";
}

/**
 * DB からデータが見つからなかった時のエラー
 */
export class NotFoundDataError extends AppError {
  public code = "Not Found Data Error";
}

/**
 * まだ実装中の時に一時的に使うエラー
 */
export class NotImplementedYetError extends AppError {
  public code = "NOT IMPLEMENTED YET";
}
