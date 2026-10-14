alter table banners add column if not exists position varchar(64) not null default 'home-primary';
alter table banners add column if not exists sort_order integer not null default 0;
alter table banners add column if not exists requires_login boolean not null default false;
