import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(data: SignupDto) {
    // ✅ Check for existing username
    const usernameExists = await this.userModel.findOne({ username: data.username });
    if (usernameExists) {
      throw new BadRequestException('Username already taken');
    }

    // ✅ Check for existing email
    const userExists = await this.userModel.findOne({ email: data.email });
    if (userExists) {
      throw new BadRequestException('Email already registered');
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // ✅ Create new user
    const newUser = new this.userModel({
      username: data.username,
      displayName: data.displayName,
      email: data.email,
      password: hashedPassword,
      skills: data.skills || [],
      github: data.github || '',
      bio: data.bio || '',
    });

    // ✅ Save to DB
    await newUser.save();

    return { message: 'User registered successfully' };
  }

  async login(data: LoginDto) {
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordMatch = await bcrypt.compare(data.password, user.password);
    if (!isPasswordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
      },
    };
  }
}
