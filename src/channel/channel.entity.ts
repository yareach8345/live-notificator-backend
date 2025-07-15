import { Column, Entity, PrimaryColumn } from 'typeorm'
import { ChannelDto } from './dto/channel.dto'

@Entity('channels')
export class ChannelEntity {
  @PrimaryColumn({ name: 'channel_id' })
  channelId: string

  @Column({ name: 'display_name' })
  displayName: string

  @Column({ nullable: true })
  priority?: number

  @Column({ nullable: true })
  color?: string

  @Column()
  platform: string

  toDto(): ChannelDto {
    return {
      channelId: this.channelId,
      platform: this.platform,
      displayName: this.displayName,
      priority: this.priority,
      color: this.color,
    }
  }
}