import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ERR_401 } from 'src/shared/constants/message.constants';
import { verifyToken } from 'src/shared/helpers/jwt.helper';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtToken = request.headers['authorization'];
    if (!jwtToken) {
      throw new HttpException(ERR_401, HttpStatus.UNAUTHORIZED);
    }
    try {
      verifyToken(jwtToken);
      return true;
    } catch (err) {
      throw new HttpException(ERR_401, HttpStatus.UNAUTHORIZED);
    }
  }
}
