alter table live_sessions add column if not exists provider text not null default 'tencent';
alter table live_sessions add column if not exists recording_video_id text;
-- One Polyv channel per lesson/session prevents course access crossing channels.
create unique index if not exists live_polyv_channel_unique on live_sessions(provider_room_id) where provider = 'polyv' and provider_room_id is not null;
