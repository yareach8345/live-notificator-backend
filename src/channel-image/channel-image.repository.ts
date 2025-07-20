import { Injectable } from '@nestjs/common'
import { ChannelImageEntity } from './channel-image.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ChannelImageDto } from './dto/channel-image.dto'
import { ChannelId } from '../commons/types/channel-id.type'
import { channelIdToKey } from 'src/commons/utils/database.util'

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

  async getChannelImageByChannelId(channelId: ChannelId) {
    const result = await this.repository.findOne({
      where: channelIdToKey(channelId)
    })
    return result?.toDto()
  }

  async saveChannelImages(channelImages: ChannelImageDto[]) {
    const preparedChannelImageDto = channelImages.map(({channelId, imageUrl}) =>({
      ...channelIdToKey(channelId),
      imageUrl,
    }))
    await this.repository.save(preparedChannelImageDto)
  }

  async saveChannelImage(channelImage: ChannelImageDto) {
    const { channelId, imageUrl } = channelImage
    await this.repository.save({
      ...channelIdToKey(channelId),
      imageUrl
    })
  }

  async deleteChannelImage(channelId: ChannelId) {
    await this.repository.delete(channelIdToKey(channelId))
  }

  async deleteChannelImages(channelIds: ChannelId[]) {
    await this.repository.delete(channelIds.map(channelIdToKey))
  }
}