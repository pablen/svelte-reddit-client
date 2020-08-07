import unescape from 'lodash/unescape'

import type { RawPost, Post, PostName, RawApiResponse } from './types'

export function extractPost(raw: RawPost): Post {
  const notReallyThumbnails = ['self', 'default', 'nsfw', 'image']

  const fullSizePictureUrl =
    raw.data.preview && raw.data.preview.images[0].source.url

  return {
    fullSizePicture: fullSizePictureUrl
      ? unescape(fullSizePictureUrl)
      : undefined,
    numComments: raw.data.num_comments,
    createdAt: raw.data.created_utc,
    author: raw.data.author,
    title: raw.data.title,
    thumb: notReallyThumbnails.includes(raw.data.thumbnail || '')
      ? undefined
      : raw.data.thumbnail,
    name: raw.data.name,
    url: raw.data.url,
  }
}

export async function fetchPosts(
  after?: PostName | null
): Promise<RawApiResponse> {
  return fetch(
    `https://www.reddit.com/top.json${after ? `?after=${after}` : ''}`
  )
    .then((res) => res.json())
    .catch((err) => {
      console.warn('There was a problem fetching posts', err.message)
    })
}
