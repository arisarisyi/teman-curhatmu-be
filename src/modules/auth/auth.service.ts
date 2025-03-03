import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtOptionsDto } from './dto/jwt-options.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async registerUser(body: RegisterDto) {
    try {
      const find = await this.findUserByEmail(body.email);

      if (find) throw new BadRequestException('Email already exists');

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(body.password, salt);

      body.password = hash;
      const user = new this.userModel(body);
      return user.save();
    } catch (error) {
      throw error;
    }
  }

  async login(body: LoginDto) {
    try {
      const find = await this.userModel.findOne({ username: body.username });

      if (!find) throw new NotFoundException();
      const isMatch = await bcrypt.compare(body.password, find.password);
      if (!isMatch) {
        throw new BadRequestException('Username / Password is not correct');
      }

      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(find._id),
        this.generateRefreshToken(find._id),
      ]);

      return { accessToken, refreshToken, message: '' };
    } catch (error) {
      throw error;
    }
  }

  // ***---- START Generate Token ---***
  ACCESS_TOKEN = {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresIn: process.env.EXP_REFRESH_TOKEN!,
  };

  REFRESH_TOKEN = {
    secret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.EXP_ACCESS_TOKEN!,
  };

  async jwtConfig(_id: string, jwtOption: JwtOptionsDto) {
    return await this.jwtService.signAsync(
      {
        _id,
      },
      {
        ...jwtOption,
      },
    );
  }

  async generateAccessToken(_id: string) {
    return await this.jwtConfig(_id, this.ACCESS_TOKEN);
  }

  async generateRefreshToken(_id: string) {
    const refreshToken = await this.jwtConfig(_id, this.REFRESH_TOKEN);

    await this.userModel.findByIdAndUpdate(
      _id,
      { refreshToken },
      { new: true },
    );

    return refreshToken;
  }

  // ***---- END Generate Token ---***

  async getSelf(_id: string) {
    return await this.userModel.findById(_id).select('username');
  }
}
