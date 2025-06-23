import { Injectable } from '@nestjs/common';
import { ChannelEntity } from './channel.entity'
import { DataSource, Repository } from 'typeorm'

@Injectable()
export class ChannelRepository extends Repository<ChannelEntity> {
  constructor(dataSource: DataSource) {
    super(ChannelEntity, dataSource.createEntityManager())
  }
}