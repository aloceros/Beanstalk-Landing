import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'


const BLOG_POSTS_PATH = './content/posts'

export type PostData = {
  id: string,
  date: string,
  contentHtml?: string,
  [key: string]: any;
}

// credit: https://nextjs.org/learn/basics/data-fetching/implement-getstaticprops
export function getSortedPostsData() : PostData[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(BLOG_POSTS_PATH)
  const allPostsData = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(BLOG_POSTS_PATH, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      date: matterResult.data.date,
      ...matterResult.data
    }
  })
  // Sort posts by date
  return allPostsData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1
    } else if (a > b) {
      return -1
    } else {
      return 0
    }
  })
}


// credit: https://nextjs.org/learn/basics/dynamic-routes/implement-getstaticpaths
export function getAllPostIds() {
  const fileNames = fs.readdirSync(BLOG_POSTS_PATH)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       slug: 'test1'
  //     }
  //   },
  //   {
  //     params: {
  //       slug: 'test2'
  //     }
  //   }
  // ]
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export async function getPostData(id: string) : Promise<PostData> {
  const fullPath = path.join(BLOG_POSTS_PATH, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id
  return {
    id,
    contentHtml,
    date: matterResult.data.date,
    ...matterResult.data
  }
}
