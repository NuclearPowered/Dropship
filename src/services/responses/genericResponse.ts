export interface GenericResponse {
  success: boolean;
  message: string;
}

export interface GenericResponseWithData<T> extends GenericResponse {
  data: T;
}
