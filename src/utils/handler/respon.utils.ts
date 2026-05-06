import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export const ResponseHandler = {
  success: <T>(data: T, message: string = 'Success', status: number = 200) => {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      } as ApiResponse<T>,
      { status }
    );
  },

  error: (message: string = 'Internal Server Error', error: any = null, status: number = 500) => {
    return NextResponse.json(
      {
        success: false,
        message,
        error: error instanceof Error ? error.message : error,
      } as ApiResponse<null>,
      { status }
    );
  },

  badRequest: (message: string = 'Bad Request', error: any = null) => {
    return ResponseHandler.error(message, error, 400);
  },

  unauthorized: (message: string = 'Unauthorized') => {
    return ResponseHandler.error(message, null, 401);
  },

  notFound: (message: string = 'Not Found') => {
    return ResponseHandler.error(message, null, 404);
  }
};
