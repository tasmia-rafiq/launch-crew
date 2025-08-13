import { defineQuery } from "next-sanity";

export const STARTUPS_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) &&
  (
    !defined($search) ||
    title match $search ||
    description match $search ||
    tags match $search ||
    category match $search ||
    author->name match $search
  )
] | order(_createdAt desc) {
  _id,
  title,
  slug,
  _createdAt,
  author -> {
    _id, name, username, image, bio,
  },
  views,
  description,
  category,
  tags,
  picture,
}
`);

export const STARTUP_BY_ID_QUERY =
  defineQuery(`*[_type == "startup" && _id == $id][0] {
  _id,
  title,
  slug,
  _createdAt,
  author -> {
    _id, name, username, image, bio,
  },
  views,
  description,
  problem,
  audience,
  category,
  tags,
  picture,
  pitch,
  "feedbacks": *[_type == "feedback" && post._ref == ^._id] {
    innovation,
    productMarketFit,
    execution,
    problemClarity,
    solutionClarity,
    monetization
  },
  "comments": *[_type == "comment" && post._ref == ^._id],
  aiInsights,
}`);

export const STARTUP_BY_SLUG_QUERY = (userId?: string) =>
  defineQuery(`*[_type == "startup" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  _createdAt,
  author -> {
    _id, name, username, image, bio,
  },
  views,
  description,
  problem,
  audience,
  category,
  tags,
  picture,
  pitch,
  "voteCount": count(*[_type == "vote" && post._ref == ^._id]),
  ${
    userId
      ? `"alreadyVoted": defined(*[_type == "vote" && post._ref == ^._id && user._ref == "${userId}"][0])`
      : ""
  }
}`);

export const STARTUP_VIEWS_QUERY =
  defineQuery(`*[_type == "startup" && _id == $id][0] {
  _id,
  views,
  viewedBy
}`);

export const AUTHOR_BY_GITHUB_ID_QUERY =
  defineQuery(`*[_type == "author" && id == $id][0] {
  _id,
  id,
  name,
  username,
  email,
  image,
  bio, 
}`);

export const AUTHOR_BY_ID_QUERY =
  defineQuery(`*[_type == "author" && _id == $id][0] {
  _id,
  id,
  name,
  username,
  email,
  image,
  bio, 
}`);

export const AUTHOR_BY_USERNAME_QUERY =
  defineQuery(`*[_type == "author" && username == $username][0] {
  _id,
  id,
  name,
  username,
  email,
  image,
  bio, 
}`);

export const STARTUPS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "startup" && author._ref == $id] | order(createdAt desc) {
  _id,
  title,
  slug,
  createdAt,
  author -> {
    _id, name, username, image, bio,
  },
  views,
  description,
  problem,
  audience,
  category,
  tags,
  picture,
  "feedbacks": *[_type == "feedback" && post._ref == ^._id] {
    innovation,
    productMarketFit,
    execution,
    problemClarity,
    solutionClarity,
    monetization
  }
}`);

export const PLAYLIST_BY_SLUG_QUERY =
  defineQuery(`*[_type == "playlist" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  select[]-> {
    _id,
    _createdAt,
    title,
    slug,
    author-> {
      _id, name, username, image, bio,},
    views,
    description,
    category,
    tags,
    picture,
    pitch
  }
}`);

export const ALL_CATEGORIES_QUERY =
  defineQuery(`*[_type == "startup" && defined(category) && category != ""] {
    "category": category
  }
`);

export const STARTUPS_EXPLORE_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) &&
  (
    !defined($search) ||
    title match $search ||
    description match $search ||
    tags match $search ||
    category match $search ||
    author->name match $search
  ) &&
  (
    !defined($category) || category == $category)
] | order(_createdAt desc) {
  _id,
  title,
  slug,
  _createdAt,
  author -> {
    _id, name, username, image, bio,
  },
  views,
  description,
  category,
  tags,
  picture,
}
`);

export const USER_VOTE_ON_STARTUP_QUERY =
  defineQuery(`*[_type == "vote" && post._ref == $postId && user._ref == $userId][0] {
   _id,
  user -> {
    _id,
    name,
    username,
    image
  },
  post -> {
    _id,
    title,
    slug
  },
  createdAt
}`);

// Get vote count on a startup
export const VOTE_COUNT_BY_STARTUP_QUERY = defineQuery(
  `count(*[_type == "vote" && post._ref == $postId])`
);

// Fetch top-level comments and their replies for a startup
export const COMMENTS_BY_STARTUP_QUERY = `
  *[_type == "comment" && post._ref == $postId] | order(createdAt desc) {
    _id,
    content,
    createdAt,
    user->{
      _id,
      name,
      username,
      image
    },
    "parent": parent->_id,
    "likes": likes[]->{
      _id,
      name,
      username,
      image
    }
  }
`;

// Get comment count on a startup
export const COMMENT_COUNT_BY_STARTUP_QUERY = defineQuery(
  `count(*[_type == "comment" && post._ref == $postId])`
);

export const FEEDBACK_STATS_QUERY = defineQuery(`
  *[_type == "feedback" && post._ref == $postId] {
    _id,
    innovation,
    problemClarity,
    solutionClarity,
    productMarketFit,
    execution,
    monetization
  }
`);

export const FEEDBACK_STATS_BY_USERID_QUERY = defineQuery(`
  *[_type == "feedback" && post._ref == $postId && user._ref == $userId][0] {
    _id,
    innovation,
    problemClarity,
    solutionClarity,
    productMarketFit,
    execution,
    monetization
  }
`);

export const FEEDBACKS_FOR_POST_IDS_QUERY = defineQuery(`
  *[_type == "feedback" && post._ref in $postIds] {
    _id,
    "postId": post._ref,
    innovation,
    productMarketFit,
    execution,
    problemClarity,
    solutionClarity,
    monetization
  }
`);