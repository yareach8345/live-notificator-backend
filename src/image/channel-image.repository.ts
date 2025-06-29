import { Injectable } from '@nestjs/common'
import { ChannelImageEntity } from './channel-image.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ImageDto } from './dto/image.dto'

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

  async saveChannelImages(channelImages: ImageDto[]) {
    await this.repository.save(channelImages)
  }

  async saveChannelImage(channelImage: ImageDto) {
    await this.repository.save(channelImage)
  }
}