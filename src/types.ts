export type PostName = string

export type Post = {
  fullSizePicture?: string
  numComments: number
  createdAt: number
  author: string
  thumb?: string
  title: string
  name: PostName
  url: string
}

export type RawPost = {
  data: {
    num_comments: number
    created_utc: number
    thumbnail?: string
    preview?: { images: { source: { url: string } }[] }
    author: string
    title: string
    name: PostName
    url: string
  }
}

export type RawApiResponse = {
  data: {
    children: RawPost[]
    after: PostName
  }
}
