import { Injectable } from '@nestjs/common'
import { ChannelImageEntity } from './channel-image.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ChannelImageDto } from './dto/channel-image.dto'

@Injectable()
export class ChannelImageRepository {
  constructor(
    @InjectRepository(ChannelImageEntity)
    private readonly repository: Repository<ChannelImageEntity>
  ) {}

  async getAllChannelImages() {
    const channelImageEntities = await this.repository.find()
    return channelImageEntities.map(channelImageEntity => channelImageEntity.toDto())
  }

  async getChannelImageByChannelId(channelId: string) {
    const result = await this.repository.findOne({
      where: { channelId }
    })
    return result?.toDto()
  }

  async saveChannelImages(channelImages: ChannelImageDto[]) {
    await this.repository.save(channelImages)
  }

  async saveChannelImage(channelImage: ChannelImageDto) {
    await this.repository.save(channelImage)
  }

  async deleteChannelImage(channelId: string) {
    await this.repository.delete(channelId)
  }

  async deleteChannelImages(channelIds: string[]) {
    await this.repository.delete(channelIds)
  }
}