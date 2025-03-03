import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { CustomBaseResponseInterceptor } from 'src/common/interceptors/base-response.interceptor';
import { Response } from 'express';
import { AccessTokenGuard } from 'src/common/guards';

@Controller('auth')
@UseInterceptors(CustomBaseResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get All Promotion' })
  @Post('register')
  async createUser(@Body() registerBody: RegisterDto) {
    const result = await this.authService.registerUser(registerBody);
    return { result };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get All Promotion' })
  @Post('login')
  async login(
    @Body() loginBody: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, message } =
      await this.authService.login(loginBody);
    response.cookie('access_token', accessToken);
    response.cookie('refresh_token', refreshToken);

    return { status: true, message: message ?? 'Success', statusCode: 200 };
  }

  @Get('self')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: ' Get self' })
  async getTopic(@Req() req) {
    const { _id } = req.user.payload;

    const result = await this.authService.getSelf(_id);
    return { result };
  }
}
