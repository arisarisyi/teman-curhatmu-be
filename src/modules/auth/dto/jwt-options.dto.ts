import { IsNotEmpty, IsString } from 'class-validator';

export class JwtOptionsDto {
  @IsString()
  @IsNotEmpty()
  public secret: string;

  @IsString()
  @IsNotEmpty()
  public expiresIn: string;
}
