// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // ✅ ADD THIS
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ ADD THIS LINE
    MongooseModule.forRoot('mongodb://localhost:27017/colabx'),
    AuthModule,
  ],
})
export class AppModule {}
