import AdminBadge from '@assets/Admin_1762465710428.png';
import AfrobeatsBadge from '@assets/AfroBeats_1762465710428.png';
import ArtistBadge from '@assets/Artist_1762465710429.png';
import AudioBadge from '@assets/Audio_1762465710429.png';
import BluesBadge from '@assets/Blues_1762465691486.png';
import ClassicalBadge from '@assets/Claasical_1762465691487.png';
import ConsultantBadge from '@assets/Consultant_1762465691487.png';
import CountryBadge from '@assets/Country_1762466727810.png';
import DancerBadge from '@assets/Dancer_1768850130733.png';
import DJBadge from '@assets/DJ_1762465691487.png';
import EDMBadge from '@assets/EDM_1762465691488.png';
import EducatorBadge from '@assets/Educator_1762465691488.png';
import ExecutiveBadge from '@assets/Executive_1768850171001.png';
import FashionBadge from '@assets/Fashion_1762465691488.png';
import GlamBadge from '@assets/Glam_1762465691488.png';
import GospelBadge from '@assets/Gospel_1762465691488.png';
import HipHopBadge from '@assets/HipHop_1762466673009.png';
import HouseBadge from '@assets/House_1762466673009.png';
import JazzBadge from '@assets/Jazz_1762466673009.png';
import LabelBadge from '@assets/Label_1762466673010.png';
import LatinBadge from '@assets/Latin_1762466682803.png';
import LegalBadge from '@assets/Legal_1762466682803.png';
import ManagementBadge from '@assets/Managemnt_1762466682803.png';
import MarketingBadge from '@assets/Marketing_1762466682803.png';
import MusicianBadge from '@assets/Musician_1762465734564.png';
import PhotoBadge from '@assets/Photo_1762465734565.png';
import PopBadge from '@assets/Pop_1762465734566.png';
import ProducerBadge from '@assets/Producer_1762465734566.png';
import PublishingBadge from '@assets/Publishing_1762465734566.png';
import RadioBadge from '@assets/Radio_1762465734567.png';
import RBBadge from '@assets/RB_1762465734567.png';
import ReggaeBadge from '@assets/Reggae_1762465734567.png';
import RockBadge from '@assets/Rock_1762465734567.png';
import SongwriterBadge from '@assets/Songwriter_1762465734567.png';
import StudioBadge from '@assets/Studio_1762465734567.png';
import SynchBadge from '@assets/Synch_1762465734567.png';
import TouringBadge from '@assets/Touring_1762465734567.png';
import VenueBadge from '@assets/Venue_1762465734568.png';

interface BadgeMap {
  [key: string]: string;
}

const genreBadges: BadgeMap = {
  'afrobeats': AfrobeatsBadge,
  'afro beats': AfrobeatsBadge,
  'afro-beats': AfrobeatsBadge,
  'blues': BluesBadge,
  'classical': ClassicalBadge,
  'pop': PopBadge,
  'r&b': RBBadge,
  'rb': RBBadge,
  'rnb': RBBadge,
  'r&b / soul': RBBadge,
  'r&b/soul': RBBadge,
  'soul': RBBadge,
  'reggae': ReggaeBadge,
  'reggae / dancehall': ReggaeBadge,
  'reggae/dancehall': ReggaeBadge,
  'dancehall': ReggaeBadge,
  'rock': RockBadge,
  'hip-hop': HipHopBadge,
  'hip hop': HipHopBadge,
  'hiphop': HipHopBadge,
  'hip-hop / rap': HipHopBadge,
  'hip-hop/rap': HipHopBadge,
  'rap': HipHopBadge,
  'electronic': EDMBadge,
  'electronic / edm / techno': EDMBadge,
  'electronic/edm/techno': EDMBadge,
  'edm': EDMBadge,
  'techno': EDMBadge,
  'house': HouseBadge,
  'country': CountryBadge,
  'country / folk / americana': CountryBadge,
  'country/folk/americana': CountryBadge,
  'folk': CountryBadge,
  'americana': CountryBadge,
  'jazz': JazzBadge,
  'gospel': GospelBadge,
  'gospel / christian / inspirational': GospelBadge,
  'christian': GospelBadge,
  'inspirational': GospelBadge,
  'latin': LatinBadge,
  'latin (reggaetón, bachata, salsa)': LatinBadge,
  'reggaeton': LatinBadge,
  'bachata': LatinBadge,
  'salsa': LatinBadge,
  'dance': HouseBadge,
  'dance / house': HouseBadge,
  'afro-fusion': AfrobeatsBadge,
  'afrobeats / afro-fusion': AfrobeatsBadge,
  'classical / opera': ClassicalBadge,
  'opera': ClassicalBadge,
};

const professionBadges: BadgeMap = {
  'admin': AdminBadge,
  'administration': AdminBadge,
  'artist': ArtistBadge,
  'audio': AudioBadge,
  'audio engineer': AudioBadge,
  'engineer': AudioBadge,
  'consultant': ConsultantBadge,
  'dancer': DancerBadge,
  'dj': DJBadge,
  'educator': EducatorBadge,
  'teacher': EducatorBadge,
  'executive': ExecutiveBadge,
  'music executive': ExecutiveBadge,
  'a&r': ExecutiveBadge,
  'label rep': ExecutiveBadge,
  'fashion': FashionBadge,
  'stylist': FashionBadge,
  'glam': GlamBadge,
  'makeup': GlamBadge,
  'label': LabelBadge,
  'record label': LabelBadge,
  'legal': LegalBadge,
  'lawyer': LegalBadge,
  'attorney': LegalBadge,
  'management': ManagementBadge,
  'manager': ManagementBadge,
  'artist manager': ManagementBadge,
  'business manager': ManagementBadge,
  'tour manager': ManagementBadge,
  'marketing': MarketingBadge,
  'marketer': MarketingBadge,
  'musician': MusicianBadge,
  'photo': PhotoBadge,
  'photo/video': PhotoBadge,
  'photographer': PhotoBadge,
  'videographer': PhotoBadge,
  'producer': ProducerBadge,
  'music producer': ProducerBadge,
  'beat maker': ProducerBadge,
  'executive producer': ProducerBadge,
  'publishing': PublishingBadge,
  'publisher': PublishingBadge,
  'radio': RadioBadge,
  'radio/podcast': RadioBadge,
  'podcast': RadioBadge,
  'podcaster': RadioBadge,
  'songwriter': SongwriterBadge,
  'writer': SongwriterBadge,
  'studio': StudioBadge,
  'studio owner': StudioBadge,
  'recording studio': StudioBadge,
  'synch': SynchBadge,
  'sync': SynchBadge,
  'licensing': SynchBadge,
  'touring': TouringBadge,
  'tour': TouringBadge,
  'venue': VenueBadge,
  'venue owner': VenueBadge,
  'photographer/videographer': PhotoBadge,
};

function normalizeKey(value: string): string {
  return value.toLowerCase().trim();
}

export function getGenreBadge(genre: string | null | undefined): string | null {
  if (!genre) return null;
  const normalized = normalizeKey(genre);
  return genreBadges[normalized] || null;
}

export function getProfessionBadge(profession: string | null | undefined): string | null {
  if (!profession) return null;
  const normalized = normalizeKey(profession);
  return professionBadges[normalized] || null;
}

export function getBadge(value: string | null | undefined, type: 'genre' | 'profession'): string | null {
  if (type === 'genre') {
    return getGenreBadge(value);
  }
  return getProfessionBadge(value);
}

export function hasGenreBadge(genre: string | null | undefined): boolean {
  return getGenreBadge(genre) !== null;
}

export function hasProfessionBadge(profession: string | null | undefined): boolean {
  return getProfessionBadge(profession) !== null;
}
