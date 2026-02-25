create table channels(
	platform varchar(255),
	channel_id varchar(255),
	display_name varchar(255) not null,
	priority integer,
	color varchar(10),
	
	primary key (platform, channel_id)
);

create table channel_images(
	platform varchar(255),
	channel_id varchar(255),
	image_url varchar(512),
	primary key (platform, channel_id),
	foreign key (platform, channel_id) references channels(platform, channel_id) on delete cascade
);

create table devices(
	device_id varchar(255) primary key,
	device_name varchar(255) not null,
	secret_key varchar(255) not null,
	description text,
	usable bool
);
