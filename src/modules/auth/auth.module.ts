import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedModule } from 'src/common/shared.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SharedModule,
    JwtModule.register({ signOptions: { algorithm: 'HS256' } }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
