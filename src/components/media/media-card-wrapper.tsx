import { getAllTmdbData } from '@/lib/tmdb'
import MediaCard from './media-card'

export default async function MediaCardWrapper() {
  const data = await getAllTmdbData()
  return <MediaCard data={data} />
}
