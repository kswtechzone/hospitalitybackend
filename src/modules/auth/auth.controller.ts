import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Get('loyalty')
  async getLoyalty(@Query('email') email: string) {
    return this.authService.getLoyaltyPoints(email);
  }
}
