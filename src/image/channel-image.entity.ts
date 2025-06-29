import { Column, Entity, PrimaryColumn } from 'typeorm'
import { ImageDto } from './dto/image.dto'

@Entity('channel_images')
export class ChannelImageEntity {
  @PrimaryColumn({ name: 'channel_id' })
  channelId: string

  @Column({ name: 'image_url' })
  imageUrl: string

  toDto(): ImageDto {
    return {
      channelId: this.channelId,
      imageUrl: this.imageUrl,
    }
  }
}