import ContentWrapper from '../../components/ContentWrapper'
import CustomHead from '../../components/CustomHead'
import path from 'path'
import { getAllPostIds, getPostData, PostData } from '../../lib/posts'
import type { GetStaticPathsResult, GetStaticPropsResult, NextPage } from 'next';
import { NextSeo } from 'next-seo';
import BlogLayout from "../../components/BlogLayout";


type PostProps = {
  // Metadata
  id: string;
  title: string;
  subtitle: string | null;
  author: string;
  date: string;
  image: string | null;
  description: string;
  // Content
  content: string;
}

export async function getStaticProps({ params } : PostData) : Promise<GetStaticPropsResult<PostProps>> {
  const postData = await getPostData(params.id)
  if(!postData) return { notFound: true }
  
  if(!postData.title || !postData.date || !postData.contentHtml) {
    return { notFound: true };
  }

  console.log(`getStaticProps: blog/${params.id}`)
  console.table([
    { name: 'title', length: postData.title.length, valid: postData.title.length <= 55 },
    { name: 'description', length: postData.description.length, valid: postData.description.length <= 160 }
  ]);

  // Note: all CMS fields that are optional must
  // have `|| null` applied below because `undefined` is
  // not JSON-serializable.
  return {
    props: {
      // Metadata
      id: params.id,
      title: postData.title,
      subtitle: postData.subtitle || null,
      author: postData.author,
      date: postData.date,
      image: postData.image || null,
      description: postData.description,
      // Content
      content: postData.contentHtml,
    },
  }
}

export async function getStaticPaths() : Promise<GetStaticPathsResult> {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: true
  }
}

const DESCRIPTION_LENGTH = 50

const Post: NextPage<PostProps> = (props) => {
  const {
    id,
    title,
    subtitle,
    author,
    date,
    content,
    image,
    description
  } = props;

  const siteUrl = process.env.SITE_URL || "https://bean.money"

  return (
    <>
      {/*<CustomHead*/}
      {/*  title={`${title} | Beanstalk`}*/}
      {/*  description={description || undefined}*/}
      {/*  image={image || undefined}*/}
      {/*/>*/}
      <NextSeo
        title={`${title} | Beanstalk`}
        description={description || undefined}
        openGraph={{
          url: `https://bean.money/${id}`,
          title: `${title} | Beanstalk`,
          description: description || undefined,
          type: "article",
          images: [
            {
              url: (image != null) ? siteUrl + image : siteUrl + "/assets/uploads/barn-and-beans.png",
              width: 1200,
              height: 628,
              // alt: imageAlt,
              type: 'image/jpeg',
            }
          ],
          site_name: 'Beanstalk',
        }}
        twitter={{
          handle: '@beanstalkfarms',
          cardType: 'summary_large_image',
        }}
      />
      <ContentWrapper variant="default">
        <div className="space-y-8">
          <div className="space-y-8 border-b border-gray-100 pb-8">
            <p className="text-sm text-slate-400">{author} &middot; {date}</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
              {subtitle ? <h2 className="text-xl text-slate-500 font-light">{subtitle}</h2> : null}
            </div>
          </div>
          <div
            className={`text-md prose`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </ContentWrapper>
    </>
  )
}

export default Post;



