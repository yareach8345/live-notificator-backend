import { Column, Entity, PrimaryColumn } from 'typeorm'
import { ChannelImageDto } from './dto/channel-image.dto'

@Entity('channel_images')
export class ChannelImageEntity {
  @PrimaryColumn({ name: 'platform' })
  platform: string

  @PrimaryColumn({ name: 'channel_id' })
  channelId: string

  @Column({ name: 'image_url' })
  imageUrl: string

  toDto(): ChannelImageDto {
    return {
      channelId: {
        platform: this.platform,
        id: this.channelId,
      },
      imageUrl: this.imageUrl
    }
  }
}