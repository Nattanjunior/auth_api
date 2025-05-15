import { Global, Module } from '@nestjs/common';
import { CaslService } from './casl.service';

@Global()
@Module({
  providers: [CaslService],
  exports: [CaslService],
})
export class CaslModule { }
