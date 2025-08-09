import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator'; // ✅ custom decorator
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers(
    @Query('search') search: string,
    @Query('skill') skill: string,
  ) {
    return this.usersService.searchUsers(search, skill);
  }

  // ✅ More specific routes first
  @Get('me/friends')
  async getMyFriends(@GetUser() user: any) {
    const userId = user.sub;
    return this.usersService.getFriends(userId);
  }

  @Get(':userId/friends')
  getFriends(@Param('userId') userId: string) {
    return this.usersService.getFriends(userId);
  }

  @Post(':id/add-friend')
  async addFriend(@Param('id') friendId: string, @GetUser() user: any) {
    const userId = user.sub;
    return this.usersService.addFriend(userId, friendId);
  }

  // ✅ Put generic route last
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
