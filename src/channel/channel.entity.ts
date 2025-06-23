import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('channels')
export class ChannelEntity {
  @PrimaryColumn({ name: 'channel_id' })
  channelId: string

  @Column({ name: 'display_name' })
  displayName: string

  @Column({ nullable: true, default: 255 })
  priority: number

  @Column({ nullable: true, default: '#FFFFFF' })
  color: string
}