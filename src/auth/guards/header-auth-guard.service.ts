import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { DeviceService } from "src/device/device.service";

@Injectable()
export class HeaderAuthGuard implements CanActivate {
  constructor(private readonly deviceService: DeviceService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();

      const deviceId = request.headers['auth-device-id']
      const secretKey = request.headers['auth-secret-key']

      if (deviceId === undefined || secretKey === undefined) {
        throw new UnauthorizedException('auth-device-id와 auth-secret-key 헤더를 포함해야 합니다.');
      }

      return this.deviceService.checkAuth({ deviceId, secretKey })
    }
}