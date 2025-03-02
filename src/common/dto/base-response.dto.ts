import { ApiProperty } from '@nestjs/swagger';

interface BaseResponse<T> {
  statusCode: number;
  status: boolean;
  message: string;
  data: T;
}

export class BaseResponseDto<T> {
  @ApiProperty({
    example: 200,
  })
  public statusCode: number;

  @ApiProperty({
    example: true,
  })
  public status: boolean;

  @ApiProperty({
    example: 'success',
  })
  public message: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiProperty()
  public data: T;

  constructor(data: BaseResponse<T>) {
    this.statusCode = data.statusCode;
    this.status = data.status;
    this.message = data.message;
    this.data = data.data;
  }
}
