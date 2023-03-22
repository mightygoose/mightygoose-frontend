export type Releases = Release[];

export interface Release {
  id: number;
  sh_key: string;
  sh_type: string;
  badges: string[];
  discogs: Discogs;
  embed: string[];
  images: string[];
  tags: string[];
  title: string;
  url: string;
  tracklist: any | null;
  s_digital: any | null;
  itunes: Itunes;
  deezer?: Deezer;
  created_at: string;
  spotify?: Spotify;
}

export interface Discogs {
  id: number;
  type: string;
  year: string;
  thumb: string;
  country: string;
  similarity: number;
  resource_url: string;
}

export interface Itunes {
  album: string;
  price: number;
  artist: string;
  currency: string;
  similarity: number;
  track_count: number;
  collection_id: number;
}

export interface Deezer {
  id: number;
  album: string;
  artist: string;
  similarity: number;
  deezer_link: string;
  track_count: number;
  tracklist_url: string;
}

export interface Spotify {
  id: string;
  album: string;
  artist: string;
  api_link: string;
  similarity: number;
  track_count: number;
  spotify_link: string;
}

export interface DiscogsInfo {
  id: number;
  status: string;
  year: number;
  resource_url: string;
  uri: string;
  artists: DiscogsArtist[];
  artists_sort: string;
  labels: DiscogsLabel[];
  series: any[];
  companies: DiscogsCompany[];
  formats: DiscogsFormat[];
  data_quality: string;
  community: DiscogsCommunityInfo;
  format_quantity: number;
  date_added: string;
  date_changed: string;
  num_for_sale: number;
  lowest_price: number;
  master_id: number;
  master_url: string;
  title: string;
  country: string;
  released: string;
  notes: string;
  released_formatted: string;
  identifiers: DiscogsIdentifier[];
  videos: DiscogsVideo[];
  genres: string[];
  styles: string[];
  tracklist: DiscogsTracklist[];
  extraartists: any[];
  images: DiscogsImage[];
  thumb: string;
  estimated_weight: number;
  blocked_from_sale: boolean;
}

export interface DiscogsArtist {
  name: string;
  anv: string;
  join: string;
  role: string;
  tracks: string;
  id: number;
  resource_url: string;
  thumbnail_url: string;
}

export interface DiscogsLabel {
  name: string;
  catno: string;
  entity_type: string;
  entity_type_name: string;
  id: number;
  resource_url: string;
  thumbnail_url: string;
}

export interface DiscogsCompany {
  name: string;
  catno: string;
  entity_type: string;
  entity_type_name: string;
  id: number;
  resource_url: string;
  thumbnail_url: string;
}

export interface DiscogsFormat {
  name: string;
  qty: string;
  text: string;
  descriptions: string[];
}

export interface DiscogsCommunityInfo {
  have: number;
  want: number;
  rating: DiscogsRating;
  submitter: DiscogsSubmitter;
  contributors: DiscogsContributor[];
  data_quality: string;
  status: string;
}

export interface DiscogsRating {
  count: number;
  average: number;
}

export interface DiscogsSubmitter {
  username: string;
  resource_url: string;
}

export interface DiscogsContributor {
  username: string;
  resource_url: string;
}

export interface DiscogsIdentifier {
  type: string;
  value: string;
}

export interface DiscogsVideo {
  uri: string;
  title: string;
  description: string;
  duration: number;
  embed: boolean;
}

export interface DiscogsTracklist {
  position: string;
  type_: string;
  title: string;
  duration: string;
}

export interface DiscogsImage {
  type: string;
  uri: string;
  resource_url: string;
  uri150: string;
  width: number;
  height: number;
}

export interface AutocompleteResponse {
  items: AutocompleteItem[];
  tags_count: number;
}

export interface AutocompleteItem {
  id: number;
  title: string;
  image?: string;
}
