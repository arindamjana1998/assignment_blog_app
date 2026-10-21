import Post from '../models/post.model.js';
import { generateUniqueSlug } from '../utils/slugger.js';
import { ApiError } from '../utils/apiError.js';
import { MESSAGES } from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';

export class PostService {
  /**
   * Create a new post with a generated unique slug
   *
   * @param {object} input - { title, content, authorId }
   * @returns {Promise<Post>}
   */
  static async createPost({ title, content, authorId }) {
    const slug = await generateUniqueSlug(Post, title);

    const post = await Post.create({
      title: title.trim(),
      slug,
      content: content.trim(),
      author: authorId,
      isDeleted: false,
    });

    return await post.populate('author', 'name email avatar');
  }

  /**
   * Get public paginated posts (excluding soft-deleted)
   *
   * @param {object} queryParams - { page, limit, search, author, sort, order }
   * @returns {Promise<{ posts: Post[], pagination: object }>}
   */
  static async getPosts({ page = 1, limit = 10, search, author, sort = 'createdAt', order = 'desc' }) {
    const filter = { isDeleted: false };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (author) {
      filter.author = author;
    }

    const sortOptions = {
      [sort]: order === 'asc' ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [totalItems, posts] = await Promise.all([
      Post.countDocuments(filter),
      Post.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      posts,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get a single published post by its ID
   *
   * @param {string} postId
   * @param {object|null} requestingUser
   * @returns {Promise<Post>}
   */
  static async getPostById(postId, requestingUser = null) {
    const filter = { _id: postId };

    // Unless admin, only non-deleted posts can be retrieved
    if (!requestingUser || requestingUser.role !== ROLES.ADMIN) {
      filter.isDeleted = false;
    }

    const post = await Post.findOne(filter).populate('author', 'name email avatar');

    if (!post) {
      throw ApiError.notFound(MESSAGES.POST_NOT_FOUND);
    }

    return post;
  }

  /**
   * Get a single published post by unique slug
   *
   * @param {string} slug
   * @returns {Promise<Post>}
   */
  static async getPostBySlug(slug) {
    const post = await Post.findOne({ slug, isDeleted: false }).populate('author', 'name email avatar');

    if (!post) {
      throw ApiError.notFound(MESSAGES.POST_NOT_FOUND);
    }

    return post;
  }

  /**
   * Update an existing post (restricted to author or admin)
   *
   * @param {string} postId
   * @param {object} updateData - { title, content }
   * @param {object} user - Authenticated user
   * @returns {Promise<Post>}
   */
  static async updatePost(postId, updateData, user) {
    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      throw ApiError.notFound(MESSAGES.POST_NOT_FOUND);
    }

    // Authorization: owner or admin
    const isOwner = post.author.toString() === user._id.toString();
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden(MESSAGES.FORBIDDEN);
    }

    // Regenerate slug if title is modified
    if (updateData.title && updateData.title.trim() !== post.title) {
      post.slug = await generateUniqueSlug(Post, updateData.title, post._id);
      post.title = updateData.title.trim();
    }

    if (updateData.content) {
      post.content = updateData.content.trim();
    }

    await post.save();
    return await post.populate('author', 'name email avatar');
  }

  /**
   * Soft-delete a post (restricted to author or admin)
   *
   * @param {string} postId
   * @param {object} user - Authenticated user
   * @returns {Promise<Post>}
   */
  static async deletePost(postId, user) {
    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      throw ApiError.notFound(MESSAGES.POST_NOT_FOUND);
    }

    const isOwner = post.author.toString() === user._id.toString();
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden(MESSAGES.FORBIDDEN);
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    return post;
  }
}

export default PostService;
