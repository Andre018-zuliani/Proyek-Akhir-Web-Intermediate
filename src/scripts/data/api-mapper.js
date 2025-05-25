// src/scripts/data/api-mapper.js
import Map from '../utils/map';

export async function storyMapper(story) {
  let placeName = null;
  let latitude = story.lat;
  let longitude = story.lon;

  // Memeriksa apakah lat dan lon adalah angka yang valid sebelum memproses lokasi
  if (typeof story.lat === 'number' && typeof story.lon === 'number') {
    try {
      placeName = await Map.getPlaceNameByCoordinate(story.lat, story.lon);
    } catch (error) {
      console.error('Error getting place name for story:', story.id, error);
      // Jika terjadi error saat mengambil nama lokasi, gunakan koordinat sebagai fallback
      placeName = `(${story.lat}, ${story.lon})`;
    }
  } else {
    // Jika lat atau lon tidak valid (null/undefined), set placeName dan koordinat menjadi null
    placeName = 'Lokasi tidak tersedia';
    latitude = null;
    longitude = null;
  }

  const location = {
    latitude: latitude,
    longitude: longitude,
    placeName: placeName,
  };

  return {
    id: story.id,
    name: story.name, // Nama pembuat story
    description: story.description,
    photoUrl: story.photoUrl,
    createdAt: story.createdAt,
    location: location,
  };
}
