import { PlatformBaseService } from '../commons/base/platform-base.service'
import { ChzzkChannelDetailDto } from './dto/chzzk-channel-detail.dto'

export class ChzzkService extends PlatformBaseService<ChzzkChannelDetailDto> {
    protected loadChannelDetail(channelId: string): Promise<ChzzkChannelDetailDto> {
        throw new Error('Method not implemented.')
    }
}
