'use client';

import { Heart, MessageSquare, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { ForumPost, ForumReply } from '@/lib/types';

type ForumReplyFeedItem = {
  id: string;
  author: string;
  avatar: string | null;
  initial: string;
  message: string;
  createdAt: string;
};

type ForumFeedItem = {
  id: string;
  author: string;
  avatar: string | null;
  initial: string;
  message: string;
  likes: number;
  likeId: string | null;
  likedByCurrentUser: boolean;
  createdAt: string;
  replies: ForumReplyFeedItem[];
};

const normalizeProfile = (value: any) => {
  if (!value) return null;
  if (Array.isArray(value) && value.length > 0) {
    const candidate = value[0];
    if (!candidate) return null;
    return {
      display_name: candidate.display_name ?? null,
      profile_image_url: candidate.profile_image_url ?? null,
    };
  }

  return {
    display_name: value.display_name ?? null,
    profile_image_url: value.profile_image_url ?? null,
  };
};

const normalizePost = (row: any): ForumPost => {
  const profile = normalizeProfile(row.profiles);

  const likes = Array.isArray(row.forum_post_likes)
    ? row.forum_post_likes.map((like: any) => ({
        id: like.id as string,
        user_id: like.user_id as string,
      }))
    : [];

  const replies = Array.isArray(row.forum_replies)
    ? row.forum_replies.map((reply: any) => ({
        id: reply.id as string,
        user_id: reply.user_id as string,
        post_id: reply.post_id as string,
        message: reply.message as string,
        created_at: reply.created_at as string,
        profiles: normalizeProfile(reply.profiles),
      }))
    : [];

  return {
    id: row.id,
    user_id: row.user_id,
    message: row.message,
    likes_count: row.likes_count ?? likes.length,
    created_at: row.created_at,
    profiles: profile,
    forum_post_likes: likes,
    forum_replies: replies,
  };
};

const mapReplyToFeedItem = (reply: ForumReply): ForumReplyFeedItem => {
  const displayName = reply.profiles?.display_name ?? 'Anonymous';
  const avatar = reply.profiles?.profile_image_url ?? null;
  const initial =
    displayName.trim().length > 0 ? displayName.trim().charAt(0).toUpperCase() : 'A';

  return {
    id: reply.id,
    author: displayName,
    avatar,
    initial,
    message: reply.message,
    createdAt: reply.created_at,
  };
};

const mapPostToFeedItem = (
  post: ForumPost,
  currentUserId: string | null
): ForumFeedItem => {
  const displayName = post.profiles?.display_name ?? 'Anonymous';
  const avatar = post.profiles?.profile_image_url ?? null;
  const initial =
    displayName.trim().length > 0 ? displayName.trim().charAt(0).toUpperCase() : 'A';

  const likes = post.forum_post_likes ?? [];
  const userLike = currentUserId
    ? likes.find((like) => like.user_id === currentUserId) ?? null
    : null;

  return {
    id: post.id,
    author: displayName,
    avatar,
    initial,
    message: post.message,
    likes: likes.length,
    likeId: userLike ? userLike.id : null,
    likedByCurrentUser: Boolean(userLike),
    createdAt: post.created_at,
    replies: (post.forum_replies ?? []).map(mapReplyToFeedItem),
  };
};

export default function ForumPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<ForumFeedItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);
  const [replyLoadingId, setReplyLoadingId] = useState<string | null>(null);

  const loadPosts = useCallback(
    async (currentUser: string | null) => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(
          'id, user_id, message, likes_count, created_at, profiles(display_name, profile_image_url), forum_post_likes(id, user_id), forum_replies(id, user_id, post_id, message, created_at, profiles(display_name, profile_image_url))'
        )
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Unable to load forum posts',
          description: error.message,
        });
        return;
      }

      const feedItems = (data ?? []).map((row) =>
        mapPostToFeedItem(normalizePost(row), currentUser)
      );
      setPosts(feedItems);
    },
    [toast]
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (error || !user) {
        router.replace('/login');
        return;
      }

      setUserId(user.id);
      await loadPosts(user.id);

      if (isMounted) {
        setIsLoading(false);
      }
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, [loadPosts, router]);

  const handlePost = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) {
      toast({
        variant: 'destructive',
        title: 'Empty message',
        description: 'Please write something before posting.',
      });
      return;
    }

    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'No active session',
        description: 'Please sign in again to post a message.',
      });
      return;
    }

    setIsPosting(true);

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: userId,
        message: trimmed,
      })
      .select(
        'id, user_id, message, likes_count, created_at, profiles(display_name, profile_image_url), forum_post_likes(id, user_id), forum_replies(id, user_id, post_id, message, created_at, profiles(display_name, profile_image_url))'
      )
      .single();

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Unable to post message',
        description: error?.message ?? 'Please try again later.',
      });
      setIsPosting(false);
      return;
    }

    setPosts((prev) => [
      mapPostToFeedItem(normalizePost(data), userId),
      ...prev,
    ]);

    toast({
      title: 'Message posted',
      description: 'Your message has been shared with the community.',
    });

    setNewMessage('');
    setIsPosting(false);
  };

  const handleToggleLike = async (postId: string) => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'No active session',
        description: 'Please sign in again to like a message.',
      });
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    setLikeLoadingId(postId);

    if (targetPost.likedByCurrentUser && targetPost.likeId) {
      const { error } = await supabase
        .from('forum_post_likes')
        .delete()
        .eq('id', targetPost.likeId);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Unable to remove like',
          description: error.message,
        });
        setLikeLoadingId(null);
        return;
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: Math.max(0, post.likes - 1),
                likedByCurrentUser: false,
                likeId: null,
              }
            : post
        )
      );
    } else {
      const { data, error } = await supabase
        .from('forum_post_likes')
        .insert({
          user_id: userId,
          post_id: postId,
        })
        .select('id, user_id')
        .single();

      if (error || !data) {
        toast({
          variant: 'destructive',
          title: 'Unable to add like',
          description: error?.message ?? 'Please try again later.',
        });
        setLikeLoadingId(null);
        return;
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: post.likes + 1,
                likedByCurrentUser: true,
                likeId: data.id,
              }
            : post
        )
      );
    }

    setLikeLoadingId(null);
  };

  const handleReplyChange = (postId: string, value: string) => {
    setReplyInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleSubmitReply = async (postId: string) => {
    const message = (replyInputs[postId] ?? '').trim();

    if (!message) {
      toast({
        variant: 'destructive',
        title: 'Empty reply',
        description: 'Please write something before replying.',
      });
      return;
    }

    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'No active session',
        description: 'Please sign in again to reply.',
      });
      return;
    }

    setReplyLoadingId(postId);

    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        user_id: userId,
        post_id: postId,
        message,
      })
      .select(
        'id, user_id, post_id, message, created_at, profiles(display_name, profile_image_url)'
      )
      .single();

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Unable to post reply',
        description: error?.message ?? 'Please try again later.',
      });
      setReplyLoadingId(null);
      return;
    }

    const newReply: ForumReplyFeedItem = mapReplyToFeedItem({
      id: data.id,
      user_id: data.user_id,
      post_id: data.post_id,
      message: data.message,
      created_at: data.created_at,
      profiles: normalizeProfile(data.profiles),
    });

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: [...post.replies, newReply],
            }
          : post
      )
    );

    setReplyInputs((prev) => ({
      ...prev,
      [postId]: '',
    }));

    toast({
      title: 'Reply posted',
      description: 'Thanks for supporting the community.',
    });

    setReplyLoadingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <span className="text-muted-foreground">Loading forum...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold font-headline">Community Forum</h1>
        <p className="text-muted-foreground">
          Share your journey and connect with others. You are not alone.
        </p>
      </header>

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Share something with the group..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isPosting}
            />
            <Button size="icon" onClick={() => void handlePost()} disabled={isPosting}>
              <Send className={isPosting ? 'animate-pulse' : ''} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both">
            <CardContent className="p-6 text-center text-muted-foreground">
              No messages yet—be the first to share something encouraging.
            </CardContent>
          </Card>
        ) : (
          posts.map((post, index) => (
            <Card
              key={post.id}
              className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {post.avatar ? (
                      <AvatarImage src={post.avatar} alt={post.author} />
                    ) : (
                      <AvatarFallback>{post.initial}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-2">
                <p className="text-foreground/90">{post.message}</p>
              </CardContent>
              <CardFooter className="p-4 flex justify-between">
                <div className="flex gap-4">
                  <Button
                    variant={post.likedByCurrentUser ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => void handleToggleLike(post.id)}
                    disabled={likeLoadingId === post.id}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        post.likedByCurrentUser ? 'fill-current' : ''
                      }`}
                    />
                    <span>{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2" disabled>
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.replies.length}</span>
                  </Button>
                </div>
              </CardFooter>
              <div className="px-4 pb-4 space-y-4">
                {post.replies.length > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          {reply.avatar ? (
                            <AvatarImage src={reply.avatar} alt={reply.author} />
                          ) : (
                            <AvatarFallback>{reply.initial}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{reply.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleString()}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{reply.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Offer encouragement or share your thoughts..."
                    value={replyInputs[post.id] ?? ''}
                    onChange={(event) => handleReplyChange(post.id, event.target.value)}
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => void handleSubmitReply(post.id)}
                      disabled={replyLoadingId === post.id}
                    >
                      {replyLoadingId === post.id ? 'Sending...' : 'Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
