import { Module } from "@nestjs/common";
import { ChzzkService } from "./chzzk.service";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ChzzkService],
  exports: [ChzzkService],
})
export class ChzzkModule {}